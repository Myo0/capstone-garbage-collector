-- Corner Brook Garbage Collection Database Schema

CREATE TABLE IF NOT EXISTS addresses (
  aid           INTEGER      PRIMARY KEY,
  full_address  VARCHAR(255) NOT NULL,
  collection_day VARCHAR(10) NOT NULL  -- 'Day 1' through 'Day 5'
);

CREATE TABLE IF NOT EXISTS collection_dates (
  id             SERIAL       PRIMARY KEY,
  date           DATE         NOT NULL,
  day_of_week    VARCHAR(10),
  collection_day VARCHAR(10),          -- NULL = no collection, 'Day 1'-'Day 5' = collection day
  rec_type       VARCHAR(20)           -- 'Fibres', 'Containers', or NULL
);

-- Speed up address search
CREATE INDEX IF NOT EXISTS idx_addresses_lower
  ON addresses (LOWER(full_address));

-- Speed up schedule lookups by day and date
CREATE INDEX IF NOT EXISTS idx_collection_dates_day_date
  ON collection_dates (collection_day, date);
