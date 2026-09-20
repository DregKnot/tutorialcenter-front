import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StudentLogin from "./StudentLogin";
import GuardianLogin from "./GuardianLogin";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

// Mock Axios with explicit factory to bypass Jest ESM parsing of axios v1.x
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

describe("Login Back Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("StudentLogin back button navigates back (-1) when history exists", () => {
    window.history.pushState({ idx: 1 }, "");

    render(<StudentLogin />);

    const backBtn = screen.getByTitle("Go Back");
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("GuardianLogin back button navigates back (-1) when history exists", () => {
    window.history.pushState({ idx: 1 }, "");

    render(<GuardianLogin />);

    const backBtn = screen.getByTitle("Go Back");
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("StudentLogin back button falls back to /login when no prior history", () => {
    window.history.replaceState({ idx: 0 }, "");

    render(<StudentLogin />);

    const backBtn = screen.getByTitle("Go Back");
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
