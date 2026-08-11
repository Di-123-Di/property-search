import { render, screen } from "@testing-library/react";
import PropertyMap from "./PropertyMap";

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV, REACT_APP_GOOGLE_MAPS_API_KEY: "test-key" };
});

afterEach(() => {
  process.env = OLD_ENV;
});

test("renders an iframe pointed at the correct location", () => {
  render(<PropertyMap latitude="34.099106" longitude="-118.418132" />);

  const iframe = screen.getByTitle(/property location/i);
  expect(iframe.src).toContain("q=34.099106,-118.418132");
  expect(iframe.src).toContain("key=test-key");
});

test("renders a Get Directions link that opens Google Maps in a new tab", () => {
  render(<PropertyMap latitude="34.099106" longitude="-118.418132" />);

  const link = screen.getByRole("link", { name: /get directions/i });
  expect(link).toHaveAttribute(
    "href",
    "https://www.google.com/maps/dir/?api=1&destination=34.099106,-118.418132"
  );
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
});

test("renders nothing when latitude is missing", () => {
  const { container } = render(<PropertyMap latitude={null} longitude="-118.418132" />);
  expect(container).toBeEmptyDOMElement();
});

test("renders nothing when longitude is missing", () => {
  const { container } = render(<PropertyMap latitude="34.099106" longitude={null} />);
  expect(container).toBeEmptyDOMElement();
});
