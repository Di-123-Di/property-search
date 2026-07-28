import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyFilters from "./PropertyFilters";

test("renders all six filter inputs", () => {
  render(<PropertyFilters onSearch={jest.fn()} onClear={jest.fn()} />);

  expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/min price/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/max price/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/beds/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/baths/i)).toBeInTheDocument();
});

test("submitting the form calls onSearch with the entered value", () => {
  const onSearch = jest.fn();
  render(<PropertyFilters onSearch={onSearch} onClear={jest.fn()} />);

  userEvent.type(screen.getByLabelText(/city/i), "Boston");
  userEvent.click(screen.getByRole("button", { name: /search/i }));

  expect(onSearch).toHaveBeenCalledWith(
    expect.objectContaining({ city: "Boston" })
  );
});

test("multiple filters can be combined into a single onSearch call", () => {
  const onSearch = jest.fn();
  render(<PropertyFilters onSearch={onSearch} onClear={jest.fn()} />);

  userEvent.type(screen.getByLabelText(/city/i), "Boston");
  userEvent.type(screen.getByLabelText(/min price/i), "200000");
  userEvent.selectOptions(screen.getByLabelText(/beds/i), "3");
  userEvent.click(screen.getByRole("button", { name: /search/i }));

  expect(onSearch).toHaveBeenCalledWith({
    city: "Boston",
    zipcode: "",
    minPrice: "200000",
    maxPrice: "",
    beds: "3",
    baths: "",
  });
});

test("clicking Clear Filters resets every input and calls onClear", () => {
  const onClear = jest.fn();
  render(<PropertyFilters onSearch={jest.fn()} onClear={onClear} />);

  const cityInput = screen.getByLabelText(/city/i);
  userEvent.type(cityInput, "Boston");
  userEvent.selectOptions(screen.getByLabelText(/beds/i), "2");

  userEvent.click(screen.getByRole("button", { name: /clear filters/i }));

  expect(onClear).toHaveBeenCalledTimes(1);
  expect(cityInput).toHaveValue("");
  expect(screen.getByLabelText(/beds/i)).toHaveValue("");
});
