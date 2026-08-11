import { useNavigate } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";

function PropertyCard({ property }) {
  const navigate = useNavigate();
  const price = property.L_SystemPrice
    ? "$" + property.L_SystemPrice.toLocaleString()
    : "Price unavailable";

  return (
    <div
      className="property-card"
      onClick={() => navigate(`/property/${property.L_ListingID}`)}
    >
      <PropertyImageCarousel photosJson={property.L_Photos} alt={property.L_Address} />
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
