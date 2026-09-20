import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ExamPerformanceCelebrationModal from "./ExamPerformanceCelebrationModal";

describe("ExamPerformanceCelebrationModal Component", () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement.getContext for jsdom
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

  const mockPlatinumAchievement = {
    id: 44,
    code: "exam_performance.platinum",
    name: "Platinum Master",
    category: "exam_performance",
    tier: "platinum",
    description: "Scored 90% or higher on a mock practice exam.",
  };

  test("renders full-screen exam celebration modal with canvas and medal controls", () => {
    const handleClose = jest.fn();
    render(
      <ExamPerformanceCelebrationModal
        achievement={mockPlatinumAchievement}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/Exam Performance Milestone • 90% Mastery/i)).toBeInTheDocument();
    expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
    expect(screen.getByText(/You Unlocked Platinum Master!/i)).toBeInTheDocument();
    expect(screen.getByText("Return to Trophy Room")).toBeInTheDocument();
    expect(screen.getByText("Replay Celebration")).toBeInTheDocument();
  });

  test("calls onClose when clicking Return to Trophy Room", () => {
    const handleClose = jest.fn();
    render(
      <ExamPerformanceCelebrationModal
        achievement={mockPlatinumAchievement}
        onClose={handleClose}
      />
    );

    const returnBtn = screen.getByText("Return to Trophy Room");
    fireEvent.click(returnBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when clicking the top-right X button", () => {
    const handleClose = jest.fn();
    render(
      <ExamPerformanceCelebrationModal
        achievement={mockPlatinumAchievement}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByTitle("Return (Esc)");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("restarts celebration animation when clicking Replay Celebration", () => {
    const handleClose = jest.fn();
    render(
      <ExamPerformanceCelebrationModal
        achievement={mockPlatinumAchievement}
        onClose={handleClose}
      />
    );

    const replayBtn = screen.getByText("Replay Celebration");
    fireEvent.click(replayBtn);

    expect(screen.getByText("Return to Trophy Room")).toBeInTheDocument();
  });

  test("renders Diamond Legend tier properly", () => {
    const handleClose = jest.fn();
    const diamondAchievement = {
      id: 45,
      code: "exam_performance.diamond",
      name: "Diamond Legend",
      category: "exam_performance",
      tier: "diamond",
      description: "Scored 95% or higher on a mock exam.",
    };

    render(
      <ExamPerformanceCelebrationModal
        achievement={diamondAchievement}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/Exam Performance Milestone • 95% Mastery/i)).toBeInTheDocument();
    expect(screen.getByText(/You Unlocked Diamond Legend!/i)).toBeInTheDocument();
  });

  test("calls onClose when pressing Escape key", () => {
    const handleClose = jest.fn();
    render(
      <ExamPerformanceCelebrationModal
        achievement={mockPlatinumAchievement}
        onClose={handleClose}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
