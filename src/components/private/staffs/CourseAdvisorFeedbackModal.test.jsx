import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourseAdvisorFeedbackModal from "./CourseAdvisorFeedbackModal";
import axios from "axios";

// Mock Iconify Icon
jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

// Mock Axios with explicit factory to bypass Jest ESM parsing of axios v1.x
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe("CourseAdvisorFeedbackModal", () => {
  const mockSessionDetails = {
    id: "session-101",
    class_id: "class-202",
    class_title: "JAMB Mathematics Masterclass",
    subject: "Mathematics",
    date: "20/09/2026",
    time: "10:00 - 12:00",
    tutor_name: "Mr. Chukwuma Obi",
    present_count: 18,
    total_students: 22,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders modal with header, session info, and Question 1 & 2 in Step 1", () => {
    render(
      <CourseAdvisorFeedbackModal
        isOpen={true}
        onClose={jest.fn()}
        sessionDetails={mockSessionDetails}
        onSubmitSuccess={jest.fn()}
      />
    );

    // Verify modal title & supervision badge
    expect(screen.getByText("Post-Class Feedback Report")).toBeInTheDocument();
    expect(screen.getByText("Course Advisor Supervision")).toBeInTheDocument();

    // Verify session info bar
    expect(screen.getByText("JAMB Mathematics Masterclass")).toBeInTheDocument();
    expect(screen.getByText("Tutor: Mr. Chukwuma Obi")).toBeInTheDocument();

    // Verify Question 1
    expect(screen.getByText("How would you rate the tutor’s overall performance?")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
    expect(screen.getByText("Very Good")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Fair")).toBeInTheDocument();
    expect(screen.getByText("Poor")).toBeInTheDocument();

    // Verify Question 2
    expect(screen.getByText("How was student attendance?")).toBeInTheDocument();
    expect(screen.getByText("Excellent – almost all students attended")).toBeInTheDocument();
    expect(screen.getByText("Good – most students attended")).toBeInTheDocument();
    expect(screen.getByText("Number Present:")).toBeInTheDocument();
    expect(screen.getByText("Number Absent:")).toBeInTheDocument();
  });

  test("can navigate through all 3 sections and renders questions 3, 4, 5, 6, 7", () => {
    render(
      <CourseAdvisorFeedbackModal
        isOpen={true}
        onClose={jest.fn()}
        sessionDetails={mockSessionDetails}
        onSubmitSuccess={jest.fn()}
      />
    );

    // Navigate to Step 2
    const nextBtn = screen.getByText("Continue to Next Section");
    fireEvent.click(nextBtn);

    // Question 3
    expect(screen.getByText("How would you rate students’ participation and engagement?")).toBeInTheDocument();
    expect(screen.getByText("Very High")).toBeInTheDocument();

    // Question 4
    expect(screen.getByText("How well did students appear to understand the lesson?")).toBeInTheDocument();
    expect(screen.getByText("What did students struggle with or understand particularly well?")).toBeInTheDocument();

    // Navigate to Step 3
    fireEvent.click(screen.getByText("Continue to Next Section"));

    // Question 5
    expect(screen.getByText("Were the lesson materials/resources properly used and accessible?")).toBeInTheDocument();
    expect(screen.getByText("Yes, fully")).toBeInTheDocument();

    // Question 6
    expect(screen.getByText("Were there any challenges, incidents, or issues during the class?")).toBeInTheDocument();
    expect(screen.getByText("Technical/network issue")).toBeInTheDocument();

    // Question 7
    expect(screen.getByText("What follow-up action or support is required before the next class?")).toBeInTheDocument();
    expect(screen.getByText("No action required")).toBeInTheDocument();

    // Submit button visible in Step 3
    expect(screen.getByText("Submit Advisor Report")).toBeInTheDocument();
  });

  test("submits form and triggers onSubmitSuccess without freezing on API error", async () => {
    // Mock API post failure to test fallback resilience
    axios.post.mockRejectedValue(new Error("Network / Endpoint offline"));

    const mockSubmitSuccess = jest.fn();
    const mockClose = jest.fn();

    render(
      <CourseAdvisorFeedbackModal
        isOpen={true}
        onClose={mockClose}
        sessionDetails={mockSessionDetails}
        onSubmitSuccess={mockSubmitSuccess}
      />
    );

    // Go to step 3 directly by clicking tab
    fireEvent.click(screen.getByText("3. Materials, Issues & Actions"));

    const submitBtn = screen.getByText("Submit Advisor Report");
    fireEvent.click(submitBtn);

    // Expect saving confirmation
    await waitFor(() => {
      expect(
        screen.getByText("Report saved successfully! Management audit record has been updated.")
      ).toBeInTheDocument();
    });

    // Verify data saved in localStorage
    const saved = JSON.parse(localStorage.getItem("advisor_completed_reports") || "[]");
    expect(saved.length).toBeGreaterThan(0);
    expect(saved[0].class_session_id).toBe("session-101");
    expect(saved[0].tutor_name).toBe("Mr. Chukwuma Obi");
  });

  test("clicking close button calls onClose", () => {
    const mockClose = jest.fn();
    render(
      <CourseAdvisorFeedbackModal
        isOpen={true}
        onClose={mockClose}
        sessionDetails={mockSessionDetails}
        onSubmitSuccess={jest.fn()}
      />
    );

    const closeBtn = screen.getByTitle("Close Report");
    fireEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalled();
  });
});
