/* eslint-disable testing-library/no-node-access */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourseAdvisorCalendar from "./CourseAdvisorCalendar";
import axios from "axios";

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

jest.mock("../../../components/private/staffs/DashboardLayout.jsx", () => {
  return function MockStaffDashboardLayout({ children }) {
    return <div data-testid="advisor-dashboard-layout">{children}</div>;
  };
});

jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

describe("CourseAdvisorCalendar Component", () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const mockSessions = [
    {
      id: 201,
      title: "GCE - English",
      session_date: todayStr,
      starts_at: "14:00:00",
      ends_at: "15:00:00",
      class_link: "https://zoom.us/j/9876543210",
      subject: {
        id: 11,
        name: "English",
      },
      class: {
        id: 1,
        title: "GCE - English",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("staff_token", "fake-token");
    axios.get.mockResolvedValue({
      data: {
        sessions: mockSessions,
      },
    });
  });

  test("clicking Start Class Now switches directly to Join on Web and Join via Zoom App buttons without modal popup", async () => {
    render(<CourseAdvisorCalendar />);

    // Wait for sessions to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Find session in the calendar grid and click date or session to open the day modal
    const sessionCard = await screen.findByText("GCE - English");
    expect(sessionCard).toBeInTheDocument();

    // Click the day cell to open selectedDateModal
    const dayCell = sessionCard.closest(".cursor-pointer") || sessionCard.closest("div");
    fireEvent.click(dayCell);

    // Day modal should display "Class Session Scheduled" and "Start Class Now"
    const startClassBtn = await screen.findByRole("button", { name: /start class now/i });
    expect(startClassBtn).toBeInTheDocument();

    // Ensure no Choose Join Method modal dialog is in the DOM
    expect(screen.queryByText(/choose join method/i)).not.toBeInTheDocument();

    // Click "Start Class Now"
    fireEvent.click(startClassBtn);

    // Should now display "Join on Web" and "Join via Zoom App" buttons inline
    const joinWebBtn = await screen.findByRole("button", { name: /join on web/i });
    const joinAppBtn = await screen.findByRole("button", { name: /join via zoom app/i });
    expect(joinWebBtn).toBeInTheDocument();
    expect(joinAppBtn).toBeInTheDocument();

    // Still no modal popup dialog
    expect(screen.queryByText(/choose join method/i)).not.toBeInTheDocument();

    // Click "Join on Web"
    fireEvent.click(joinWebBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/classroom/201");

    // Click "Join via Zoom App"
    fireEvent.click(joinAppBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/staffs/meet/app", {
      state: {
        class_link: "https://zoom.us/j/9876543210",
        class_schedule_id: 201,
        topic: "GCE - English",
      },
    });

    // Test Cancel button reverts to Start Class Now
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.getByRole("button", { name: /start class now/i })).toBeInTheDocument();
  });
});
