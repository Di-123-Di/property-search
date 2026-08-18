import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { FavoritesProvider } from "../context/FavoritesContext";

const property = {
  id: 1,
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
    <MemoryRouter
      initialEntries={["/"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <FavoritesProvider>
        <Routes>
          <Route path="/" element={<PropertyCard property={property} />} />
          <Route path="/property/:id" element={<div>Detail page for {property.L_ListingID}</div>} />
        </Routes>
      </FavoritesProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

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

test("clicking the favorite button does not navigate away from the card", () => {
  renderCard();

  fireEvent.click(screen.getByLabelText(/add to favorites/i));

  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.queryByText("Detail page for 999")).not.toBeInTheDocument();
});

test("clicking the favorite button toggles its filled/empty state and persists to localStorage", () => {
  renderCard();

  const favoriteButton = screen.getByLabelText(/add to favorites/i);
  expect(favoriteButton).toHaveTextContent("♡");

  fireEvent.click(favoriteButton);

  const filledButton = screen.getByLabelText(/remove from favorites/i);
  expect(filledButton).toHaveTextContent("♥");
  expect(JSON.parse(localStorage.getItem("favoritePropertyIds"))).toEqual(["999"]);

  fireEvent.click(filledButton);

  expect(screen.getByLabelText(/add to favorites/i)).toHaveTextContent("♡");
  expect(JSON.parse(localStorage.getItem("favoritePropertyIds"))).toEqual([]);
});
