import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "favoritePropertyIds";

function readStoredFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Persists favorited listing IDs in localStorage so they survive a page
// refresh. Only IDs are stored (not full property objects), so the data
// shown for a favorite always comes from a fresh fetch of the listing.
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(readStoredFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (id) => favoriteIds.includes(id),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
    );
  }, []);

  return { favoriteIds, isFavorite, toggleFavorite };
}
