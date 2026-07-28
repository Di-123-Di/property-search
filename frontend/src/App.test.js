import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ total: 0, limit: 20, offset: 0, results: [] }),
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders the property listings heading", async () => {
  render(<App />);
  const heading = await screen.findByText(/property listings/i);
  expect(heading).toBeInTheDocument();
});
