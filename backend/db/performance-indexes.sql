-- Week 9 performance work. See PERFORMANCE.md at the repo root for the
-- EXPLAIN output that motivated these two indexes and the before/after
-- measurements.

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
