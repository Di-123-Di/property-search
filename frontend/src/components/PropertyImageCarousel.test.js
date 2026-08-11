import { render, screen, fireEvent } from "@testing-library/react";
import PropertyImageCarousel from "./PropertyImageCarousel";

const threePhotos = JSON.stringify([
  "https://example.com/1.jpg",
  "https://example.com/2.jpg",
  "https://example.com/3.jpg",
]);

test("shows 'No Photo' when there are no photos", () => {
  render(<PropertyImageCarousel photosJson="[]" alt="123 Main St" />);
  expect(screen.getByText(/no photo/i)).toBeInTheDocument();
});

test("renders the first photo and hides arrows/counter for a single photo", () => {
  render(
    <PropertyImageCarousel
      photosJson={JSON.stringify(["https://example.com/only.jpg"])}
      alt="123 Main St"
    />
  );

  expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/only.jpg");
  expect(screen.queryByLabelText(/next photo/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/previous photo/i)).not.toBeInTheDocument();
});

test("shows a counter and cycles through photos with the arrows", () => {
  render(<PropertyImageCarousel photosJson={threePhotos} alt="123 Main St" />);

  expect(screen.getByText("1 / 3")).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/next photo/i));
  expect(screen.getByText("2 / 3")).toBeInTheDocument();
  expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/2.jpg");

  fireEvent.click(screen.getByLabelText(/previous photo/i));
  expect(screen.getByText("1 / 3")).toBeInTheDocument();
});

test("wraps around in both directions", () => {
  render(<PropertyImageCarousel photosJson={threePhotos} alt="123 Main St" />);

  fireEvent.click(screen.getByLabelText(/previous photo/i));
  expect(screen.getByText("3 / 3")).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/next photo/i));
  fireEvent.click(screen.getByLabelText(/next photo/i));
  fireEvent.click(screen.getByLabelText(/next photo/i));
  expect(screen.getByText("3 / 3")).toBeInTheDocument();
});

test("arrow clicks stop propagation so a parent click handler does not fire", () => {
  const onCardClick = jest.fn();
  render(
    <div onClick={onCardClick}>
      <PropertyImageCarousel photosJson={threePhotos} alt="123 Main St" />
    </div>
  );

  fireEvent.click(screen.getByLabelText(/next photo/i));

  expect(onCardClick).not.toHaveBeenCalled();
});
