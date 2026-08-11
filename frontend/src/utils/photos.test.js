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
