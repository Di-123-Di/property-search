import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPropertyDetail, fetchOpenHouses } from "../api/client";
import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";
import OpenHouseList from "../components/OpenHouseList";

function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stale = false;
    setLoading(true);
    setError(null);

    fetchPropertyDetail(id)
      .then((data) => {
        if (stale) return;
        setProperty(data);
        setLoading(false);
      })
      .catch((err) => {
        if (stale) return;
        setError(err.message);
        setLoading(false);
      });

    fetchOpenHouses(id)
      .then((data) => {
        if (!stale) setOpenHouses(data);
      })
      .catch(() => {
        if (!stale) setOpenHouses([]);
      });

    return () => {
      stale = true;
    };
  }, [id]);

  if (loading) return <div className="status">Loading...</div>;

  if (error) {
    return (
      <div className="listings-page">
        <Link to="/" className="back-link">&larr; Back to listings</Link>
        <div className="status error">Error: {error}</div>
      </div>
    );
  }

  const price = property.L_SystemPrice
    ? "$" + property.L_SystemPrice.toLocaleString()
    : "Price unavailable";

  return (
    <div className="listings-page property-detail-page">
      <Link to="/" className="back-link">&larr; Back to listings</Link>

      <PropertyImageGallery photosJson={property.L_Photos} alt={property.L_Address} />

      <div className="detail-header">
        <div className="price">{price}</div>
        <div className="address">
          {property.L_Address}, {property.L_City}, {property.L_State} {property.L_Zip}
        </div>
        <div className="stats">
          <span>{property.L_Keyword2} beds</span>
          <span>{property.LM_Dec_3} baths</span>
          <span>{property.LM_Int2_3} sqft</span>
          <span>Built {property.YearBuilt || "—"}</span>
        </div>
      </div>

      <section className="detail-section">
        <h2>Description</h2>
        <p>{property.L_Remarks || "No description available."}</p>
      </section>

      <section className="detail-section">
        <h2>Property Details</h2>
        <dl className="detail-facts">
          <dt>Property Type</dt>
          <dd>{property.L_Type_ || "—"}</dd>
          <dt>Status</dt>
          <dd>{property.L_Status || "—"}</dd>
          <dt>Stories</dt>
          <dd>{property.StoriesTotal || "—"}</dd>
          <dt>Lot Size</dt>
          <dd>
            {property.LotSizeSquareFeet
              ? `${Number(property.LotSizeSquareFeet).toLocaleString()} sqft`
              : "—"}
          </dd>
          <dt>Heating</dt>
          <dd>{property.Heating || "—"}</dd>
          <dt>Cooling</dt>
          <dd>{property.Cooling || "—"}</dd>
          <dt>MLS #</dt>
          <dd>{property.L_DisplayId || "—"}</dd>
          <dt>Listed By</dt>
          <dd>
            {property.ListAgentFullName || "—"}
            {property.LO1_OrganizationName ? ` · ${property.LO1_OrganizationName}` : ""}
          </dd>
        </dl>
      </section>

      <section className="detail-section">
        <h2>Location</h2>
        <PropertyMap
          latitude={property.LMD_MP_Latitude}
          longitude={property.LMD_MP_Longitude}
        />
      </section>

      <section className="detail-section">
        <h2>Open Houses</h2>
        <OpenHouseList openHouses={openHouses} />
      </section>
    </div>
  );
}

export default PropertyDetailPage;
