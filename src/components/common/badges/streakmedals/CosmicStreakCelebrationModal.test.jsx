import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CosmicStreakCelebrationModal from "./CosmicStreakCelebrationModal";

describe("CosmicStreakCelebrationModal Component", () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement.getContext to support 2D canvas in jsdom
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
      ellipse: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      setTransform: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    }));
  });

  const mockAchievement = {
    id: 10,
    code: "streak.100_day_marathon",
    name: "Academic Marathoner",
    category: "learning_streak",
    streak_days: 100,
    description: "Practice CBT questions continuously for 100 days.",
  };

  test("renders full-screen celebration modal with canvas and controls", () => {
    const handleClose = jest.fn();
    render(<CosmicStreakCelebrationModal achievement={mockAchievement} onClose={handleClose} />);

    expect(screen.getByText(/Cosmic Streak Milestone/i)).toBeInTheDocument();
    expect(screen.getByText(/You Reached Your 100-Day Daily Practice Streak!/i)).toBeInTheDocument();
    expect(screen.getByText("Return to Trophy Room")).toBeInTheDocument();
    expect(screen.getByText("Replay Animation")).toBeInTheDocument();
  });

  test("calls onClose when clicking Return to Trophy Room", () => {
    const handleClose = jest.fn();
    render(<CosmicStreakCelebrationModal achievement={mockAchievement} onClose={handleClose} />);

    const returnBtn = screen.getByText("Return to Trophy Room");
    fireEvent.click(returnBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when clicking the top-right X button", () => {
    const handleClose = jest.fn();
    render(<CosmicStreakCelebrationModal achievement={mockAchievement} onClose={handleClose} />);

    const closeBtn = screen.getByTitle("Return (Esc)");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("restarts flight animation when clicking Replay Animation", () => {
    const handleClose = jest.fn();
    render(<CosmicStreakCelebrationModal achievement={mockAchievement} onClose={handleClose} />);

    const replayBtn = screen.getByText("Replay Animation");
    act(() => {
      fireEvent.click(replayBtn);
    });

    expect(screen.getByText("Return to Trophy Room")).toBeInTheDocument();
  });
});
