import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FavoritesPage from "./FavoritesPage";
import { FavoritesProvider } from "../context/FavoritesContext";

const propertiesById = {
  1: {
    id: 1,
    L_ListingID: "1",
    L_Address: "1 Main St",
    L_City: "Boston",
    L_State: "MA",
    L_SystemPrice: 500000,
    L_Keyword2: 3,
    LM_Dec_3: 2,
    LM_Int2_3: 1500,
    L_Photos: "[]",
  },
  2: {
    id: 2,
    L_ListingID: "2",
    L_Address: "2 Elm St",
    L_City: "Cambridge",
    L_State: "MA",
    L_SystemPrice: 700000,
    L_Keyword2: 4,
    LM_Dec_3: 3,
    LM_Int2_3: 2000,
    L_Photos: "[]",
  },
};

function renderFavoritesPage() {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FavoritesProvider>
        <FavoritesPage />
      </FavoritesProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn((url) => {
    const id = url.match(/\/properties\/(\d+)/)[1];
    const property = propertiesById[id];
    if (!property) {
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => property });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("shows a helpful message when there are no favorites", async () => {
  renderFavoritesPage();

  expect(await screen.findByText(/no favorites yet/i)).toBeInTheDocument();
});

test("fetches and displays each favorited property", async () => {
  localStorage.setItem("favoritePropertyIds", JSON.stringify(["1", "2"]));

  renderFavoritesPage();

  expect(await screen.findByText("1 Main St")).toBeInTheDocument();
  expect(screen.getByText("2 Elm St")).toBeInTheDocument();
});

test("unfavoriting a property removes it from the Favorites view immediately", async () => {
  localStorage.setItem("favoritePropertyIds", JSON.stringify(["1", "2"]));

  renderFavoritesPage();

  await screen.findByText("1 Main St");

  const card = screen.getByText("1 Main St").closest(".property-card");
  fireEvent.click(
    card.querySelector("button[aria-label='Remove from favorites']")
  );

  await waitFor(() => {
    expect(screen.queryByText("1 Main St")).not.toBeInTheDocument();
  });
  expect(await screen.findByText("2 Elm St")).toBeInTheDocument();
});
