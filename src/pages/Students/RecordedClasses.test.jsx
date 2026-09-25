import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

// Mock Iconify Icon
jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

// Mock AuthContext
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "fake-student-token",
    setIsClassActive: jest.fn(),
    student: { firstname: "John", surname: "Doe" },
  }),
}));

// Mock DashboardLayout
jest.mock("../../components/private/Students/DashboardLayout.jsx", () => {
  return function MockDashboardLayout({ children }) {
    return <div data-testid="dashboard-layout">{children}</div>;
  };
});

// Mock StaffDashboardLayout
jest.mock("../../components/private/staffs/DashboardLayout.jsx", () => {
  return function MockStaffDashboardLayout({ children }) {
    return <div data-testid="staff-dashboard-layout">{children}</div>;
  };
});

import RecordedClasses, { formatViewCount } from "./RecordedClasses";

// Mock Axios
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
}));

describe("RecordedClasses & View Counter Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("formatViewCount Helper", () => {
    test("formats counts correctly into YouTube-style view strings", () => {
      expect(formatViewCount(0)).toBe("0 views");
      expect(formatViewCount(1)).toBe("1 view");
      expect(formatViewCount(20)).toBe("20 views");
      expect(formatViewCount(999)).toBe("999 views");
      expect(formatViewCount(1200)).toBe("1.2K views");
      expect(formatViewCount(15000)).toBe("15K views");
      expect(formatViewCount(2500000)).toBe("2.5M views");
    });
  });

  describe("Student View (Privacy Guarded)", () => {
    test("renders aggregate view count without opening viewer modal for students", async () => {
      const mockClasses = [
        {
          id: 78,
          title: "GCE - English Language",
          subject: "English",
          tutor: "Instructor",
          views: 20,
          total_views: 20,
          unique_viewers: 5,
          viewers: [], // Backend gives empty viewers to students
        },
      ];

      axios.get.mockResolvedValueOnce({
        data: { success: true, data: mockClasses },
      });

      render(<RecordedClasses />);

      await waitFor(() => {
        expect(screen.getByText("20 views")).toBeInTheDocument();
      });

      // Confirm there is no staff badge with users count or interactive analytics button
      expect(screen.queryByTitle(/Click to view student watch attendance/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Class Viewers & Engagement/i)).not.toBeInTheDocument();
    });
  });

  describe("Admin / Staff Engagement Analytics Modal", () => {
    test("allows staff to open viewers modal with metrics, repeat watchers, and privacy compliance", async () => {
      localStorage.setItem("staff_token", "fake-staff-token");

      const mockClasses = [
        {
          id: 78,
          title: "GCE - English Language",
          subject: "English",
          tutor: "Instructor",
          views: 4,
          total_views: 4,
          unique_viewers: 2,
          viewers: [
            {
              student_id: 1,
              firstname: "Tengen",
              surname: "Izui",
              avatar: null,
              view_count: 3,
              is_repeat_viewer: true,
              last_viewed_at: "2026-09-23T12:58:44.000000Z",
            },
            {
              student_id: 2,
              firstname: "Tanjiro",
              surname: "Kamado",
              avatar: null,
              view_count: 1,
              is_repeat_viewer: false,
              last_viewed_at: "2026-09-23T11:00:00.000000Z",
            },
          ],
        },
      ];

      axios.get.mockImplementation((url) => {
        if (url.includes("/api/students/recorded-classes")) {
          return Promise.resolve({ data: { success: true, data: mockClasses } });
        }
        if (url.includes("/viewers")) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                class_session_id: 78,
                session_title: "GCE - English Language",
                subject: "English",
                total_views: 4,
                unique_viewers: 2,
                repeat_viewers: 1,
                viewers: mockClasses[0].viewers,
              },
            },
          });
        }
        return Promise.resolve({ data: { success: true } });
      });

      render(<RecordedClasses />);

      // Wait for classes to load and verify staff analytics badge exists
      const analyticsButton = await screen.findByTitle(/Click to view student watch attendance/i);
      expect(analyticsButton).toBeInTheDocument();

      // Click badge to open modal
      fireEvent.click(analyticsButton);

      // Verify modal elements
      await waitFor(() => {
        expect(screen.getByText(/What are Unique Viewers\?/i)).toBeInTheDocument();
        expect(screen.getByText("Tengen Izui")).toBeInTheDocument();
        expect(screen.getByText("Tanjiro Kamado")).toBeInTheDocument();
      });

      // Verify repeat viewer indicators
      expect(screen.getByText(/Rewatched 2x/i)).toBeInTheDocument();

      // Verify privacy requirement: email should NEVER appear in the document
      expect(screen.queryByText(/@/i)).not.toBeInTheDocument();
    });
  });

  describe("Course Badge & Program Filtering", () => {
    test("displays course badge and filters recordings by program tab", async () => {
      const mockMultiCourseClasses = [
        {
          id: 101,
          title: "GCE - English Revision",
          subject: "English",
          course_name: "GCE",
          views: 12,
        },
        {
          id: 102,
          title: "WAEC - Physics Mechanics",
          subject: "Physics",
          course_name: "WAEC",
          views: 8,
        },
      ];

      axios.get.mockResolvedValueOnce({
        data: { success: true, data: mockMultiCourseClasses },
      });

      render(<RecordedClasses />);

      // Verify badges are displayed
      expect(await screen.findByText("GCE - English Revision")).toBeInTheDocument();
      expect(screen.getByText("WAEC - Physics Mechanics")).toBeInTheDocument();
      expect(screen.getByText("GCE")).toBeInTheDocument();
      expect(screen.getByText("WAEC")).toBeInTheDocument();

      // Program filter tabs should be present when multiple programs exist
      const gceTab = screen.getByText(/GCE \(1\)/i);
      expect(gceTab).toBeInTheDocument();

      // Click GCE tab to filter out WAEC
      fireEvent.click(gceTab);
      expect(screen.getByText("GCE - English Revision")).toBeInTheDocument();
      expect(screen.queryByText("WAEC - Physics Mechanics")).not.toBeInTheDocument();

      // Click All Programs tab to restore
      const allTab = screen.getByText(/All Programs \(2\)/i);
      fireEvent.click(allTab);
      expect(screen.getByText("GCE - English Revision")).toBeInTheDocument();
      expect(screen.getByText("WAEC - Physics Mechanics")).toBeInTheDocument();
    });
  });
});

