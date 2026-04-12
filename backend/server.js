import express, { json } from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(json());

// Health check
app.get('/', (req, res) => {
  res.send('Backend server is running');
});

/**
 * GET /api/search?q=PARTIAL_ADDRESS
 * Returns up to 10 addresses matching the query string.
 */
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  try {
    const result = await pool.query(
      `SELECT aid, full_address, collection_day
       FROM addresses
       WHERE LOWER(full_address) LIKE LOWER($1)
       ORDER BY full_address
       LIMIT 10`,
      [`%${q.trim()}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/address/:aid
 * Returns collection info for a specific address ID:
 *   - The address record
 *   - Last collection date
 *   - Next collection date
 *   - Next 5 upcoming collection dates
 */
app.get('/api/address/:aid', async (req, res) => {
  const { aid } = req.params;

  try {
    const addrResult = await pool.query(
      'SELECT aid, full_address, collection_day FROM addresses WHERE aid = $1',
      [aid]
    );

    if (!addrResult.rows.length) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const address = addrResult.rows[0];
    const today = new Date().toISOString().split('T')[0];

    const [lastResult, upcomingResult] = await Promise.all([
      pool.query(
        `SELECT date, day_of_week, rec_type
         FROM collection_dates
         WHERE collection_day = $1 AND date < $2
         ORDER BY date DESC
         LIMIT 1`,
        [address.collection_day, today]
      ),
      pool.query(
        `SELECT date, day_of_week, rec_type
         FROM collection_dates
         WHERE collection_day = $1 AND date >= $2
         ORDER BY date ASC
         LIMIT 5`,
        [address.collection_day, today]
      ),
    ]);

    res.json({
      address,
      lastCollection:       lastResult.rows[0]    ?? null,
      nextCollection:       upcomingResult.rows[0] ?? null,
      upcomingCollections:  upcomingResult.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
