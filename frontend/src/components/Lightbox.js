import { useState, useRef, useEffect } from "react";

function Lightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const overlayRef = useRef(null);

  // Plain divs are not focusable and never receive keyboard events, even
  // with an onKeyDown handler attached — only elements that are part of
  // the focus chain do. Giving the div a tabIndex makes it focusable, and
  // calling .focus() here actually puts keyboard focus on it once it
  // mounts, so the Escape/Arrow key handler below actually fires.
  useEffect(() => {
    overlayRef.current?.focus();
  }, []);

  function showPrevious() {
    setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function showNext() {
    setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") showPrevious();
    if (e.key === "ArrowRight") showNext();
  }

  return (
    <div
      className="lightbox-overlay"
      ref={overlayRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 && (
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-prev"
            onClick={showPrevious}
            aria-label="Previous photo"
          >
            &lsaquo;
          </button>
        )}

        <img src={photos[index]} alt={`${index + 1} of ${photos.length}`} />

        {photos.length > 1 && (
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-next"
            onClick={showNext}
            aria-label="Next photo"
          >
            &rsaquo;
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div className="lightbox-counter">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

export default Lightbox;
