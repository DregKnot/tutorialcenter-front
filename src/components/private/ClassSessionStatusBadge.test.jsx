import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="icon" {...props} />,
}));

import ClassSessionStatusBadge, {
  isSessionCancelled,
  isSessionProposed,
  hasSessionRecording,
} from "../common/ClassSessionStatusBadge";

describe("ClassSessionStatusBadge and Helpers", () => {
  test("correctly identifies cancelled sessions", () => {
    expect(isSessionCancelled({ status: "cancelled" })).toBe(true);
    expect(isSessionCancelled({ is_cancelled: true })).toBe(true);
    expect(isSessionCancelled({ status: "scheduled" })).toBe(false);
  });

  test("correctly identifies proposed sessions", () => {
    expect(isSessionProposed({ status: "proposed" })).toBe(true);
    expect(isSessionProposed({ is_proposed: true })).toBe(true);
    expect(isSessionProposed({ status: "scheduled" })).toBe(false);
  });

  test("correctly identifies sessions with uploaded recordings", () => {
    expect(hasSessionRecording({ recording_link: "https://zoom.us/rec/123" })).toBe(true);
    expect(hasSessionRecording({ status: "recorded" })).toBe(true);
    expect(hasSessionRecording({ recording_link: null, status: "scheduled" })).toBe(false);
  });

  test("renders Cancelled badge when session is cancelled", () => {
    render(<ClassSessionStatusBadge session={{ status: "cancelled" }} />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  test("renders Recording Uploaded badge when session has recording_link", () => {
    render(
      <ClassSessionStatusBadge
        session={{ status: "completed", recording_link: "https://youtu.be/xyz" }}
      />
    );
    expect(screen.getByText("Recording Uploaded")).toBeInTheDocument();
  });

  test("renders Proposed badge when session status is proposed", () => {
    render(<ClassSessionStatusBadge session={{ status: "proposed" }} />);
    expect(screen.getByText("Proposed")).toBeInTheDocument();
  });

  test("renders Scheduled badge when showScheduled is true", () => {
    render(<ClassSessionStatusBadge session={{ status: "scheduled" }} showScheduled={true} />);
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
  });

  test("renders nothing when status is scheduled and showScheduled is false", () => {
    const { container } = render(
      <ClassSessionStatusBadge session={{ status: "scheduled" }} showScheduled={false} />
    );
    expect(container.firstChild).toBeNull();
  });
});
