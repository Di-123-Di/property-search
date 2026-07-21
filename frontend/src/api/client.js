const BASE_URL = "/api";

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