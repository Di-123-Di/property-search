import { useState, useEffect } from "react";
import { fetchProperties, cleanFilters } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";

const NO_FILTERS = {};

function ListingsPage() {
  const [appliedFilters, setAppliedFilters] = useState(NO_FILTERS);
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // `stale` guards against the race condition where an older request
    // (e.g. a slow "Search") resolves AFTER a newer one (e.g. "Clear" or
    // a second search) and overwrites its results. Whenever appliedFilters
    // changes, React runs this cleanup for the previous effect run and
    // marks that request's callbacks as stale, so their results are
    // discarded instead of flashing on screen.
    let stale = false;

    setLoading(true);
    setError(null);

    fetchProperties({ ...appliedFilters, limit: 20 })
      .then((data) => {
        if (stale) return;
        setProperties(data.results);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        if (stale) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [appliedFilters]);

  function handleSearch(filters) {
    setAppliedFilters(cleanFilters(filters));
  }

  function handleClear() {
    setAppliedFilters(NO_FILTERS);
  }

  return (
    <div className="listings-page">
      <h1>Property Listings</h1>
      <PropertyFilters onSearch={handleSearch} onClear={handleClear} />

      {loading && <div className="status">Loading...</div>}
      {error && <div className="status error">Error: {error}</div>}

      {!loading && !error && (
        <>
          <p className="count">
            Showing {properties.length} of {total} properties
          </p>
          {properties.length === 0 ? (
            <div className="status">
              No properties found. Try adjusting your filters.
            </div>
          ) : (
            <div className="property-grid">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ListingsPage;
