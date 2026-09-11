// The media provider encodes the asset type into the URL path, e.g.
// .../Media/Property/PHOTO-Jpeg/... or .../Media/Property/DOCUMENT-Pdf/...
// Only the image types belong in a photo carousel — a PDF rendered in an
// <img> tag is just a broken-image icon. DOCUMENT-Jpeg entries (floor
// plans, flyers) are real images, so they are kept.
const PDF_MEDIA_SEGMENT = /\/DOCUMENT-Pdf\//i;

// L_Photos comes back from the API as a JSON-encoded array of photo URLs
// (or an empty/malformed string). Always fall back to an empty array so
// callers never have to special-case a parse failure.
export function parsePhotos(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (url) => typeof url === "string" && !PDF_MEDIA_SEGMENT.test(url)
    );
  } catch (e) {
    return [];
  }
}
