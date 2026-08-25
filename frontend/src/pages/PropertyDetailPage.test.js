import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PropertyDetailPage from "./PropertyDetailPage";

const property = {
  L_ListingID: "999",
  L_Address: "123 Main St",
  L_City: "Boston",
  L_State: "MA",
  L_Zip: "02118",
  L_SystemPrice: 500000,
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1500,
  YearBuilt: 1998,
  L_Remarks: "A lovely home.",
  L_Type_: "SingleFamilyResidence",
  L_Status: "Active",
  StoriesTotal: 2,
  LotSizeSquareFeet: "5000",
  Heating: "Central",
  Cooling: "CentralAir",
  L_DisplayId: "999",
  ListAgentFullName: "Jane Doe",
  LO1_OrganizationName: "Acme Realty",
  L_Photos: JSON.stringify(["https://example.com/1.jpg"]),
  LMD_MP_Latitude: "34.0",
  LMD_MP_Longitude: "-118.0",
};

function renderAtId(id) {
  render(
    <MemoryRouter
      initialEntries={[`/property/${id}`]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/" element={<div>Listings page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  process.env = { ...process.env, REACT_APP_GOOGLE_MAPS_API_KEY: "test-key" };
});

afterEach(() => {
  jest.resetAllMocks();
});

test("shows all property fields once loaded", async () => {
  global.fetch = jest.fn((url) => {
    if (url.endsWith("/openhouses")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => property });
  });

  renderAtId("999");

  await screen.findByText("$500,000");

  expect(screen.getByText(/123 main st, boston, ma 02118/i)).toBeInTheDocument();
  expect(screen.getByText(/3 beds/i)).toBeInTheDocument();
  expect(screen.getByText(/2 baths/i)).toBeInTheDocument();
  expect(screen.getByText(/1500 sqft/i)).toBeInTheDocument();
  expect(screen.getByText(/built 1998/i)).toBeInTheDocument();
  expect(screen.getByText("A lovely home.")).toBeInTheDocument();
  expect(screen.getByText(/no open houses scheduled/i)).toBeInTheDocument();
  expect(screen.getByTitle(/property location/i)).toBeInTheDocument();
});

test("a Back link returns to the listings page", async () => {
  global.fetch = jest.fn((url) => {
    if (url.endsWith("/openhouses")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => property });
  });

  renderAtId("999");

  await screen.findByText("$500,000");
  expect(screen.getByRole("link", { name: /back to listings/i })).toHaveAttribute(
    "href",
    "/"
  );
});

test("visiting an invalid id shows an error instead of crashing", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: false, status: 404, json: async () => ({ error: "Property not found" }) })
  );

  renderAtId("invalid-id");

  await screen.findByText(/error/i);
  expect(screen.getByText(/property not found/i)).toBeInTheDocument();
});

test("does not render a map when latitude/longitude are missing", async () => {
  const propertyWithoutCoords = { ...property, LMD_MP_Latitude: null, LMD_MP_Longitude: null };
  global.fetch = jest.fn((url) => {
    if (url.endsWith("/openhouses")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => propertyWithoutCoords });
  });

  renderAtId("999");

  await screen.findByText("$500,000");
  expect(screen.queryByTitle(/property location/i)).not.toBeInTheDocument();
});
