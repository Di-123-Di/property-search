-- Week 9 performance work. See PERFORMANCE.md at the repo root for the
-- EXPLAIN output that motivated these two indexes and the before/after
-- measurements.
--
-- Run this after importing rets_property.sql — the dump only carries the
-- feed's own indexes, not these.
--
-- The dump originates from MariaDB, where `active_check` is declared as
-- `timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'`. MySQL 8's default
-- sql_mode includes NO_ZERO_DATE, so adding an index (which rebuilds the
-- table and re-validates every column definition) fails with
-- "Invalid default value for 'active_check'" even though the indexes
-- themselves are unrelated to that column. Relaxing sql_mode for this
-- session only sidesteps the re-validation; it changes nothing globally
-- and nothing about the data.
SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION';

-- Every filter query wraps the city column as LOWER(TRIM(L_City)) for
-- case/whitespace-insensitive matching. A plain B-tree index on L_City
-- (idx_L_City, added in Week 3) can't be used to satisfy a condition on a
-- function of that column, so city searches have always been a full table
-- scan. This functional index matches the exact expression used in the
-- WHERE clause, and also covers price so it can serve ORDER BY/range
-- queries on price without a separate filesort.
CREATE INDEX idx_city_norm_price ON rets_property ((LOWER(TRIM(L_City))), L_SystemPrice);

-- Supports filtering/sorting by price combined with a minimum beds count,
-- and plain price sorting (GET /api/properties?sortBy=price) when no city
-- filter is given.
CREATE INDEX idx_price_beds ON rets_property (L_SystemPrice, L_Keyword2);
