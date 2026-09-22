/* eslint-disable testing-library/no-node-access */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

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

jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

// Mock AuthContext
jest.mock("../../../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "mock-student-token",
    student: { id: 1, name: "Test Student" },
  }),
}));

import axios from "axios";
import MiniCalendarWidget from "./MiniCalendarWidget";

describe("MiniCalendarWidget Component", () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const mockSessions = [
    {
      id: 99,
      title: "Chemistry Masterclass",
      session_date: todayStr,
      starts_at: "00:00:00",
      ends_at: "23:59:59",
      class_link: "https://us05web.zoom.us/j/999888777?pwd=abc",
      // Crucial test case: subject is an Eloquent object from Laravel
      subject: {
        id: 10,
        name: "Chemistry",
        slug: "chemistry",
      },
      class: {
        id: 5,
        title: "Chemistry Masterclass",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        sessions: mockSessions,
      },
    });
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  test("renders session card with object subject without crashing", async () => {
    render(<MiniCalendarWidget />);

    await waitFor(() => {
      expect(screen.getByText("Chemistry Masterclass")).toBeInTheDocument();
    });
  });

  test("opens SessionModal on card click and safely renders subject name as string", async () => {
    render(<MiniCalendarWidget />);

    await waitFor(() => {
      expect(screen.getByText("Chemistry Masterclass")).toBeInTheDocument();
    });

    // Click the card to view details (the trigger that previously crashed with 'Objects are not valid as React child')
    const card = screen.getByText("Chemistry Masterclass").closest('[role="button"]');
    expect(card).not.toBeNull();
    fireEvent.click(card);

    // Verify modal is open and subject name "Chemistry" is displayed safely
    await waitFor(() => {
      expect(screen.getByText("Chemistry")).toBeInTheDocument();
    });
    expect(screen.getByText("Class Session")).toBeInTheDocument();
    expect(screen.getByText("Join Live Classroom")).toBeInTheDocument();
  });

  test("clicking Join Live Classroom in modal joins in web and pings attendance without white screen", async () => {
    mockNavigate.mockClear();

    render(<MiniCalendarWidget />);

    await waitFor(() => {
      expect(screen.getByText("Chemistry Masterclass")).toBeInTheDocument();
    });

    const card = screen.getByText("Chemistry Masterclass").closest('[role="button"]');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText("Join Live Classroom")).toBeInTheDocument();
    });

    const joinBtn = screen.getByText("Join Live Classroom");
    fireEvent.click(joinBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/zoom/masterclass/class/99");

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/students/classes/attendance/join"),
      { class_session_id: 99 },
      expect.any(Object)
    );
  });
});
