import { useState } from "react";

const EMPTY_FILTERS = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

function PropertyFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  function handleChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(filters);
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    onClear();
  }

  return (
    <form className="property-filters" onSubmit={handleSubmit}>
      <div className="filter-field">
        <label htmlFor="filter-city">City</label>
        <input
          id="filter-city"
          type="text"
          value={filters.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-zipcode">ZIP Code</label>
        <input
          id="filter-zipcode"
          type="text"
          value={filters.zipcode}
          onChange={(e) => handleChange("zipcode", e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-min-price">Min Price</label>
        <input
          id="filter-min-price"
          type="number"
          value={filters.minPrice}
          onChange={(e) => handleChange("minPrice", e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-max-price">Max Price</label>
        <input
          id="filter-max-price"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => handleChange("maxPrice", e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-beds">Beds</label>
        <select
          id="filter-beds"
          value={filters.beds}
          onChange={(e) => handleChange("beds", e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-baths">Baths</label>
        <select
          id="filter-baths"
          value={filters.baths}
          onChange={(e) => handleChange("baths", e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div className="filter-actions">
        <button type="submit">Search</button>
        <button type="button" onClick={handleClear}>
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters;
