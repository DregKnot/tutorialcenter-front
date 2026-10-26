import React from "react";
import { render, screen } from "@testing-library/react";
import ExamPerformanceMedal from "./ExamPerformanceMedal";

// A browser without GPU support must still show the new medal, not the old wings.
jest.mock("../TCMedal", () => () => { throw new Error("Old medal must not be used as the exam fallback"); });

describe("exam medals without WebGL", () => {
  test.each([
    ["bronze", "Bronze", "60"], ["silver", "Silver", "70"],
    ["gold", "Gold", "80"], ["platinum", "Platinum", "90"],
    ["diamond", "Diamond", "95"],
  ])("renders the new %s medal image", (tier, name, score) => {
    render(<ExamPerformanceMedal tier={tier} />);
    const medal = screen.getByRole("img", { name: `${name} exam performance medal, ${score}% mastery` });
    expect(medal.querySelector("img")).toHaveAttribute("src");
    expect(medal.querySelector("img")).toHaveStyle({ opacity: "1" });
    expect(medal.querySelector("svg")).toBeNull();
  });
  test("identifies a locked medal and retains its artwork", () => {
    render(<ExamPerformanceMedal tier="gold" earned={false} />);
    const medal = screen.getByRole("img", { name: /Gold.*locked/ });
    expect(medal.querySelector("img")).toBeInTheDocument();
    expect(medal).toHaveStyle({ opacity: "0.4" });
  });
});
