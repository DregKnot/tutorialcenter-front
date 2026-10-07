import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="icon" {...props} />,
}));

import ClassSessionStatusBadge, {
  isSessionCancelled,
  isSessionProposed,
  hasSessionRecording,
  getSubjectMetadata,
  getSessionCardStyles,
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

  test("differentiates Mathematics and Further Mathematics, correcting typos", () => {
    const mathMeta = getSubjectMetadata("GCE - Mathematics");
    expect(mathMeta.displayName).toBe("Mathematics");
    expect(mathMeta.icon).toBe("lucide:calculator");
    expect(mathMeta.isAdvanced).toBe(false);

    const furtherMeta = getSubjectMetadata("GCE - Furher mathematics");
    expect(furtherMeta.displayName).toBe("Further Mathematics");
    expect(furtherMeta.icon).toBe("lucide:function-square");
    expect(furtherMeta.isAdvanced).toBe(true);
  });

  test("returns correct status-driven card styles for Active, Proposed, and Cancelled", () => {
    const activeStyles = getSessionCardStyles({ status: "scheduled" });
    expect(activeStyles.status).toBe("active");
    expect(activeStyles.cardBorder).toContain("border-emerald");
    expect(activeStyles.cardClickable).toBe(true);

    const proposedStyles = getSessionCardStyles({ status: "proposed" });
    expect(proposedStyles.status).toBe("proposed");
    expect(proposedStyles.cardBorder).toContain("border-amber");
    expect(proposedStyles.cardClickable).toBe(true);

    const cancelledStyles = getSessionCardStyles({ status: "cancelled" });
    expect(cancelledStyles.status).toBe("cancelled");
    expect(cancelledStyles.cardBorder).toContain("border-rose");
    expect(cancelledStyles.cardClickable).toBe(false);
    expect(cancelledStyles.actionText).toBe("Session Cancelled");
  });
});

