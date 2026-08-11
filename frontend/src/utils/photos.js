// L_Photos comes back from the API as a JSON-encoded array of photo URLs
// (or an empty/malformed string). Always fall back to an empty array so
// callers never have to special-case a parse failure.
export function parsePhotos(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
