const BASE_URL = "/api";

// Drops keys whose value is "", null, or undefined so the query string
// only ever carries filters the user actually set.
export function cleanFilters(filters = {}) {
  const cleaned = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export async function fetchProperties(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/properties${query ? "?" + query : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch properties: ${res.status}`);
  }
  return res.json();
}

export async function fetchPropertyDetail(id) {
  const res = await fetch(`${BASE_URL}/properties/${id}`);
  if (!res.ok) {
    throw new Error(`Property not found: ${res.status}`);
  }
  return res.json();
}

export async function fetchOpenHouses(id) {
  const res = await fetch(`${BASE_URL}/properties/${id}/openhouses`);
  if (!res.ok) {
    throw new Error(`Failed to fetch open houses: ${res.status}`);
  }
  return res.json();
}