import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import axios from "axios";

jest.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="icon" {...props} />,
}));

jest.mock("../../../components/private/staffs/DashboardLayout.jsx", () => {
  return function MockLayout({ children }) {
    return <div data-testid="staff-layout">{children}</div>;
  };
});

jest.mock("../../../components/private/staffs/AdminMasterclassModal.jsx", () => {
  return function MockClassModal() {
    return null;
  };
});

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
}));

import BootcampManagement from "./BootcampManagement";

describe("BootcampManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("staff_token", "staff-token");
    localStorage.setItem("staff_role", "admin");

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/admin/classes/all")) {
        return Promise.resolve({
          data: {
            classes: [
              {
                id: 1,
                title: "JAMB - Use of English",
                is_private: false,
                status: "active",
                zoom_join_url: "https://zoom.us/j/jamb-eng",
                staffs: [
                  { id: 1, firstname: "Olugbenga", surname: "Raymond", role: "coo", pivot: { role: "assistant" } },
                  { id: 5, firstname: "Blessing", surname: "Adeyemi", role: "tutor", pivot: { role: "lead" } },
                ],
                schedules: [{ day_of_week: "monday", start_time: "17:00", end_time: "19:00" }],
              },
              {
                id: 99,
                title: "JAMB - Use of English (1-on-1)",
                is_private: true,
                status: "active",
                zoom_join_url: "https://zoom.us/j/private-only",
              },
            ],
          },
        });
      }
      if (url.includes("/api/admin/bootcamp/cbts")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 10,
                title: "Week 1 - JAMB Use of English",
                subject_track: "jamb_english",
                subject_label: "JAMB Use of English",
                week_start_date: "2026-11-23",
                access_token: "abc123token",
                duration_minutes: 20,
                is_active: true,
                is_open: true,
                questions_count: 20,
                submitted_attempts_count: 4,
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  test("renders Mon-Thu tracks with resolved lead tutor and CBT card", async () => {
    render(<BootcampManagement />);

    expect(await screen.findByText("Bootcamp Command Center")).toBeInTheDocument();
    expect(await screen.findByText("Blessing Adeyemi")).toBeInTheDocument();
    expect(screen.queryByText("Olugbenga Raymond")).not.toBeInTheDocument();
    expect(screen.queryByText("Switch Class")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit Class")).not.toBeInTheDocument();
    expect(screen.getByText("Week 1 - JAMB Use of English")).toBeInTheDocument();
    expect(screen.getByText("Create Weekly CBT")).toBeInTheDocument();
  });

  test("hides mutating action buttons for read-only COO role while keeping copy links", async () => {
    localStorage.setItem("staff_role", "coo");

    render(<BootcampManagement />);

    expect(await screen.findByText("Blessing Adeyemi")).toBeInTheDocument();
    expect(screen.queryByText("Create Weekly CBT")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit Questions")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy Class Link/i })).toBeInTheDocument();
  });

  test("opens Create Weekly CBT modal defaulted to 20 question slots", async () => {
    render(<BootcampManagement />);

    const createBtn = await screen.findByRole("button", { name: /Create Weekly CBT/i });
    fireEvent.click(createBtn);

    expect(await screen.findByText(/20 Slots/i)).toBeInTheDocument();
  });
});
