import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ListingsPage from "./ListingsPage";
import { FavoritesProvider } from "../hooks/FavoritesContext";

function jsonResponse(total, offset) {
  const results = Array.from({ length: 20 }, (_, i) => ({
    id: offset + i,
    L_ListingID: String(offset + i),
    L_Address: `${offset + i} Test St`,
    L_City: "Testville",
    L_State: "CA",
    L_SystemPrice: 500000,
    L_Keyword2: 3,
    LM_Dec_3: 2,
    LM_Int2_3: 1500,
    L_Photos: "[]",
  }));
  return { ok: true, status: 200, json: async () => ({ total, limit: 20, offset, results }) };
}

function renderListingsPage() {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FavoritesProvider>
        <ListingsPage />
      </FavoritesProvider>
    </MemoryRouter>
  );
}

function lastRequestUrl() {
  const calls = global.fetch.mock.calls;
  return calls[calls.length - 1][0];
}

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = jest.fn();
  global.fetch = jest.fn((url) => {
    const params = new URL(url, "http://localhost").searchParams;
    const offset = Number(params.get("offset")) || 0;
    return Promise.resolve(jsonResponse(480, offset));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("choosing a sort option sends sortBy/sortOrder and resets to page 1", async () => {
  renderListingsPage();
  await screen.findByText(/showing 1-20 of 480/i);

  fireEvent.click(screen.getByRole("button", { name: "3" }));
  await screen.findByText(/showing 41-60 of 480/i);

  fireEvent.change(screen.getByLabelText(/sort by/i), {
    target: { value: "price-desc" },
  });

  await screen.findByText(/showing 1-20 of 480/i);
  const url = lastRequestUrl();
  expect(url).toContain("sortBy=price");
  expect(url).toContain("sortOrder=desc");
  expect(url).toContain("offset=0");
});

test("sort persists across a page change", async () => {
  renderListingsPage();
  await screen.findByText(/showing 1-20 of 480/i);

  fireEvent.change(screen.getByLabelText(/sort by/i), {
    target: { value: "price-asc" },
  });
  await screen.findByText(/showing 1-20 of 480/i);

  fireEvent.click(screen.getByRole("button", { name: "5" }));
  await screen.findByText(/showing 81-100 of 480/i);

  const url = lastRequestUrl();
  expect(url).toContain("sortBy=price");
  expect(url).toContain("sortOrder=asc");
  expect(url).toContain("offset=80");
});

test("applying a new filter resets the sort back to default", async () => {
  renderListingsPage();
  await screen.findByText(/showing 1-20 of 480/i);

  fireEvent.change(screen.getByLabelText(/sort by/i), {
    target: { value: "price-asc" },
  });
  await screen.findByText(/showing 1-20 of 480/i);

  userEvent.type(screen.getByLabelText(/city/i), "Testville");
  userEvent.click(screen.getByRole("button", { name: /^search$/i }));

  await screen.findByText(/showing 1-20 of 480/i);
  const url = lastRequestUrl();
  expect(url).not.toContain("sortBy");
  expect(url).toContain("city=Testville");
  expect(screen.getByLabelText(/sort by/i)).toHaveValue("");
});
