import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="icon" {...props} />,
}));

// Mock StaffDashboardLayout
jest.mock("../../../components/private/staffs/DashboardLayout.jsx", () => {
  return function MockStaffDashboardLayout({ children }) {
    return <div data-testid="staff-dashboard-layout">{children}</div>;
  };
});

// Mock CreateMasterClassModal
jest.mock("../../../components/private/staffs/AdminMasterclassModal.jsx", () => {
  return function MockModal() {
    return null;
  };
});

// Mock Axios
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}));

import AdminCalendar from "./AdminCalendar";

describe("AdminCalendar Video Vault Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("staff_token", "test-token");
    localStorage.setItem("staff_info", JSON.stringify({ role: "admin", name: "Administrator" }));

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    axios.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 1,
            title: "WAEC Mathematics Live Session",
            subject_name: "Mathematics",
            topic: "Calculus",
            tutor: { id: 1, name: "Dr. Smith" },
            session_date: today,
            starts_at: "23:00",
            ends_at: "23:59",
            recording_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
        ],
      },
    });
  });

  test("clicking the Video Vault button in the top action bar navigates to /staffs/recorded-classes", async () => {
    render(<AdminCalendar />);

    const vaultButton = await screen.findByRole("button", { name: /video vault/i });
    expect(vaultButton).toBeInTheDocument();

    fireEvent.click(vaultButton);
    expect(mockNavigate).toHaveBeenCalledWith("/staffs/recorded-classes");
  });

  test("clicking the Video Recordings KPI card navigates to /staffs/recorded-classes", async () => {
    render(<AdminCalendar />);

    const vaultCard = await screen.findByTitle(/Click to view all recorded classes, views, and watch time analytics/i);
    expect(vaultCard).toBeInTheDocument();

    fireEvent.click(vaultCard);
    expect(mockNavigate).toHaveBeenCalledWith("/staffs/recorded-classes");
  });

  test("renders Reschedule and Cancel Class action buttons in session detail modal and opens action modals", async () => {
    render(<AdminCalendar />);

    // Click on the session chip to open modal
    const sessionChip = await screen.findByText("Calculus");
    fireEvent.click(sessionChip);

    // Verify detail modal opened with Reschedule and Cancel buttons
    const rescheduleBtn = await screen.findByRole("button", { name: /reschedule/i });
    const cancelBtn = await screen.findByRole("button", { name: /cancel class/i });
    expect(rescheduleBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // Clicking Cancel opens the cancellation modal
    fireEvent.click(cancelBtn);
    expect(await screen.findByText(/Cancel Class Session/i)).toBeInTheDocument();
    expect(screen.getByText(/Reason for Cancellation/i)).toBeInTheDocument();
  });
});
