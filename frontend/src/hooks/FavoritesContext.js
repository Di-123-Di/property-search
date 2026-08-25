import { createContext, useContext } from "react";
import { useFavorites } from "./useFavorites";

const FavoritesContext = createContext(null);

// Calls useFavorites() exactly once and shares the same favorites state
// with every component in the tree via context. Without this, each
// PropertyCard (and the nav's favorites count, and the Favorites page)
// would have its own independent copy of the state, and favoriting a
// property in one place wouldn't be reflected anywhere else until a
// manual page refresh re-read localStorage.
export function FavoritesProvider({ children }) {
  const favorites = useFavorites();
  return (
    <FavoritesContext.Provider value={favorites}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider");
  }
  return context;
}
