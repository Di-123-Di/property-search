import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";

beforeEach(() => {
  localStorage.clear();
});

test("starts with no favorites when localStorage is empty", () => {
  const { result } = renderHook(() => useFavorites());

  expect(result.current.favoriteIds).toEqual([]);
  expect(result.current.isFavorite("123")).toBe(false);
});

test("toggling an id favorites it, persists it, and reports it as favorited", () => {
  const { result } = renderHook(() => useFavorites());

  act(() => {
    result.current.toggleFavorite("123");
  });

  expect(result.current.favoriteIds).toEqual(["123"]);
  expect(result.current.isFavorite("123")).toBe(true);
  expect(JSON.parse(localStorage.getItem("favoritePropertyIds"))).toEqual(["123"]);
});

test("toggling an already-favorited id removes it", () => {
  const { result } = renderHook(() => useFavorites());

  act(() => {
    result.current.toggleFavorite("123");
  });
  act(() => {
    result.current.toggleFavorite("123");
  });

  expect(result.current.favoriteIds).toEqual([]);
  expect(result.current.isFavorite("123")).toBe(false);
});

test("reads favorites already stored in localStorage on first render", () => {
  localStorage.setItem("favoritePropertyIds", JSON.stringify(["abc", "def"]));

  const { result } = renderHook(() => useFavorites());

  expect(result.current.favoriteIds).toEqual(["abc", "def"]);
  expect(result.current.isFavorite("abc")).toBe(true);
  expect(result.current.isFavorite("xyz")).toBe(false);
});

test("falls back to an empty list when localStorage has malformed JSON", () => {
  localStorage.setItem("favoritePropertyIds", "{not valid json");

  const { result } = renderHook(() => useFavorites());

  expect(result.current.favoriteIds).toEqual([]);
});
