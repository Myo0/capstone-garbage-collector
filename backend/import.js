/**
 * One-time import script — populates the database from the ArcGIS JSON exports.
 *
 * Usage (from the backend/ directory):
 *   node import.js
 *
 * Requires DATABASE_URL to be set in ../.env or as an environment variable.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Maps coded ColDay values from the schedule file to readable labels
const COL_DAY_MAP = {
  '0': null,
  '1': 'Day 1',
  '2': 'Day 2',
  '3': 'Day 3',
  '4': 'Day 4',
  '5': 'Day 5',
};

async function run() {
  const client = await pool.connect();

  try {
    console.log('Reading data files...');
    const schedulePath  = path.join(__dirname, '../query.json');
    const addressesPath = path.join(__dirname, '../query (1).json');

    const scheduleData  = JSON.parse(fs.readFileSync(schedulePath,  'utf8'));
    const addressesData = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

    await client.query('BEGIN');

    // --- 1. Clear existing data ---
    await client.query('TRUNCATE addresses, collection_dates RESTART IDENTITY CASCADE');
    console.log('Cleared existing data.');

    // --- 2. Insert all 2026 dates from query.json ---
    console.log('Importing collection schedule...');
    for (const { attributes: a } of scheduleData.features) {
      const collectionDay = COL_DAY_MAP[a.ColDay] ?? null;
      await client.query(
        `INSERT INTO collection_dates (date, day_of_week, collection_day, rec_type)
         VALUES ($1, $2, $3, NULL)`,
        [a.Date, a.DayWeek, collectionDay]
      );
    }

    // --- 3. Update rec_type using query (1).json ---
    // Build a map of (date + collection_day) → rec_type so we only hit the DB once per unique combo
    console.log('Updating recycling stream info...');
    const recTypeMap = new Map();
    for (const { attributes: a } of addressesData.features) {
      const key = `${a.Date}|${a.ColDay}`;
      if (!recTypeMap.has(key)) {
        recTypeMap.set(key, { date: a.Date, collectionDay: a.ColDay, recType: a.RecType });
      }
    }
    for (const { date, collectionDay, recType } of recTypeMap.values()) {
      await client.query(
        `UPDATE collection_dates SET rec_type = $1
         WHERE date = $2 AND collection_day = $3`,
        [recType, date, collectionDay]
      );
    }

    // --- 4. Fetch all unique addresses from ArcGIS API with pagination ---
    console.log('Fetching all addresses from ArcGIS...');
    const ARCGIS_URL = 'https://services6.arcgis.com/QbvsPWz7l84RRwMO/arcgis/rest/services/Garbage_and_Recycling/FeatureServer/2/query';
    const PAGE_SIZE = 1000;
    let offset = 0;
    let totalFetched = 0;
    const seenAids = new Set();

    while (true) {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: 'AID,FullAddress,ColDay',
        returnDistinctValues: 'true',
        resultOffset: offset,
        resultRecordCount: PAGE_SIZE,
        f: 'json',
      });

      const resp = await fetch(`${ARCGIS_URL}?${params}`);
      const data = await resp.json();

      if (!data.features || data.features.length === 0) break;

      for (const { attributes: a } of data.features) {
        if (!a.AID || seenAids.has(a.AID)) continue;
        seenAids.add(a.AID);
        await client.query(
          `INSERT INTO addresses (aid, full_address, collection_day)
           VALUES ($1, $2, $3)
           ON CONFLICT (aid) DO NOTHING`,
          [a.AID, a.FullAddress, a.ColDay]
        );
      }

      totalFetched += data.features.length;
      console.log(`  Fetched ${totalFetched} address records so far...`);

      if (data.features.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    await client.query('COMMIT');
    console.log(`Done. Imported ${scheduleData.features.length} schedule entries and ${seenAids.size} addresses.`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed — rolled back.', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
