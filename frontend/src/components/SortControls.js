const SORT_OPTIONS = [
  { value: "", label: "Sort: Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "dateListed-desc", label: "Date Listed: Newest First" },
  { value: "dateListed-asc", label: "Date Listed: Oldest First" },
  { value: "sqft-desc", label: "Square Footage: High to Low" },
  { value: "sqft-asc", label: "Square Footage: Low to High" },
  { value: "beds-desc", label: "Beds: Most to Fewest" },
  { value: "beds-asc", label: "Beds: Fewest to Most" },
];

function SortControls({ sortBy, sortOrder, onChange }) {
  const currentValue = sortBy ? `${sortBy}-${sortOrder}` : "";

  function handleChange(e) {
    const selected = e.target.value;
    if (!selected) {
      onChange({ sortBy: "", sortOrder: "" });
      return;
    }
    const [nextSortBy, nextSortOrder] = selected.split("-");
    onChange({ sortBy: nextSortBy, sortOrder: nextSortOrder });
  }

  return (
    <div className="sort-controls">
      <label htmlFor="sort-select">Sort by</label>
      <select id="sort-select" value={currentValue} onChange={handleChange}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortControls;
