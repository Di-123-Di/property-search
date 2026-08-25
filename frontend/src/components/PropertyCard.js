import { useNavigate } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";
import { useFavoritesContext } from "../context/FavoritesContext";

function PropertyCard({ property }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const favorited = isFavorite(property.L_ListingID);
  const price = property.L_SystemPrice
    ? "$" + property.L_SystemPrice.toLocaleString()
    : "Price unavailable";

  function handleFavoriteClick(e) {
    // The favorite button sits inside the card's own click-to-navigate
    // handler, so this stops the click from bubbling up and navigating
    // away when the user only meant to favorite the property.
    e.stopPropagation();
    toggleFavorite(property.L_ListingID);
  }

  return (
    <div
      className="property-card"
      role="group"
      aria-label={property.L_Address}
      onClick={() => navigate(`/property/${property.L_ListingID}`)}
    >
      <PropertyImageCarousel photosJson={property.L_Photos} alt={property.L_Address} />
      <button
        type="button"
        className={favorited ? "favorite-button active" : "favorite-button"}
        onClick={handleFavoriteClick}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorited}
      >
        {favorited ? "♥" : "♡"}
      </button>
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
