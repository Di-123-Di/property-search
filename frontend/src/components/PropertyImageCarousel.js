import { useState } from "react";
import { parsePhotos } from "../utils/photos";

function PropertyImageCarousel({ photosJson, alt }) {
  const photos = parsePhotos(photosJson);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return <div className="no-photo">No Photo</div>;
  }

  // The card itself is clickable and navigates to the detail page, so the
  // arrow clicks must stop the click from bubbling up to that handler.
  function showPrevious(e) {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function showNext(e) {
    e.stopPropagation();
    setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="property-carousel">
      <img src={photos[index]} alt={alt} />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev"
            onClick={showPrevious}
            aria-label="Previous photo"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-next"
            onClick={showNext}
            aria-label="Next photo"
          >
            &rsaquo;
          </button>
          <div className="carousel-counter">
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}

export default PropertyImageCarousel;
