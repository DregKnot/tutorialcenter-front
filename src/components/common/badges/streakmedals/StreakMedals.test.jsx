import React from "react";
import { render, screen } from "@testing-library/react";
import {
  ConsistentLearnerBadge,
  StudyHabitBuilderBadge,
  WeeklyWarriorBadge,
  MonthlyAchieverBadge,
  LearningMachineStreakBadge,
  AcademicMarathonerBadge,
  StudyLegendBadge,
  YearOfExcellenceBadge,
} from "./index";

describe("Cosmic Streak Medals Suite", () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement.getContext to support 2D canvas operations in jsdom
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      setTransform: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      closePath: jest.fn(),
      ellipse: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillText: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
    }));
  });

  const badges = [
    { Component: ConsistentLearnerBadge, name: "ConsistentLearnerBadge", days: 3 },
    { Component: StudyHabitBuilderBadge, name: "StudyHabitBuilderBadge", days: 7 },
    { Component: WeeklyWarriorBadge, name: "WeeklyWarriorBadge", days: 14 },
    { Component: MonthlyAchieverBadge, name: "MonthlyAchieverBadge", days: 30 },
    { Component: LearningMachineStreakBadge, name: "LearningMachineStreakBadge", days: 60 },
    { Component: AcademicMarathonerBadge, name: "AcademicMarathonerBadge", days: 100 },
    { Component: StudyLegendBadge, name: "StudyLegendBadge", days: 180 },
    { Component: YearOfExcellenceBadge, name: "YearOfExcellenceBadge", days: 365 },
  ];

  badges.forEach(({ Component, name, days }) => {
    describe(name, () => {
      test("renders canvas element with proper role and aria-label in earned state", () => {
        render(<Component count={days} earned={true} animated={false} size={140} />);
        const canvas = screen.getByRole("img", { name: new RegExp(`${days}-day`, "i") });
        expect(canvas).toBeInTheDocument();
        expect(canvas.tagName).toBe("CANVAS");
      });

      test("renders properly in locked (unearned) state with grayscale", () => {
        const { container } = render(<Component count={days} earned={false} size={140} />);
        const canvas = container.querySelector("canvas");
        expect(canvas).toBeInTheDocument();
        expect(canvas.className).toContain("grayscale");
      });

      test("handles animated mode and cleans up animation frame on unmount", () => {
        const cancelSpy = jest.spyOn(window, "cancelAnimationFrame");
        const { unmount } = render(<Component count={days} earned={true} animated={true} size={140} />);
        unmount();
        expect(cancelSpy).toHaveBeenCalled();
        cancelSpy.mockRestore();
      });
    });
  });
});
