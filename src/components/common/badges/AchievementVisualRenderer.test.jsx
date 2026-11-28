import React from "react";
import { render, screen } from "@testing-library/react";
import AchievementVisualRenderer from "./AchievementVisualRenderer";
import { CelebrationActivityContext } from "../../../context/CelebrationActivityContext";

jest.mock("./streakmedals/CosmicStreakCanvas", () => props => <span>{props.animated ? "moving" : "still"}</span>);
jest.mock("./examperformance/ExamPerformanceMedal", () => props => (
  <span data-testid="exam-medal" data-interactive={String(Boolean(props.interactive))}>
    {props.tier}
  </span>
));

test("catalog animations pause during a celebration and resume when it closes", () => {
  const achievement = { code: "streak.consistent_learner", category: "streak" };
  const tree = active => <CelebrationActivityContext.Provider value={active}>
    <AchievementVisualRenderer achievement={achievement} animated />
  </CelebrationActivityContext.Provider>;
  const { rerender } = render(tree(false));
  expect(screen.getByText("moving")).toBeInTheDocument();
  rerender(tree(true));
  expect(screen.getByText("still")).toBeInTheDocument();
  rerender(tree(false));
  expect(screen.getByText("moving")).toBeInTheDocument();
});

test("exam performance medals only opt into live 3D when interactive is passed", () => {
  const examAchievement = { code: "exam.gold_excellence", category: "exam_performance", tier: "gold" };
  const { rerender } = render(<AchievementVisualRenderer achievement={examAchievement} animated />);
  expect(screen.getByTestId("exam-medal")).toHaveAttribute("data-interactive", "false");

  rerender(<AchievementVisualRenderer achievement={examAchievement} animated interactive />);
  expect(screen.getByTestId("exam-medal")).toHaveAttribute("data-interactive", "true");
});
