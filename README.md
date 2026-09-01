# IDX Property Search

A property search application backed by real MLS data: searchable and
filterable listings, a detail page with a photo gallery and an embedded
Google map, open house schedules, sorting, and localStorage-backed
favorites.

<!-- TODO: replace with an actual screenshot of the listings page.
     Run the app locally (see "Local Setup" below), take a screenshot of
     http://localhost:3000, and drop it in here, e.g.:
     ![Listings page](docs/screenshot.png) -->

## Features

- Searchable, filterable property listings (city, ZIP, price range, beds, baths)
- Sorting by price, date listed, square footage, or beds
- Pagination with page-number, ellipsis, and Previous/Next controls
- Property detail page: price, address, stats, description, property
  details, and open houses
- Photo carousel on listing cards and a full photo gallery with a
  keyboard-navigable lightbox on the detail page
- Embedded Google map (Maps Embed API) with a "Get Directions" link
- Favorites, persisted in the browser via `localStorage`
- An error boundary that shows a recovery screen instead of a blank page
  if a component crashes while rendering

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React (Create React App) | 19.2.7 |
| Routing | react-router-dom | 6.28.2 |
| Backend | Node.js + Express | Node 20+ LTS, Express 5.2.1 |
| Database | MySQL | 8.x |
| DB driver | mysql2 (promise API) | 3.22.5 |
| Frontend testing | Jest (via react-scripts) + React Testing Library | react-scripts 5.0.1 |
| Backend testing | Jest + Supertest | Jest 30.5.0, Supertest 7.2.2 |

## Local Setup

These steps assume a fresh machine with nothing installed yet.

### Prerequisites

- Node.js 20 LTS or newer, and npm
- A MySQL 8 server, reachable on `localhost` — install it however you
  prefer (native installer, Homebrew, Docker). These instructions only
  assume you can run the `mysql` CLI against it; how the server itself
  got there doesn't matter.
- Git
- A Google Cloud account (free) to generate a Maps Embed API key — see
  step 5 below. The app runs without one, but the map on the property
  detail page won't render.

### 1. Clone the repository

```bash
git clone https://github.com/Di-123-Di/property-search.git
cd property-search
```

### 2. Create the database and import the data

Create an empty database (name it whatever you like — `idx_exchange` is
what this project's own `.env` uses):

```bash
mysql -u root -p -e "CREATE DATABASE idx_exchange;"
```

This project's data comes from two SQL dumps, `rets_property.sql` and
`rets_openhouse.sql` (real MLS listing data — obtain these from whoever
gave you access to the project; they are not committed to this repo).
Import them into the database you just created:

```bash
mysql -u root -p idx_exchange < rets_property.sql
mysql -u root -p idx_exchange < rets_openhouse.sql
```

Verify the import:

```bash
mysql -u root -p idx_exchange -e "SELECT COUNT(*) FROM rets_property; SELECT COUNT(*) FROM rets_openhouse;"
```

### 3. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=idx_exchange
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The server runs on **port 5000**. Verify it's up at
`http://localhost:5000/api/health` — you should see
`{"status":"ok","database":"connected"}`.

### 4. Get a Google Maps Embed API key

The property detail page embeds a map using the Google Maps Embed API.
To get a key:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
   and sign in.
2. Create a new project (any name).
3. Go to **APIs & Services → Library**, search for **Maps Embed API**,
   and click **Enable**.
4. Go to **APIs & Services → Credentials → Create Credentials → API key**.
   Copy the key.
5. Click into the new key and add restrictions (recommended, not
   required to make it work locally):
   - **Application restrictions → Websites** → add `http://localhost:3000/*`
   - **API restrictions → Restrict key** → select only **Maps Embed API**
6. Save.

### 5. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
REACT_APP_GOOGLE_MAPS_API_KEY=the_key_you_just_created
```

Start the frontend:

```bash
npm start
```

The app runs on **port 3000** at `http://localhost:3000`. React env
variables must start with `REACT_APP_` to be readable in the browser, and
the dev server must be restarted after editing `.env` for changes to
take effect.

### One-command alternative

Once both `.env` files exist, `./demo.sh` (in the repo root) starts the
backend and frontend together and prints their URLs. Press `Ctrl+C` to
stop both.

---

## Data Flow

```
React (port 3000) → Express API (port 5000) → MySQL (port 3306)
```

React never connects directly to MySQL. All data goes through the
Express API, and the frontend dev server proxies `/api/*` requests to
port 5000 (see the `proxy` field in `frontend/package.json`).

---

## API Reference

### Health Check

```
GET /api/health
```

**Response (200):**
```json
{ "status": "ok", "database": "connected" }
```

**Response (500):**
```json
{ "status": "error", "database": "disconnected" }
```

---

### List Properties

```
GET /api/properties
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `city` | string | Filter by city (case- and whitespace-insensitive) |
| `zipcode` | string | Filter by exact ZIP code |
| `minPrice` | number | Minimum listing price |
| `maxPrice` | number | Maximum listing price |
| `beds` | number | Minimum number of bedrooms |
| `baths` | number | Minimum number of bathrooms |
| `limit` | number | Results per page (default 20, must be 1–100) |
| `offset` | number | Pagination offset (default 0, must be ≥ 0) |
| `sortBy` | string | One of `price`, `dateListed`, `sqft`, `beds` |
| `sortOrder` | string | `asc` or `desc` (default `asc`) |

`sortBy` accepts friendly names, not raw SQL column names — the API maps
them internally (`price` → `L_SystemPrice`, etc.) against a whitelist, so
a client can never influence which SQL column gets sorted on other than
through that fixed set of four options.

**Example Request:**
```
GET /api/properties?city=Irvine&minPrice=500000&beds=3&sortBy=price&sortOrder=asc&limit=20&offset=0
```

**Example Response (200):**
```json
{
  "total": 87,
  "limit": 20,
  "offset": 0,
  "results": [
    {
      "L_ListingID": "1118422731",
      "L_Address": "1461 Laurel Way",
      "L_City": "Beverly Hills",
      "L_State": "CA",
      "L_Zip": "90210",
      "L_SystemPrice": 3950000,
      "L_Keyword2": 4,
      "LM_Dec_3": "5.0",
      "LM_Int2_3": 3677,
      "L_Photos": "[\"https://...\"]",
      "LMD_MP_Latitude": "34.099106000000000",
      "LMD_MP_Longitude": "-118.418132000000000"
    }
  ]
}
```

**Error (400)** — invalid filter value, out-of-range `limit`/`offset`, or
an unrecognized `sortBy`/`sortOrder`:
```json
{ "error": "minPrice must be a valid number" }
```

---

### Get Property by ID

```
GET /api/properties/:id
```

`:id` is the listing's `L_ListingID`, not the internal database `id`.

**Response (200):** the full property row.

**Response (404):**
```json
{ "error": "Property not found" }
```

**Response (400)** — id is missing or unreasonably long:
```json
{ "error": "Invalid listing ID" }
```

---

### Get Open Houses for a Property

```
GET /api/properties/:id/openhouses
```

**Response (200):**
```json
[
  {
    "L_ListingID": "1077426281",
    "OpenHouseDate": "2026-06-16",
    "OH_StartTime": "09:00:00",
    "OH_EndTime": "23:00:00",
    "all_data": "{\"OpenHouseRemarks\": \"This Beautiful Family Home is Move In Ready\"}"
  }
]
```

Ordered by date and start time. Returns an empty array if the property
exists but has no open houses scheduled. The remarks shown in the UI are
parsed out of the `all_data` JSON blob on the frontend — `all_data`
contains the full raw feed record, and `OpenHouseRemarks` is just one key
inside it, not its own column.

**Response (404)** — the property itself doesn't exist:
```json
{ "error": "Property not found" }
```

---

## Database Schema

### `rets_property`

The main listings table. Column names come from the RETS/RESO feed this
data was originally imported from, not from any naming convention chosen
for this project.

| Column | Description |
|--------|-------------|
| `id` | Internal auto-increment primary key |
| `L_ListingID` | Public listing identifier — what the API uses as `:id` |
| `L_Address` / `L_City` / `L_State` / `L_Zip` | Address fields |
| `L_SystemPrice` | Listing price |
| `L_Keyword2` | Number of bedrooms |
| `LM_Dec_3` | Number of bathrooms |
| `LM_Int2_3` | Square footage |
| `L_Photos` | JSON array of photo URLs (as a string — parse with `JSON.parse`) |
| `LMD_MP_Latitude` / `LMD_MP_Longitude` | Coordinates for the map |
| `L_Remarks` | Listing description |
| `YearBuilt` | Year built |
| `L_Type_` | Property type (e.g. `SingleFamilyResidence`) |
| `L_Status` | Listing status (e.g. `Active`) |
| `ListingContractDate` | Date the listing went on the market — what `sortBy=dateListed` sorts on |

Indexed columns: `L_ListingID`, `L_City`, `L_Zip`, `L_DisplayId`, and a
full-text index on `L_Remarks`. See `PERFORMANCE.md` for `EXPLAIN`
output and the reasoning behind these indexes.

### `rets_openhouse`

| Column | Description |
|--------|-------------|
| `L_ListingID` | References `rets_property.L_ListingID` (no formal foreign key constraint) |
| `OpenHouseDate` | Date of the open house |
| `OH_StartTime` / `OH_EndTime` | Start and end time |
| `all_data` | JSON blob of the full raw feed record, including `OpenHouseRemarks` |

Note: these two tables come from separate data snapshots, so a
`L_ListingID` that exists in `rets_openhouse` is not guaranteed to also
exist in `rets_property` (or vice versa) — the API's 404 handling
accounts for this.

---

## Project Structure

```
property-search/
├── backend/
│   ├── routes/
│   │   ├── properties.js       # all /api/properties route handlers
│   │   └── properties.test.js  # Jest + Supertest, DB pool mocked
│   ├── middleware/
│   │   └── logger.js           # logs method, path, status, and response time
│   ├── db/
│   │   └── performance-indexes.sql
│   ├── db.js                   # mysql2 connection pool
│   ├── server.js               # Express app entry point
│   └── .env                    # not committed
├── frontend/
│   └── src/
│       ├── api/                # fetch wrappers for the backend API
│       ├── components/         # presentational + reusable components
│       ├── pages/               # top-level routed pages
│       ├── hooks/               # custom hooks (useFavorites) and its context
│       ├── utils/                # small pure helpers (e.g. photo URL parsing)
│       └── App.js               # route definitions
├── .github/
│   └── pull_request_template.md
├── PERFORMANCE.md               # EXPLAIN analysis and indexing notes
├── demo.sh                      # starts backend + frontend together
├── .gitignore
└── README.md
```

---

## Running Tests

```bash
# Backend — Jest + Supertest, database pool mocked, no real DB needed
cd backend
npm test

# Frontend — Jest + React Testing Library
cd frontend
npm test -- --watchAll=false --coverage
```

Both suites are configured to enforce a 70% statement/line coverage
threshold (see the `jest` key in each `package.json`) and both currently
run well above it. `npm run lint` (in `frontend/`) runs ESLint against
`src/`.

---

## Contributing / Git Workflow

All work happens on feature branches cut from `develop`, merged back into
`develop` via pull request — `main` only receives changes when `develop`
is promoted at a release point. Commit messages follow the
[Conventional Commits](https://www.conventionalcommits.org/) format:
`type(scope): short description`, where `type` is one of `feat`, `fix`,
`refactor`, `test`, `docs`, or `chore`. See
`.github/pull_request_template.md` for the checklist every PR should
satisfy before merging.

---

## Known Issues & Future Improvements

- **Some listing photo URLs return 404.** `L_Photos` stores signed URLs
  from the original MLS media provider, and some of those signatures
  have since expired — this is a property of the data snapshot, not a
  bug in the gallery/carousel code. The photo components handle a
  missing/broken `L_Photos` value gracefully (fall back to "No Photo"),
  but they can't recover an individual broken URL within an otherwise
  valid array.
- **`rets_property` and `rets_openhouse` are separate snapshots.** A
  listing ID present in one table isn't guaranteed to exist in the
  other; the open-house endpoint's 404 handling is based only on
  `rets_property`.
- **`L_Photos` is not always valid JSON** — parsing falls back to an
  empty array on failure rather than throwing.
- **Some properties have a null latitude/longitude** — the map component
  only renders when both are present.
- **City names have inconsistent casing/whitespace in the data** —
  filtering normalizes with `LOWER(TRIM(...))` on both sides of the
  comparison.

### Future Improvements

- Deploy to a cloud host (frontend + backend + managed MySQL)
- Server-side accounts and favorites (currently `localStorage`-only, so
  favorites don't follow you across browsers/devices)
- Natural-language search (parse a plain-English query into filters)
- Map-based polygon/radius search
