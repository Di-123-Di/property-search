import { useState, useEffect } from "react";
import { fetchProperties, cleanFilters } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import SortControls from "../components/SortControls";
import Pagination from "../components/Pagination";

const NO_FILTERS = {};
const NO_SORT = { sortBy: "", sortOrder: "" };
const ITEMS_PER_PAGE = 20;

function ListingsPage() {
  const [appliedFilters, setAppliedFilters] = useState(NO_FILTERS);
  const [sort, setSort] = useState(NO_SORT);
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // `stale` guards against the race condition where an older request
    // (e.g. a slow "Search") resolves AFTER a newer one (e.g. "Clear", a
    // second search, or a page change) and overwrites its results. Whenever
    // appliedFilters, sort, or currentPage changes, React runs this cleanup
    // for the previous effect run and marks that request's callbacks as
    // stale, so their results are discarded instead of flashing on screen.
    let stale = false;

    setLoading(true);
    setError(null);

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    // cleanFilters() was written for the filter form, but "no sort chosen"
    // is represented the same way ({ sortBy: "", sortOrder: "" }), so it
    // doubles as the right tool for dropping an empty sort selection before
    // it reaches the query string.
    fetchProperties({ ...appliedFilters, ...cleanFilters(sort), limit: ITEMS_PER_PAGE, offset })
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
  }, [appliedFilters, sort, currentPage]);

  function handleSearch(filters) {
    setAppliedFilters(cleanFilters(filters));
    setSort(NO_SORT);
    setCurrentPage(1);
  }

  function handleClear() {
    setAppliedFilters(NO_FILTERS);
    setSort(NO_SORT);
    setCurrentPage(1);
  }

  function handleSortChange(nextSort) {
    setSort(nextSort);
    setCurrentPage(1);
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <div className="listings-page">
      <h1>Property Listings</h1>
      <PropertyFilters onSearch={handleSearch} onClear={handleClear} />

      {loading && <div className="status">Loading...</div>}
      {error && <div className="status error">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="listings-toolbar">
            <p className="count">
              Showing {rangeStart}-{rangeEnd} of {total} properties
            </p>
            <SortControls
              sortBy={sort.sortBy}
              sortOrder={sort.sortOrder}
              onChange={handleSortChange}
            />
          </div>
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default ListingsPage;
