import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

// The "should throw" flag lives outside the component and is only ever
// flipped by the test itself (never by the component's own render), so it
// stays consistent even if React re-invokes the render function more than
// once for the same commit (which it does when recovering from an error
// during a concurrent render pass).
function createThrowingComponent() {
  const state = { shouldThrow: true };
  function MaybeThrows() {
    if (state.shouldThrow) {
      throw new Error("Boom");
    }
    return <div>Recovered content</div>;
  }
  return { MaybeThrows, state };
}

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

test("renders children normally when there is no error", () => {
  render(
    <ErrorBoundary>
      <div>All good</div>
    </ErrorBoundary>
  );

  expect(screen.getByText("All good")).toBeInTheDocument();
});

test("shows a recovery UI instead of crashing when a child throws during render", () => {
  const { MaybeThrows } = createThrowingComponent();

  render(
    <ErrorBoundary>
      <MaybeThrows />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
});

test("clicking Try Again re-renders the children once the underlying problem is gone", () => {
  const { MaybeThrows, state } = createThrowingComponent();

  render(
    <ErrorBoundary>
      <MaybeThrows />
    </ErrorBoundary>
  );

  state.shouldThrow = false;
  fireEvent.click(screen.getByRole("button", { name: /try again/i }));

  expect(screen.getByText("Recovered content")).toBeInTheDocument();
});
