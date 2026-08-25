import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPropertyDetail } from "../api/client";
import { useFavoritesContext } from "../hooks/FavoritesContext";
import PropertyCard from "../components/PropertyCard";

function FavoritesPage() {
  const { favoriteIds } = useFavoritesContext();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stale = false;
    setLoading(true);

    // Only IDs are persisted, so the favorited listings' current details
    // are re-fetched here. A listing that failed to load (e.g. it was
    // favorited long ago and no longer exists) is dropped instead of
    // breaking the whole page.
    Promise.all(
      favoriteIds.map((id) => fetchPropertyDetail(id).catch(() => null))
    ).then((results) => {
      if (stale) return;
      setProperties(results.filter((property) => property !== null));
      setLoading(false);
    });

    return () => {
      stale = true;
    };
  }, [favoriteIds]);

  if (loading) return <div className="status">Loading...</div>;

  return (
    <div className="listings-page">
      <h1>Favorites</h1>
      {properties.length === 0 ? (
        <div className="status">
          No favorites yet. <Link to="/">Browse listings</Link> and tap the
          heart on a property to save it here.
        </div>
      ) : (
        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
