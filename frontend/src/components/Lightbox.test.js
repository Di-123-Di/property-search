import { render, screen, fireEvent } from "@testing-library/react";
import Lightbox from "./Lightbox";

const photos = [
  "https://example.com/1.jpg",
  "https://example.com/2.jpg",
  "https://example.com/3.jpg",
];

test("renders the photo starting at startIndex", () => {
  render(<Lightbox photos={photos} startIndex={1} onClose={jest.fn()} />);
  expect(screen.getByRole("img")).toHaveAttribute("src", photos[1]);
});

test("left and right arrows navigate and wrap around", () => {
  render(<Lightbox photos={photos} startIndex={0} onClose={jest.fn()} />);

  fireEvent.click(screen.getByLabelText(/previous photo/i));
  expect(screen.getByRole("img")).toHaveAttribute("src", photos[2]);

  fireEvent.click(screen.getByLabelText(/next photo/i));
  fireEvent.click(screen.getByLabelText(/next photo/i));
  expect(screen.getByRole("img")).toHaveAttribute("src", photos[1]);
});

test("clicking the close button closes the lightbox", () => {
  const onClose = jest.fn();
  render(<Lightbox photos={photos} startIndex={0} onClose={onClose} />);

  fireEvent.click(screen.getByLabelText(/close/i));

  expect(onClose).toHaveBeenCalled();
});

test("clicking the backdrop (outside the image) closes the lightbox", () => {
  const onClose = jest.fn();
  const { container } = render(
    <Lightbox photos={photos} startIndex={0} onClose={onClose} />
  );

  fireEvent.click(container.querySelector(".lightbox-overlay"));

  expect(onClose).toHaveBeenCalled();
});

test("clicking the image itself does not close the lightbox", () => {
  const onClose = jest.fn();
  render(<Lightbox photos={photos} startIndex={0} onClose={onClose} />);

  fireEvent.click(screen.getByRole("img"));

  expect(onClose).not.toHaveBeenCalled();
});

// Debug Challenge: the overlay div must actually receive keyboard focus for
// its onKeyDown handler to ever fire from a real Escape keypress. This test
// dispatches the key on `document.activeElement` (whatever really has
// focus), the same way a browser delivers a physical keypress, instead of
// targeting the overlay element directly by selector — a version of the
// component that forgot to call `.focus()` would leave focus on
// document.body and this test would fail.
test("pressing Escape closes the lightbox", () => {
  const onClose = jest.fn();
  render(<Lightbox photos={photos} startIndex={0} onClose={onClose} />);

  fireEvent.keyDown(document.activeElement, { key: "Escape" });

  expect(onClose).toHaveBeenCalled();
});

test("arrow keys navigate photos via the keyboard", () => {
  render(<Lightbox photos={photos} startIndex={0} onClose={jest.fn()} />);

  fireEvent.keyDown(document.activeElement, { key: "ArrowRight" });
  expect(screen.getByRole("img")).toHaveAttribute("src", photos[1]);

  fireEvent.keyDown(document.activeElement, { key: "ArrowLeft" });
  expect(screen.getByRole("img")).toHaveAttribute("src", photos[0]);
});
