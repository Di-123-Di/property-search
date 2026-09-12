import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Listing photo URLs are signed by the MLS media provider and expire over
// time, so a snapshot of the data always contains some links that now 404.
// The browser's default treatment of those — a broken-image icon with the
// alt text spilling out next to it — looks like the app is broken. This
// renders a neutral placeholder in the image's place instead.
function ImageWithFallback({
  src,
  alt,
  className,
  fallbackText = "Photo unavailable",
  onClick,
}) {
  const [failed, setFailed] = useState(false);

  // Without this reset, the first photo that fails would leave every
  // later photo showing the placeholder too, since the component instance
  // is reused as the carousel/gallery moves between images.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={className ? `${className} image-fallback` : "image-fallback"}
        onClick={onClick}
        role="img"
        aria-label={alt}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  );
}

ImageWithFallback.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallbackText: PropTypes.string,
  onClick: PropTypes.func,
};

export default ImageWithFallback;
