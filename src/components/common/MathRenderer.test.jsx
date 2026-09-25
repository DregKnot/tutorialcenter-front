import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

import MathRenderer from "./MathRenderer";

describe("MathRenderer with Image Support", () => {
  it("renders plain text without crashing", () => {
    const { container } = render(<MathRenderer text="What is 2 + 2?" />);
    expect(container.textContent).toContain("What is 2 + 2?");
  });

  it("safely renders an <img> tag with exam-diagram-img class", () => {
    const { container } = render(
      <MathRenderer text='Find x in this triangle: <img src="https://api.test/storage/exams/images/triangle.png" alt="Right Triangle" />' />
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe("https://api.test/storage/exams/images/triangle.png");
    expect(img.getAttribute("alt")).toBe("Right Triangle");
    expect(img.className).toContain("exam-diagram-img");
  });

  it("safely renders option images with exam-option-img class", () => {
    const { container } = render(
      <MathRenderer 
        text='Option A <img src="https://api.test/storage/exams/images/optA.png" alt="Option A" class="exam-option-img" />' 
        className="exam-option-renderer"
      />
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.className).toContain("exam-option-img");
  });

  it("resolves relative /storage/ URLs using API_BASE_URL", () => {
    const { container } = render(
      <MathRenderer text='Diagram: <img src="/storage/exams/images/circle.png" alt="Circle" />' />
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toContain("/storage/exams/images/circle.png");
  });

  it("escapes dangerous HTML tags while keeping safe <img>", () => {
    const { container } = render(
      <MathRenderer text='Danger: <script>alert("hacked")</script> and <img src="https://api.test/storage/exams/images/ok.png" alt="Safe" />' />
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.innerHTML).toContain("&lt;script&gt;");
    expect(container.querySelector("img")).not.toBeNull();
  });
});
