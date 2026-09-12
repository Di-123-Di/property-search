import { render, screen, fireEvent } from "@testing-library/react";
import ImageWithFallback from "./ImageWithFallback";

test("renders the image while it loads successfully", () => {
  render(<ImageWithFallback src="https://example.com/1.jpg" alt="A house" />);

  expect(screen.getByAltText("A house")).toHaveAttribute(
    "src",
    "https://example.com/1.jpg"
  );
});

test("swaps in a placeholder when the image fails to load", () => {
  render(<ImageWithFallback src="https://example.com/gone.jpg" alt="A house" />);

  fireEvent.error(screen.getByAltText("A house"));

  // The placeholder keeps the img role and the alt text as its label, so
  // assistive tech still describes the slot; it just isn't an <img> tag.
  const placeholder = screen.getByRole("img", { name: "A house" });
  expect(placeholder).toBeInTheDocument();
  expect(placeholder.tagName).toBe("DIV");
  expect(screen.getByText("Photo unavailable")).toBeInTheDocument();
});

test("uses a custom fallback label when given one", () => {
  render(
    <ImageWithFallback src="https://example.com/gone.jpg" alt="Thumb" fallbackText="×" />
  );

  fireEvent.error(screen.getByAltText("Thumb"));

  expect(screen.getByText("×")).toBeInTheDocument();
});

// Regression guard: the component instance is reused as a carousel or
// gallery moves between photos, so a failure on one photo must not leave
// the placeholder stuck in place for every photo after it.
test("recovers when the src changes to a working photo", () => {
  const { rerender } = render(
    <ImageWithFallback src="https://example.com/gone.jpg" alt="A house" />
  );

  fireEvent.error(screen.getByAltText("A house"));
  expect(screen.getByText("Photo unavailable")).toBeInTheDocument();

  rerender(<ImageWithFallback src="https://example.com/works.jpg" alt="A house" />);

  expect(screen.queryByText("Photo unavailable")).not.toBeInTheDocument();
  expect(screen.getByAltText("A house")).toHaveAttribute(
    "src",
    "https://example.com/works.jpg"
  );
});

test("keeps the click handler working on the placeholder", () => {
  const onClick = jest.fn();
  render(
    <ImageWithFallback src="https://example.com/gone.jpg" alt="A house" onClick={onClick} />
  );

  fireEvent.error(screen.getByAltText("A house"));
  fireEvent.click(screen.getByText("Photo unavailable"));

  expect(onClick).toHaveBeenCalledTimes(1);
});

test("passes the className through to both the image and the placeholder", () => {
  render(
    <ImageWithFallback
      src="https://example.com/1.jpg"
      alt="A house"
      className="gallery-main-image"
    />
  );

  expect(screen.getByAltText("A house")).toHaveClass("gallery-main-image");

  fireEvent.error(screen.getByAltText("A house"));

  expect(screen.getByRole("img", { name: "A house" })).toHaveClass(
    "gallery-main-image",
    "image-fallback"
  );
});
