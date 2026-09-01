const express = require("express");
const request = require("supertest");

// Replacing the whole `../db` module with a plain object whose `query`
// method is a jest.fn() means these tests never open a real MySQL
// connection — every response is controlled directly by the test.
jest.mock("../db", () => ({
  query: jest.fn(),
}));

const pool = require("../db");
const propertiesRouter = require("./properties");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/properties", propertiesRouter);
  return app;
}

const app = buildApp();

beforeEach(() => {
  pool.query.mockReset();
});

describe("GET /api/properties", () => {
  test("returns paginated results on success", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 2 }]])
      .mockResolvedValueOnce([[{ id: 1, L_Address: "1 Main St" }, { id: 2, L_Address: "2 Main St" }]]);

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 2,
      limit: 20,
      offset: 0,
      results: [{ id: 1, L_Address: "1 Main St" }, { id: 2, L_Address: "2 Main St" }],
    });
  });

  test("honors custom limit and offset", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 50 }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties?limit=5&offset=10");

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(5);
    expect(res.body.offset).toBe(10);
    // The data query is always called with [...filterValues, limit, offset]
    // as its last two bind parameters.
    const dataQueryCall = pool.query.mock.calls[1];
    expect(dataQueryCall[1]).toEqual([5, 10]);
  });

  // Regression test: `parseInt(req.query.limit) || 20` used to treat an
  // explicit limit=0 as "no limit given" (0 is falsy), silently replacing
  // it with the default of 20 instead of rejecting it.
  test("rejects a limit of 0", async () => {
    const res = await request(app).get("/api/properties?limit=0");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/limit must be between 1 and 100/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("rejects a limit over 100", async () => {
    const res = await request(app).get("/api/properties?limit=101");

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("rejects a non-numeric limit", async () => {
    const res = await request(app).get("/api/properties?limit=abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/limit must be between 1 and 100/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("rejects a negative offset", async () => {
    const res = await request(app).get("/api/properties?offset=-1");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/offset must be 0 or greater/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("rejects a non-numeric offset", async () => {
    const res = await request(app).get("/api/properties?offset=abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/offset must be 0 or greater/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("filters by city case-insensitively", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?city=Boston");

    const [countQuery, countValues] = pool.query.mock.calls[0];
    expect(countQuery).toMatch(/LOWER\(TRIM\(L_City\)\) = LOWER\(TRIM\(\?\)\)/);
    expect(countValues).toEqual(["Boston"]);
  });

  test("filters by zipcode", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?zipcode=90210");

    const [countQuery, countValues] = pool.query.mock.calls[0];
    expect(countQuery).toMatch(/L_Zip = \?/);
    expect(countValues).toEqual(["90210"]);
  });

  test("filters by minPrice", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?minPrice=500000");

    const [countQuery, countValues] = pool.query.mock.calls[0];
    expect(countQuery).toMatch(/L_SystemPrice >= \?/);
    expect(countValues).toEqual([500000]);
  });

  test("rejects a non-numeric minPrice", async () => {
    const res = await request(app).get("/api/properties?minPrice=cheap");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/minPrice must be a valid number/);
  });

  test("filters by maxPrice", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?maxPrice=900000");

    const [countQuery, countValues] = pool.query.mock.calls[0];
    expect(countQuery).toMatch(/L_SystemPrice <= \?/);
    expect(countValues).toEqual([900000]);
  });

  test("rejects a non-numeric maxPrice", async () => {
    const res = await request(app).get("/api/properties?maxPrice=lots");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/maxPrice must be a valid number/);
  });

  test("filters by minimum beds", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?beds=3");

    const [countQuery, countValues] = pool.query.mock.calls[0];
    expect(countQuery).toMatch(/L_Keyword2 >= \?/);
    expect(countValues).toEqual([3]);
  });

  test("rejects a non-numeric beds value", async () => {
    const res = await request(app).get("/api/properties?beds=many");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/beds must be a valid number/);
  });

  test("filters by minimum baths", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?baths=2");

    const [countQuery, countValues] = pool.query.mock.calls[0];
    expect(countQuery).toMatch(/LM_Dec_3 >= \?/);
    expect(countValues).toEqual([2]);
  });

  test("rejects a non-numeric baths value", async () => {
    const res = await request(app).get("/api/properties?baths=few");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/baths must be a valid number/);
  });

  test("combines multiple filters in a single WHERE clause", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?city=Irvine&beds=3&minPrice=500000");

    const [countQuery, countValues] = pool.query.mock.calls[0];
    expect(countQuery).toMatch(/WHERE .*AND.*AND/s);
    expect(countValues).toEqual(["Irvine", 500000, 3]);
  });

  test("sorts by an allowed field and direction", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    await request(app).get("/api/properties?sortBy=price&sortOrder=desc");

    const [, dataQuery] = pool.query.mock.calls.map((call) => call[0]);
    expect(dataQuery).toMatch(/ORDER BY L_SystemPrice DESC/);
  });

  test("rejects a sortBy value outside the whitelist", async () => {
    const res = await request(app).get("/api/properties?sortBy=L_SystemPrice");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sortBy must be one of/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("rejects an invalid sortOrder", async () => {
    const res = await request(app).get("/api/properties?sortBy=price&sortOrder=sideways");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sortOrder must be 'asc' or 'desc'/);
  });

  test("returns 500 when the database throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Server error");
  });
});

describe("GET /api/properties/:id", () => {
  test("returns the matching property", async () => {
    pool.query.mockResolvedValueOnce([[{ L_ListingID: "999", L_Address: "1 Main St" }]]);

    const res = await request(app).get("/api/properties/999");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ L_ListingID: "999", L_Address: "1 Main St" });
  });

  test("returns 404 when no property matches the id", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Property not found");
  });

  test("rejects an id longer than 50 characters", async () => {
    const res = await request(app).get(`/api/properties/${"9".repeat(51)}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid listing ID");
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("returns 500 when the database throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get("/api/properties/999");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Server error");
  });
});

describe("GET /api/properties/:id/openhouses", () => {
  test("returns the property's open houses in order", async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([
        [{ OpenHouseDate: "2026-06-16", OH_StartTime: "09:00:00" }],
      ]);

    const res = await request(app).get("/api/properties/999/openhouses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ OpenHouseDate: "2026-06-16", OH_StartTime: "09:00:00" }]);
  });

  test("returns an empty array when the property has no open houses", async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/999/openhouses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns 404 for an unknown property", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/unknown/openhouses");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Property not found");
    // The route should never look up open houses for a property that
    // doesn't exist.
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test("rejects an id longer than 50 characters", async () => {
    const res = await request(app).get(`/api/properties/${"9".repeat(51)}/openhouses`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid listing ID");
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("returns 500 when the database throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get("/api/properties/999/openhouses");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Server error");
  });
});
