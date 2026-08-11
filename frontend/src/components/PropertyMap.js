function PropertyMap({ latitude, longitude }) {
  if (!latitude || !longitude) return null;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const embedSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=15`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="property-map">
      <iframe
        title="Property location"
        className="property-map-frame"
        loading="lazy"
        allowFullScreen
        src={embedSrc}
      />
      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="directions-link"
      >
        Get Directions
      </a>
    </div>
  );
}

export default PropertyMap;
