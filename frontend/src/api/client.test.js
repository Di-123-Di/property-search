import {
  fetchProperties,
  fetchPropertyDetail,
  fetchOpenHouses,
  cleanFilters,
} from "./client";

// global.fetch does not exist in the jsdom test environment, so we replace
// it with a jest mock function before each test. jest.fn() lets us control
// exactly what the "network call" resolves (or rejects) to, without ever
// touching a real server or database.
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("fetchProperties requests the properties endpoint with no query string when params are empty", async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ total: 0, limit: 20, offset: 0, results: [] }),
  });

  await fetchProperties();

  expect(global.fetch).toHaveBeenCalledWith("/api/properties");
});

test("fetchProperties builds a query string from the given params", async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ total: 1, limit: 20, offset: 0, results: [] }),
  });

  await fetchProperties({ city: "Boston", minPrice: 200000 });

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/properties?city=Boston&minPrice=200000"
  );
});

test("fetchProperties resolves with the parsed JSON body on success", async () => {
  const payload = { total: 1, limit: 20, offset: 0, results: [{ id: 1 }] };
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });

  const data = await fetchProperties({ city: "Boston" });

  expect(data).toEqual(payload);
});

test("fetchProperties throws when the response is not ok", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({ error: "Server error" }),
  });

  await expect(fetchProperties({ city: "Boston" })).rejects.toThrow(
    "Failed to fetch properties: 500"
  );
});

test("fetchPropertyDetail throws a not-found error on a 404 response", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 404,
    json: async () => ({ error: "Property not found" }),
  });

  await expect(fetchPropertyDetail("abc123")).rejects.toThrow(
    "Property not found: 404"
  );
});

test("fetchOpenHouses requests the openhouses endpoint for the given listing id", async () => {
  const payload = [{ id: 1, OpenHouseDate: "2026-06-16" }];
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });

  const data = await fetchOpenHouses("999");

  expect(global.fetch).toHaveBeenCalledWith("/api/properties/999/openhouses");
  expect(data).toEqual(payload);
});

test("fetchOpenHouses throws when the response is not ok", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 404,
    json: async () => ({ error: "Property not found" }),
  });

  await expect(fetchOpenHouses("invalid-id")).rejects.toThrow(
    "Failed to fetch open houses: 404"
  );
});

test("cleanFilters drops empty string, null, and undefined values", () => {
  const result = cleanFilters({
    city: "Boston",
    zipcode: "",
    minPrice: null,
    maxPrice: undefined,
    beds: "3",
    baths: 0,
  });

  expect(result).toEqual({ city: "Boston", beds: "3", baths: 0 });
});

test("cleanFilters returns an empty object when all values are empty", () => {
  const result = cleanFilters({ city: "", zipcode: "", beds: "" });

  expect(result).toEqual({});
});
