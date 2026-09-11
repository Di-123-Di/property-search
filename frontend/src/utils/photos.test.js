import { parsePhotos } from "./photos";

test("parses a valid JSON array of photo URLs", () => {
  const raw = JSON.stringify(["https://example.com/1.jpg", "https://example.com/2.jpg"]);
  expect(parsePhotos(raw)).toEqual([
    "https://example.com/1.jpg",
    "https://example.com/2.jpg",
  ]);
});

test("returns an empty array for malformed JSON", () => {
  expect(parsePhotos("not json")).toEqual([]);
});

test("returns an empty array when the JSON is not an array", () => {
  expect(parsePhotos(JSON.stringify({ not: "an array" }))).toEqual([]);
});

test("returns an empty array for null or undefined input", () => {
  expect(parsePhotos(null)).toEqual([]);
  expect(parsePhotos(undefined)).toEqual([]);
});

// About 8% of listings mix PDF documents into L_Photos, and for roughly
// half of those the PDF is the first entry — so it became the card's
// cover "photo" and rendered as a broken image.
test("drops PDF documents mixed into the photo array", () => {
  const raw = JSON.stringify([
    "https://api.example.com/Media/Property/DOCUMENT-Pdf/123/1/abc/def",
    "https://api.example.com/Media/Property/PHOTO-Jpeg/123/2/abc/ghi",
  ]);

  expect(parsePhotos(raw)).toEqual([
    "https://api.example.com/Media/Property/PHOTO-Jpeg/123/2/abc/ghi",
  ]);
});

test("keeps DOCUMENT-Jpeg entries, which are real images", () => {
  const raw = JSON.stringify([
    "https://api.example.com/Media/Property/DOCUMENT-Jpeg/123/1/abc/def",
    "https://api.example.com/Media/Property/PHOTO-Jpeg/123/2/abc/ghi",
  ]);

  expect(parsePhotos(raw)).toHaveLength(2);
});

test("returns an empty array when every entry is a PDF", () => {
  const raw = JSON.stringify([
    "https://api.example.com/Media/Property/DOCUMENT-Pdf/123/1/abc/def",
  ]);

  expect(parsePhotos(raw)).toEqual([]);
});

test("ignores non-string entries", () => {
  expect(parsePhotos(JSON.stringify(["https://example.com/1.jpg", null, 42]))).toEqual([
    "https://example.com/1.jpg",
  ]);
});
