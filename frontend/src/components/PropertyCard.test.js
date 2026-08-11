import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const property = {
  L_ListingID: "999",
  L_Address: "123 Main St",
  L_City: "Boston",
  L_State: "MA",
  L_SystemPrice: 500000,
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1500,
  L_Photos: JSON.stringify(["https://example.com/1.jpg", "https://example.com/2.jpg"]),
};

function renderCard() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={<PropertyCard property={property} />}
        />
        <Route path="/property/:id" element={<div>Detail page for {property.L_ListingID}</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test("clicking the card navigates to the property detail page", () => {
  renderCard();

  fireEvent.click(screen.getByText("123 Main St"));

  expect(screen.getByText("Detail page for 999")).toBeInTheDocument();
});

test("clicking a carousel arrow does not navigate away from the card", () => {
  renderCard();

  fireEvent.click(screen.getByLabelText(/next photo/i));

  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.queryByText("Detail page for 999")).not.toBeInTheDocument();
});
