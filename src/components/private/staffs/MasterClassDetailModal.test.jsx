import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MasterClassDetailModal from "./MasterClassDetailModal";

jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

const mockClassActive = {
  id: 101,
  title: "GCE - English",
  subject: { id: 1, name: "ENGLISH" },
  status: "active",
  created_at: "2026-07-18T10:00:00Z",
  description: "Comprehensive English Language review for GCE candidates.",
  start_date: "2026-09-12",
  end_date: "2026-10-30",
  class_link: "https://zoom.us/j/1234567890",
  staffs: [
    {
      id: 5,
      name: "Marleen Kanari",
      firstname: "Marleen",
      surname: "Kanari",
      role: "tutor",
    },
  ],
  schedules: [
    {
      day_of_week: "monday",
      start_time: "14:00",
      end_time: "15:00",
      duration_minutes: 60,
    },
  ],
};

const mockClassCancelled = {
  ...mockClassActive,
  id: 102,
  status: "cancelled",
};

const mockClassProposed = {
  ...mockClassActive,
  id: 103,
  status: "proposed",
};

const mockClassRescheduled = {
  ...mockClassActive,
  id: 104,
  status: "rescheduled",
};

describe("MasterClassDetailModal Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("staff_token", "fake-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders active master class details, active condition tag, and Edit button without inline cancel/reschedule buttons", () => {
    render(
      <MasterClassDetailModal
        cls={mockClassActive}
        onClose={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByText("GCE - English")).toBeInTheDocument();
    expect(screen.getByText("ENGLISH")).toBeInTheDocument();
    expect(screen.getByText("Marleen Kanari")).toBeInTheDocument();
    expect(screen.getByText("Class Condition")).toBeInTheDocument();
    expect(screen.getAllByText(/active/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Edit Master Class")).toBeInTheDocument();

    // Verify inline cancel and reschedule buttons are NOT present
    expect(screen.queryByText("Reschedule Class")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel Class")).not.toBeInTheDocument();
    expect(screen.queryByText("Reactivate Class")).not.toBeInTheDocument();
  });

  test("renders cancelled condition banner and tag, with disabled meeting link", () => {
    render(
      <MasterClassDetailModal
        cls={mockClassCancelled}
        onClose={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByText(/Class Condition: Cancelled/i)).toBeInTheDocument();
    expect(screen.getByText(/Meeting link disabled \(Class Cancelled\)/i)).toBeInTheDocument();
    expect(screen.getAllByText("Cancelled").length).toBeGreaterThan(0);

    // Verify inline action buttons are not rendered
    expect(screen.queryByText("Cancel Class")).not.toBeInTheDocument();
    expect(screen.queryByText("Reschedule Class")).not.toBeInTheDocument();
  });

  test("renders proposed condition banner and Proposed Class tag when class is proposed", () => {
    render(
      <MasterClassDetailModal
        cls={mockClassProposed}
        onClose={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByText(/Class Condition: Proposed Class/i)).toBeInTheDocument();
    expect(screen.getByText("Proposed Class")).toBeInTheDocument();
    expect(screen.getByText("Tentative")).toBeInTheDocument();

    // Verify inline action buttons are not rendered
    expect(screen.queryByText("Reschedule Class")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel Class")).not.toBeInTheDocument();
  });

  test("renders rescheduled condition banner and Rescheduled Class tag when class is rescheduled", () => {
    render(
      <MasterClassDetailModal
        cls={mockClassRescheduled}
        onClose={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByText(/Class Condition: Rescheduled Class/i)).toBeInTheDocument();
    expect(screen.getByText("Rescheduled Class")).toBeInTheDocument();
    expect(screen.getByText("Proposed Schedule")).toBeInTheDocument();
    expect(screen.getByText("• Rescheduled Session")).toBeInTheDocument();

    // Verify inline action buttons are not rendered
    expect(screen.queryByText("Reschedule Class")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel Class")).not.toBeInTheDocument();
  });

  test("invokes onEdit with class data when Edit Master Class button is clicked", () => {
    const onEdit = jest.fn();
    const onClose = jest.fn();

    render(
      <MasterClassDetailModal
        cls={mockClassRescheduled}
        onClose={onClose}
        onEdit={onEdit}
      />
    );

    const editBtn = screen.getByText("Edit Master Class");
    fireEvent.click(editBtn);

    expect(onClose).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 104,
        title: "GCE - English",
        status: "rescheduled",
      })
    );
  });

  test("invokes onClose when Close button is clicked", () => {
    const onClose = jest.fn();

    render(
      <MasterClassDetailModal
        cls={mockClassActive}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByText("Close");
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
