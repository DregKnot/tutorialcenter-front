import React from "react";
import { render, screen } from "@testing-library/react";
import AchievementVisualRenderer from "./AchievementVisualRenderer";
import { CelebrationActivityContext } from "../../../context/CelebrationActivityContext";

jest.mock("./streakmedals/CosmicStreakCanvas", () => props => <span>{props.animated ? "moving" : "still"}</span>);

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
