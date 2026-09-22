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

// Mock Iconify Icon
jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

// Mock AuthContext
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "mock-student-jwt-token",
    student: { id: 1, name: "Test Student" },
  }),
}));

// Mock DashboardLayout to render children directly without full sidebar/header overhead
jest.mock("../../components/private/Students/DashboardLayout.jsx", () => {
  return function MockDashboardLayout({ children }) {
    return <div data-testid="student-dashboard-layout">{children}</div>;
  };
});

import axios from "axios";
import StudentCalendar from "./StudentCalendar";

describe("StudentCalendar Component", () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const mockSessions = [
    {
      id: 101,
      title: "Advanced Physics Seminar",
      session_date: todayStr,
      starts_at: "08:00:00",
      ends_at: "23:59:59",
      class_link: "https://zoom.us/j/1234567890",
      // Crucial test case: subject is an Eloquent object from Laravel API
      subject: {
        id: 42,
        name: "Physics",
        slug: "physics",
      },
      class: {
        id: 7,
        title: "Advanced Physics Seminar",
        subject: {
          id: 42,
          name: "Physics",
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/students/class/schedule") || url.includes("/api/students/calendar/schedule")) {
        return Promise.resolve({
          data: {
            sessions: mockSessions,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  test("renders calendar and displays class titles safely with object subject", async () => {
    render(<StudentCalendar />);

    await waitFor(() => {
      expect(screen.getByText("Advanced Physics Seminar")).toBeInTheDocument();
    });
  });

  test("clicking a calendar cell opens selectedDateModal and safely renders object subject name without crashing", async () => {
    render(<StudentCalendar />);

    // Wait for the session to be visible in the month grid
    await waitFor(() => {
      expect(screen.getByText("Advanced Physics Seminar")).toBeInTheDocument();
    });

    // Find the day cell containing today's date
    const dayNumber = today.getDate().toString();
    const dayElements = screen.getAllByText(dayNumber);
    const cell = dayElements[0].closest(".group") || dayElements[0].closest('[class*="cursor-pointer"]');
    expect(cell).not.toBeNull();

    // Trigger cell click (the core user trigger)
    fireEvent.click(cell);

    // The modal should open showing the date header and the subject name "Physics"
    await waitFor(() => {
      expect(screen.getByText("Physics")).toBeInTheDocument();
    });
    expect(screen.getByText(/Class Session/i)).toBeInTheDocument();
    expect(screen.getByText("Join Class Now")).toBeInTheDocument();
  });

  test("clicking Join Class Now in modal triggers attendance recording and navigates to in-web classroom", async () => {
    mockNavigate.mockClear();

    render(<StudentCalendar />);

    await waitFor(() => {
      expect(screen.getByText("Advanced Physics Seminar")).toBeInTheDocument();
    });

    const dayNumber = today.getDate().toString();
    const dayElements = screen.getAllByText(dayNumber);
    const cell = dayElements[0].closest(".group") || dayElements[0].closest('[class*="cursor-pointer"]');
    fireEvent.click(cell);

    await waitFor(() => {
      expect(screen.getByText("Join Class Now")).toBeInTheDocument();
    });

    const joinBtn = screen.getByText("Join Class Now");
    fireEvent.click(joinBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/zoom/masterclass/class/101");

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/students/classes/attendance/join"),
      { class_session_id: 101 },
      expect.any(Object)
    );
  });

  test("closing selectedDateModal dismisses popup cleanly", async () => {
    render(<StudentCalendar />);

    await waitFor(() => {
      expect(screen.getByText("Advanced Physics Seminar")).toBeInTheDocument();
    });

    const dayNumber = today.getDate().toString();
    const dayElements = screen.getAllByText(dayNumber);
    const cell = dayElements[0].closest(".group") || dayElements[0].closest('[class*="cursor-pointer"]');
    fireEvent.click(cell);

    await waitFor(() => {
      expect(screen.getByText("Physics")).toBeInTheDocument();
    });

    const closeBtn = screen.getByText("Close");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("Physics")).not.toBeInTheDocument();
    });
  });
});
