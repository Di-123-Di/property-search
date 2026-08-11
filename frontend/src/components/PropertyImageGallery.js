import { useState } from "react";
import { parsePhotos } from "../utils/photos";
import Lightbox from "./Lightbox";

function PropertyImageGallery({ photosJson, alt }) {
  const photos = parsePhotos(photosJson);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (photos.length === 0) {
    return <div className="gallery-no-photo">No Photo Available</div>;
  }

  return (
    <div className="property-gallery">
      <img
        className="gallery-main-image"
        src={photos[activeIndex]}
        alt={alt}
        onClick={() => setLightboxOpen(true)}
      />

      {photos.length > 1 && (
        <div className="gallery-thumbnails">
          {photos.map((photo, i) => (
            <img
              key={photo}
              src={photo}
              alt={`${alt} thumbnail ${i + 1}`}
              className={
                i === activeIndex ? "gallery-thumbnail active" : "gallery-thumbnail"
              }
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          startIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

export default PropertyImageGallery;
