# IDX Property Search

A Zillow/Redfin-style property search application backed by real MLS data, built during the IDX Exchange SDE Internship.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React (Create React App) | 18.x |
| Backend | Node.js + Express | 20.x LTS / 4.x |
| Database | MySQL 8 (Docker) | 8.4 |
| Testing | Jest + React Testing Library + Supertest | latest |
| ORM/Driver | mysql2/promise | latest |

## Features

- Searchable, filterable property listings with pagination
- Property detail page with photo gallery, lightbox, and Google Maps embed
- Open house schedule per listing
- Natural language search powered by Claude AI
- Favorites system with localStorage persistence
- Sorting by price, date listed, square footage, and beds
- 70%+ test coverage on critical paths

## Local Setup

### Prerequisites

- Node.js (LTS) and npm
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Di-123-Di/property-search.git
cd property-search
```

### 2. Start the MySQL database

```bash
docker run -d \
  --name idx-mysql-local \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=rets \
  -p 3306:3306 \
  mysql:8
```

### 3. Import the database tables

Obtain `rets_property.sql` and `rets_openhouse.sql` from your Team Lead, then import:

```bash
docker exec -i idx-mysql-local mysql -u root -prootpass rets < rets_property.sql
docker exec -i idx-mysql-local mysql -u root -prootpass rets < rets_openhouse.sql
```

Verify the import:

```bash
docker exec -it idx-mysql-local mysql -u root -prootpass rets -e "SELECT COUNT(*) FROM rets_property; SELECT COUNT(*) FROM rets_openhouse;"
```

### 4. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpass
DB_NAME=rets
PORT=5000
ANTHROPIC_API_KEY=your_anthropic_key_here
```

Start the backend:

```bash
npm run dev
```

The server runs on **port 5000**. Verify at `http://localhost:5000/api/health`.

### 5. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

Start the frontend:

```bash
npm start
```

The app runs on **port 3000** at `http://localhost:3000`.

---

## Data Flow

```
React (port 3000) → Express API (port 5000) → MySQL (port 3306)
```

React never connects directly to MySQL. All data goes through the Express API.

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
| `city` | string | Filter by city (case-insensitive) |
| `zipcode` | string | Filter by ZIP code |
| `minPrice` | number | Minimum listing price |
| `maxPrice` | number | Maximum listing price |
| `beds` | number | Minimum number of bedrooms |
| `baths` | number | Minimum number of bathrooms |
| `limit` | number | Results per page (default: 20, max: 100) |
| `offset` | number | Pagination offset (default: 0) |
| `sortBy` | string | `L_SystemPrice`, `LM_Int2_3`, `L_Keyword2` |
| `sortOrder` | string | `ASC` or `DESC` |

**Example Request:**
```
GET /api/properties?city=Portland&minPrice=300000&beds=3&limit=20&offset=0
```

**Response (200):**
```json
{
  "total": 87,
  "limit": 20,
  "offset": 0,
  "results": [
    {
      "L_ListingID": "ABC123",
      "L_Address": "123 Main St",
      "L_City": "Portland",
      "L_State": "OR",
      "L_Zip": "97201",
      "L_SystemPrice": 450000,
      "L_Keyword2": 3,
      "LM_Dec_3": 2,
      "LM_Int2_3": 1800,
      "L_Photos": "[\"https://...\"]",
      "LMD_MP_Latitude": 45.5051,
      "LMD_MP_Longitude": -122.6750
    }
  ]
}
```

**Error (400):**
```json
{ "error": "minPrice must be a valid number" }
```

---

### Get Property by ID

```
GET /api/properties/:id
```

**Response (200):** Full property object

**Response (404):**
```json
{ "error": "Property not found" }
```

**Response (400):**
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
    "L_ListingID": "ABC123",
    "OpenHouseDate": "2026-07-15",
    "OH_StartTime": "13:00:00",
    "OH_EndTime": "15:00:00",
    "all_data": "{\"OpenHouseRemarks\": \"Refreshments provided\"}"
  }
]
```

Open houses are ordered by date and start time. Returns an empty array if none scheduled.

---

### Natural Language Search

```
POST /api/search/natural
```

**Request Body:**
```json
{ "query": "3 bedroom house in Beverly Hills under $800k built after 2000" }
```

**Response (200):**
```json
{
  "interpreted": {
    "city": "Beverly Hills",
    "beds": 3,
    "maxPrice": 800000,
    "minYearBuilt": 2000
  },
  "total": 12,
  "results": [...]
}
```

**Response (422):**
```json
{ "error": "Could not extract valid search filters from your query. Try being more specific." }
```

---

## Database Schema

### rets_property

| Column | Description |
|--------|-------------|
| `L_ListingID` | Unique listing identifier |
| `L_Address` | Street address |
| `L_City` | City |
| `L_State` | State abbreviation |
| `L_Zip` | ZIP code |
| `L_SystemPrice` | Listing price |
| `L_Keyword2` | Number of bedrooms |
| `LM_Dec_3` | Number of bathrooms |
| `LM_Int2_3` | Square footage |
| `L_Photos` | JSON array of photo URLs |
| `LMD_MP_Latitude` | Latitude for map |
| `LMD_MP_Longitude` | Longitude for map |
| `L_Remarks` | Property description |
| `YearBuilt` | Year built |
| `LotSizeAcres` | Lot size in acres |

### rets_openhouse

| Column | Description |
|--------|-------------|
| `L_ListingID` | Foreign key → rets_property |
| `OpenHouseDate` | Date of open house |
| `OH_StartTime` | Start time |
| `OH_EndTime` | End time |
| `all_data` | JSON blob containing `OpenHouseRemarks` |

---

## Project Structure

```
property-search/
├── backend/
│   ├── routes/
│   │   ├── properties.js
│   │   └── search.js
│   ├── middleware/
│   │   └── logger.js
│   ├── db.js
│   ├── server.js
│   └── .env (not committed)
├── frontend/
│   └── src/
│       ├── api/client.js
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── utils/
├── .gitignore
└── README.md
```

---

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# With coverage
npm test -- --coverage
```

Both suites achieve 70%+ line coverage on critical paths.

---

## Known Issues & Future Improvements

- `L_Photos` is not always valid JSON — handled with try/catch fallback
- Some properties have null lat/lon — map renders conditionally
- City names have inconsistent casing in the database — normalized with `LOWER(TRIM())`
- Image URLs for sold properties may expire — obtain fresh SQL files from Team Lead before presenting

### Future Improvements

- Deploy to cloud (Render + Railway + Vercel)
- Add user authentication and server-side favorites
- Support natural language follow-up queries ("show me cheaper ones")
- Add map-based polygon search
