import { render, screen } from "@testing-library/react";
import OpenHouseList from "./OpenHouseList";

test("shows a helpful message when there are no open houses", () => {
  render(<OpenHouseList openHouses={[]} />);
  expect(screen.getByText(/no open houses scheduled/i)).toBeInTheDocument();
});

test("shows the formatted date and time for each open house", () => {
  const openHouses = [
    {
      id: 1,
      OpenHouseDate: "2026-06-16",
      OH_StartTime: "09:00:00",
      OH_EndTime: "13:30:00",
      all_data: JSON.stringify({}),
    },
  ];

  render(<OpenHouseList openHouses={openHouses} />);

  expect(screen.getByText(/june 16, 2026/i)).toBeInTheDocument();
  expect(screen.getByText(/9:00 am/i)).toBeInTheDocument();
  expect(screen.getByText(/1:30 pm/i)).toBeInTheDocument();
});

// Debug Challenge: OpenHouseRemarks only exists inside the all_data JSON
// blob, not as a top-level column, so it has to be parsed out rather than
// read directly off the record.
test("extracts and displays OpenHouseRemarks from inside the all_data JSON blob", () => {
  const openHouses = [
    {
      id: 1,
      OpenHouseDate: "2026-06-16",
      OH_StartTime: "09:00:00",
      OH_EndTime: "13:30:00",
      all_data: JSON.stringify({ OpenHouseRemarks: "Refreshments provided" }),
    },
  ];

  render(<OpenHouseList openHouses={openHouses} />);

  expect(screen.getByText("Refreshments provided")).toBeInTheDocument();
});

test("does not render remarks when all_data has none", () => {
  const openHouses = [
    {
      id: 1,
      OpenHouseDate: "2026-06-16",
      OH_StartTime: "09:00:00",
      OH_EndTime: "13:30:00",
      all_data: JSON.stringify({ SomeOtherField: "x" }),
    },
  ];

  const { container } = render(<OpenHouseList openHouses={openHouses} />);
  expect(container.querySelector(".open-house-remarks")).not.toBeInTheDocument();
});

test("does not crash when all_data is malformed JSON", () => {
  const openHouses = [
    {
      id: 1,
      OpenHouseDate: "2026-06-16",
      OH_StartTime: "09:00:00",
      OH_EndTime: "13:30:00",
      all_data: "not valid json",
    },
  ];

  render(<OpenHouseList openHouses={openHouses} />);
  expect(screen.getByText(/june 16, 2026/i)).toBeInTheDocument();
});
