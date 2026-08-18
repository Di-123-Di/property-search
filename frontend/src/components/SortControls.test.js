import { render, screen, fireEvent } from "@testing-library/react";
import SortControls from "./SortControls";

test("shows the default option selected when no sort is applied", () => {
  render(<SortControls sortBy="" sortOrder="" onChange={jest.fn()} />);

  expect(screen.getByLabelText(/sort by/i)).toHaveValue("");
});

test("reflects the current sort in the select value", () => {
  render(<SortControls sortBy="price" sortOrder="desc" onChange={jest.fn()} />);

  expect(screen.getByLabelText(/sort by/i)).toHaveValue("price-desc");
});

test("selecting a sort option calls onChange with the split sortBy/sortOrder", () => {
  const onChange = jest.fn();
  render(<SortControls sortBy="" sortOrder="" onChange={onChange} />);

  fireEvent.change(screen.getByLabelText(/sort by/i), {
    target: { value: "dateListed-desc" },
  });

  expect(onChange).toHaveBeenCalledWith({ sortBy: "dateListed", sortOrder: "desc" });
});

test("selecting the default option calls onChange with an empty sort", () => {
  const onChange = jest.fn();
  render(<SortControls sortBy="price" sortOrder="asc" onChange={onChange} />);

  fireEvent.change(screen.getByLabelText(/sort by/i), { target: { value: "" } });

  expect(onChange).toHaveBeenCalledWith({ sortBy: "", sortOrder: "" });
});
