import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

// A component that intentionally throws to test ErrorBoundary
function ProblemChild({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Deliberate test render crash");
  }
  return <div>Everything is fine</div>;
}

describe("ErrorBoundary Component", () => {
  // Suppress console.error during deliberate error throwing in test
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  test("renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Everything is fine")).toBeInTheDocument();
  });

  test("catches child error and renders graceful recovery UI instead of white screen", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected display issue/i)).toBeInTheDocument();
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
  });
});
