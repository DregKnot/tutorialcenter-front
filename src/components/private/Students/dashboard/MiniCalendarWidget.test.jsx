/* eslint-disable testing-library/no-node-access */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MiniCalendarWidget from "./MiniCalendarWidget";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

// Mock axios
jest.mock("axios");

// Mock AuthContext
jest.mock("../../../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "mock-student-token",
    student: { id: 1, name: "Test Student" },
  }),
}));

describe("MiniCalendarWidget Component", () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const mockSessions = [
    {
      id: 99,
      title: "Chemistry Masterclass",
      session_date: todayStr,
      starts_at: "10:00:00",
      ends_at: "11:30:00",
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
    render(
      <BrowserRouter>
        <MiniCalendarWidget />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Chemistry Masterclass")).toBeInTheDocument();
    });
  });

  test("opens SessionModal on card click and safely renders subject name as string", async () => {
    render(
      <BrowserRouter>
        <MiniCalendarWidget />
      </BrowserRouter>
    );

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

  test("clicking Join Live Classroom in modal opens link and pings attendance without white screen", async () => {
    const originalOpen = window.open;
    window.open = jest.fn();

    render(
      <BrowserRouter>
        <MiniCalendarWidget />
      </BrowserRouter>
    );

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

    expect(window.open).toHaveBeenCalledWith(
      "https://us05web.zoom.us/j/999888777?pwd=abc",
      "_blank",
      "noopener,noreferrer"
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/students/classes/attendance/join"),
      { class_session_id: 99 },
      expect.any(Object)
    );

    window.open = originalOpen;
  });
});
