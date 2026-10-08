import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import AdminSessionActionModal from "./AdminSessionActionModal";

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

jest.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="icon" {...props} />,
}));

describe("AdminSessionActionModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const mockActiveSession = {
    id: 101,
    subject_name: "Physics",
    topic: "Thermodynamics & Heat Transfer",
    session_date: "2099-10-15",
    starts_at: "10:00",
    ends_at: "11:30",
    class_tier: "JAMB / O-Levels",
    tutor: { id: 5, name: "Engr. Adebayo", initials: "EA" },
  };

  const mockClashingSession = {
    id: 202,
    subject_name: "Chemistry",
    topic: "Organic Hydrocarbons",
    session_date: "2099-10-16",
    starts_at: "10:00",
    ends_at: "11:30",
    class_tier: "JAMB / O-Levels",
    tutor: { id: 8, name: "Dr. Dele Okafor", initials: "DO" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Cancel Mode", () => {
    test("renders cancel session modal with reason options and warning note", () => {
      render(
        <AdminSessionActionModal
          isOpen={true}
          mode="cancel"
          session={mockActiveSession}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          API_BASE_URL="http://test.api"
          token="test-token"
        />
      );

      expect(screen.getByText("Cancel Class Session")).toBeInTheDocument();
      expect(screen.getByText("Reason for Cancellation")).toBeInTheDocument();
      expect(screen.getByText(/Student Dashboard Notification Alert/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /confirm cancellation/i })).toBeInTheDocument();
    });

    test("successfully cancels session and triggers onSuccess callback", async () => {
      axios.patch.mockResolvedValueOnce({ data: { success: true } });

      render(
        <AdminSessionActionModal
          isOpen={true}
          mode="cancel"
          session={mockActiveSession}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          API_BASE_URL="http://test.api"
          token="test-token"
        />
      );

      const confirmBtn = screen.getByRole("button", { name: /confirm cancellation/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            action: "cancel",
            session: expect.objectContaining({
              id: 101,
              status: "cancelled",
              is_cancelled: true,
            }),
          })
        );
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Reschedule Mode", () => {
    test("renders reschedule time picker with date and time inputs", () => {
      render(
        <AdminSessionActionModal
          isOpen={true}
          mode="reschedule"
          session={mockActiveSession}
          allSessions={[mockActiveSession]}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          API_BASE_URL="http://test.api"
          token="test-token"
        />
      );

      expect(screen.getByText("Reschedule Master Class")).toBeInTheDocument();
      expect(screen.getByText(/New Date \(New Day\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Time/i)).toBeInTheDocument();
      expect(screen.getByText(/End Time/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /verify & reschedule/i })).toBeInTheDocument();
    });

    test("detects clash when moving to slot occupied by another active session and allows replacing", async () => {
      render(
        <AdminSessionActionModal
          isOpen={true}
          mode="reschedule"
          session={mockActiveSession}
          allSessions={[mockActiveSession, mockClashingSession]}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          API_BASE_URL="http://test.api"
          token="test-token"
        />
      );

      // Change date to match clashing session (2099-10-16) and times (10:00 - 11:30)
      const dateInput = screen.getByLabelText ? screen.getByDisplayValue(mockActiveSession.session_date) : document.querySelector('input[type="date"]');
      fireEvent.change(dateInput, { target: { value: "2099-10-16" } });

      const verifyBtn = screen.getByRole("button", { name: /verify & reschedule/i });
      fireEvent.click(verifyBtn);

      // Verify clash resolution step appears
      expect(await screen.findByText(/Time Slot Clash Detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Organic Hydrocarbons/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /replace this class/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /pick another time/i })).toBeInTheDocument();

      // Test replacing the clashing class
      axios.patch.mockResolvedValueOnce({ data: { success: true } });
      const replaceBtn = screen.getByRole("button", { name: /replace this class/i });
      fireEvent.click(replaceBtn);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            action: "reschedule",
            replacedSessionId: 202,
            session: expect.objectContaining({
              id: 101,
              session_date: "2099-10-16",
              status: "rescheduled",
            }),
          })
        );
      });
    });

    test("allows user to go back from clash screen to pick another time", async () => {
      render(
        <AdminSessionActionModal
          isOpen={true}
          mode="reschedule"
          session={mockActiveSession}
          allSessions={[mockActiveSession, mockClashingSession]}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          API_BASE_URL="http://test.api"
          token="test-token"
        />
      );

      const dateInput = document.querySelector('input[type="date"]');
      fireEvent.change(dateInput, { target: { value: "2099-10-16" } });

      const verifyBtn = screen.getByRole("button", { name: /verify & reschedule/i });
      fireEvent.click(verifyBtn);

      expect(await screen.findByText(/Time Slot Clash Detected/i)).toBeInTheDocument();

      // Click "Pick Another Time"
      const pickAnotherBtn = screen.getByRole("button", { name: /pick another time/i });
      fireEvent.click(pickAnotherBtn);

      // Should return to step 1
      expect(await screen.findByText("Reschedule Master Class")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /verify & reschedule/i })).toBeInTheDocument();
    });
  });
});
