import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";
import { FavoritesProvider } from "../context/FavoritesContext";

beforeEach(() => {
  localStorage.clear();
});

function renderNavBar() {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FavoritesProvider>
        <NavBar />
      </FavoritesProvider>
    </MemoryRouter>
  );
}

test("shows a favorites count of 0 when there are no favorites", () => {
  renderNavBar();

  expect(screen.getByText(/favorites \(0\)/i)).toBeInTheDocument();
});

test("shows the current favorites count from localStorage", () => {
  localStorage.setItem("favoritePropertyIds", JSON.stringify(["1", "2", "3"]));

  renderNavBar();

  expect(screen.getByText(/favorites \(3\)/i)).toBeInTheDocument();
});

test("links to the listings and favorites pages", () => {
  renderNavBar();

  expect(screen.getByRole("link", { name: /listings/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: /favorites/i })).toHaveAttribute(
    "href",
    "/favorites"
  );
});
