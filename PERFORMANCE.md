# Week 9 Performance Notes

## The query under test

The most complex query the API can build is a combined filter + sort, e.g.
`GET /api/properties?city=Los+Angeles&minPrice=500000&maxPrice=2000000&beds=3&sortBy=price&sortOrder=asc`,
which becomes:

```sql
SELECT * FROM rets_property
WHERE LOWER(TRIM(L_City)) = LOWER(TRIM(?))
  AND L_SystemPrice >= ? AND L_SystemPrice <= ?
  AND L_Keyword2 >= ?
ORDER BY L_SystemPrice ASC
LIMIT 20 OFFSET 0
```

## How to read an EXPLAIN row

Running `EXPLAIN <query>` shows the execution plan MySQL picked, one row per
table involved (here, just one table). What each column means:

| Column | Meaning |
|---|---|
| `id` | Which SELECT this row belongs to (all 1 here — no subqueries/joins). |
| `select_type` | The kind of query (`SIMPLE` = no subquery/union). |
| `table` | Which table this row describes. |
| `type` | **The most important column.** The join/access strategy, from best to worst: `system`/`const` (single row) → `eq_ref`/`ref` (index lookup) → `range` (index range scan) → `index` (full index scan) → `ALL` (full table scan). `ALL` means MySQL reads every row in the table. |
| `possible_keys` | Indexes MySQL *could* have used for this query. `null` means none of the existing indexes even apply. |
| `key` | The index MySQL *actually* used. `null` means no index was used at all. |
| `key_len` | How many bytes of the chosen index are used — useful for checking whether a composite index is being used fully or only its leftmost part. |
| `rows` | MySQL's *estimate* of how many rows it will examine (not the number returned — this is before the WHERE filter narrows it down further). |
| `filtered` | Estimated percentage of the `rows` above that actually pass the WHERE conditions. |
| `Extra` | Extra detail. Two to watch for: `Using filesort` (MySQL had to sort the results manually because no index already produced them in order) and `Using where` (a filter is applied after the storage engine returns rows, i.e. the index alone didn't narrow things down). |

`EXPLAIN ANALYZE` goes further: it actually runs the query and reports real
elapsed time and real row counts (`actual time=...`, `rows=... loops=...`),
not just the optimizer's estimate. That's what the timings below come from.

## Before: no index covers this query

```
id  select_type  table          type  possible_keys  key   key_len  ref   rows   filtered  Extra
1   SIMPLE       rets_property  ALL   null           null  null     null  35735  3.7       Using where; Using filesort
```

`type=ALL` and `key=null` mean MySQL scanned the **entire table** (all
53,122 rows) and manually sorted the leftover matches afterward
(`Using filesort`). `EXPLAIN ANALYZE` confirms it: **~418ms** actual time,
53,122 rows read from disk to find the 1,170 that matched, sorted, and
`LIMIT`ed down to 20.

### A second finding while investigating: the existing city index was dead

`rets_property` already had `idx_L_City` on `L_City`, added back in Week 3.
Running EXPLAIN on a city-only filter showed `type=ALL, key=null` too —
that index has **never once been used**, because every query filters on
`LOWER(TRIM(L_City))` (for case/whitespace-insensitive matching), and a
plain B-tree index on the raw column can't satisfy a condition on a
*function* of that column. This has been a full table scan on every city
search since Week 3.

## The fix: two composite indexes

See [`backend/db/performance-indexes.sql`](backend/db/performance-indexes.sql).

```sql
-- Matches the exact LOWER(TRIM(L_City)) expression used in every query
-- (a "functional index"), and includes L_SystemPrice so it can also serve
-- the price range/sort without a separate filesort.
CREATE INDEX idx_city_norm_price ON rets_property ((LOWER(TRIM(L_City))), L_SystemPrice);

-- Serves price range + minimum-beds queries, and plain price sorting,
-- when no city filter is given.
CREATE INDEX idx_price_beds ON rets_property (L_SystemPrice, L_Keyword2);
```

These two were picked because city+price and price+beds are the most
natural combinations from the actual filter form (`PropertyFilters`), and
price is now the primary sortable column added this week.

## After: measured improvement

**Combined query (city + price range + beds + sort by price):**

```
id  select_type  table          type   possible_keys                        key                   key_len  ref   rows  filtered  Extra
1   SIMPLE       rets_property  range  idx_price_beds,idx_city_norm_price  idx_city_norm_price   208      null  2238  33.33     Using where
```

`type` went from `ALL` to `range`, and `Using filesort` is gone entirely —
the index already returns rows in price order. `EXPLAIN ANALYZE`:
**~3.4ms** actual time (down from ~418ms — about **123x faster**).

**City-only query:**

```
id  select_type  table          type  possible_keys          key                   key_len  ref      rows  filtered  Extra
1   SIMPLE       rets_property  ref   idx_city_norm_price    idx_city_norm_price   203      const    3444  100       (none)
```

`type=ref` with an exact row estimate (3,444, the real count of Los Angeles
listings) instead of a full 35,735-row guess — the dead index problem is
fixed.

**Price + beds, sorted, no city filter** (measured by forcing a full scan
with `IGNORE INDEX` for a fair before/after comparison, since dropping the
real index just to re-measure wasn't necessary):

- Before (forced full scan): **~403ms**
- After (`idx_price_beds`, `type=range`): **~1.0ms** — about **400x faster**

## Known limitation / future work

Sorting by `dateListed` (`ListingContractDate`) or `sqft` (`LM_Int2_3`)
alone still triggers `Using filesort` — no index covers those yet. They
weren't added because there's no evidence (from the filter form or usage)
that those are common enough to justify the extra write overhead and
storage of two more composite indexes; if usage data later shows otherwise,
`(ListingContractDate)` and `(LM_Int2_3)` would be the next candidates.

## A note on the legacy `active_check` column

Adding these indexes initially failed with `ERROR 1067: Invalid default
value for 'active_check'`. That column is a `timestamp NOT NULL DEFAULT
'0000-00-00 00:00:00'` — a zero-date default that was allowed under an
older, more permissive `sql_mode` when the table was first created, but is
rejected by the current strict mode (`NO_ZERO_DATE`) whenever MySQL has to
rebuild the table definition, which `CREATE INDEX` does. The indexes were
created with `NO_ZERO_DATE`/`STRICT_TRANS_TABLES` temporarily relaxed for
that one session; `active_check` itself was never modified.
