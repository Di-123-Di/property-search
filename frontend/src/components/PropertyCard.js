function parsePhotos(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
  } catch (e) {}
  return null;
}

function PropertyCard({ property }) {
  const photo = parsePhotos(property.L_Photos);
  const price = property.L_SystemPrice
    ? "$" + property.L_SystemPrice.toLocaleString()
    : "Price unavailable";

  return (
    <div className="property-card">
      {photo ? (
        <img src={photo} alt={property.L_Address} />
      ) : (
        <div className="no-photo">No Photo</div>
      )}
      <div className="card-info">
        <div className="price">{price}</div>
        <div className="address">{property.L_Address}</div>
        <div className="city">{property.L_City}, {property.L_State}</div>
        <div className="details">
          {property.L_Keyword2} beds · {property.LM_Dec_3} baths · {property.LM_Int2_3} sqft
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;