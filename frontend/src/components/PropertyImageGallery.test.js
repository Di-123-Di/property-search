import { render, screen, fireEvent } from "@testing-library/react";
import PropertyImageGallery from "./PropertyImageGallery";

const threePhotos = JSON.stringify([
  "https://example.com/1.jpg",
  "https://example.com/2.jpg",
  "https://example.com/3.jpg",
]);

test("shows a placeholder when there are no photos", () => {
  render(<PropertyImageGallery photosJson="[]" alt="123 Main St" />);
  expect(screen.getByText(/no photo available/i)).toBeInTheDocument();
});

test("hides the thumbnail strip for a single photo", () => {
  render(
    <PropertyImageGallery
      photosJson={JSON.stringify(["https://example.com/only.jpg"])}
      alt="123 Main St"
    />
  );

  // Only the main image should be present — no thumbnails to scroll through.
  expect(screen.getAllByRole("img")).toHaveLength(1);
});

test("clicking a thumbnail updates the main image", () => {
  render(<PropertyImageGallery photosJson={threePhotos} alt="123 Main St" />);

  const mainImage = screen.getByAltText("123 Main St");
  expect(mainImage).toHaveAttribute("src", "https://example.com/1.jpg");

  fireEvent.click(screen.getByAltText("123 Main St thumbnail 3"));

  expect(screen.getByAltText("123 Main St")).toHaveAttribute(
    "src",
    "https://example.com/3.jpg"
  );
});

test("clicking the main image opens the lightbox", () => {
  const { container } = render(
    <PropertyImageGallery photosJson={threePhotos} alt="123 Main St" />
  );

  expect(container.querySelector(".lightbox-overlay")).not.toBeInTheDocument();

  fireEvent.click(screen.getByAltText("123 Main St"));

  expect(container.querySelector(".lightbox-overlay")).toBeInTheDocument();
});

test("the lightbox opens showing the currently active thumbnail", () => {
  render(<PropertyImageGallery photosJson={threePhotos} alt="123 Main St" />);

  fireEvent.click(screen.getByAltText("123 Main St thumbnail 2"));
  fireEvent.click(screen.getByAltText("123 Main St"));

  // Two images now share this src: the main image and the lightbox image.
  const matches = screen.getAllByAltText(/2 of 3|123 main st/i);
  const lightboxImage = matches.find((img) =>
    img.closest(".lightbox-overlay")
  );
  expect(lightboxImage).toHaveAttribute("src", "https://example.com/2.jpg");
});
