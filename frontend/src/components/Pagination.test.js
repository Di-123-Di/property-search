import { render, screen, fireEvent } from "@testing-library/react";
import Pagination, { getPageNumbers } from "./Pagination";

// Reads the rendered page numbers and ellipsis markers in DOM order,
// excluding the Previous/Next buttons that bookend the nav.
function pageButtonTexts() {
  const nav = screen.getByRole("navigation");
  return Array.from(nav.children)
    .slice(1, -1)
    .map((el) => el.textContent);
}

test("renders nothing when there is only one page", () => {
  const { container } = render(
    <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
  );

  expect(container).toBeEmptyDOMElement();
});

test("shows every page with no ellipsis when they all fit", () => {
  render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);

  expect(pageButtonTexts()).toEqual(["1", "2", "3", "4", "5"]);
});

test("disables Previous on the first page and enables Next", () => {
  render(<Pagination currentPage={1} totalPages={24} onPageChange={jest.fn()} />);

  expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
  expect(pageButtonTexts()).toEqual(["1", "2", "3", "4", "5", "…", "24"]);
});

test("disables Next on the last page and enables Previous", () => {
  render(<Pagination currentPage={24} totalPages={24} onPageChange={jest.fn()} />);

  expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /previous/i })).not.toBeDisabled();
});

test("shows a leading and trailing ellipsis around the current page in the middle", () => {
  render(<Pagination currentPage={5} totalPages={24} onPageChange={jest.fn()} />);

  expect(pageButtonTexts()).toEqual(["1", "…", "4", "5", "6", "…", "24"]);
});

test("clicking a page number calls onPageChange with that page", () => {
  const onPageChange = jest.fn();
  render(<Pagination currentPage={5} totalPages={24} onPageChange={onPageChange} />);

  fireEvent.click(screen.getByRole("button", { name: "6" }));

  expect(onPageChange).toHaveBeenCalledWith(6);
});

test("clicking Previous and Next moves one page at a time", () => {
  const onPageChange = jest.fn();
  render(<Pagination currentPage={5} totalPages={24} onPageChange={onPageChange} />);

  fireEvent.click(screen.getByRole("button", { name: /previous/i }));
  fireEvent.click(screen.getByRole("button", { name: /next/i }));

  expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
  expect(onPageChange).toHaveBeenNthCalledWith(2, 6);
});

// Debug Challenge regression test: near the end of a large page count, a
// naive implementation clamps the sibling range up to `totalPages` and then
// unconditionally appends `totalPages` again afterwards, so the last page
// number is rendered twice (e.g. "1 ... 23 24 24"). Every page number must
// be unique, and the last page must appear exactly once.
test("does not render the last page number twice when near the end", () => {
  render(<Pagination currentPage={24} totalPages={24} onPageChange={jest.fn()} />);

  const texts = pageButtonTexts();
  expect(texts).toEqual(["1", "…", "20", "21", "22", "23", "24"]);
  expect(texts.filter((text) => text === "24")).toHaveLength(1);
  expect(new Set(texts).size).toBe(texts.length);
});

test("also avoids a duplicate last page one step before the end", () => {
  render(<Pagination currentPage={23} totalPages={24} onPageChange={jest.fn()} />);

  const texts = pageButtonTexts();
  expect(texts.filter((text) => text === "24")).toHaveLength(1);
});

describe("getPageNumbers", () => {
  test("returns every page when the total is small", () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
    expect(getPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("matches the documented example for a middle page", () => {
    expect(getPageNumbers(5, 24)).toEqual([
      1,
      "ellipsis-start",
      4,
      5,
      6,
      "ellipsis-end",
      24,
    ]);
  });
});
