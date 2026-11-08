import React from "react";
import { render, screen } from "@testing-library/react";
import ClassSessionStatusBadge, {
  isSessionCancelled,
  isSessionProposed,
  isSessionPrivate,
  hasSessionRecording,
  getSubjectMetadata,
  getSessionCardStyles,
} from "../common/ClassSessionStatusBadge";

jest.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="icon" {...props} />,
}));

describe("ClassSessionStatusBadge and Helpers", () => {
  test("correctly identifies cancelled sessions", () => {
    expect(isSessionCancelled({ status: "cancelled" })).toBe(true);
    expect(isSessionCancelled({ is_cancelled: true })).toBe(true);
    expect(isSessionCancelled({ status: "scheduled" })).toBe(false);
  });

  test("correctly identifies proposed sessions", () => {
    expect(isSessionProposed({ status: "proposed" })).toBe(true);
    expect(isSessionProposed({ is_proposed: true })).toBe(true);
    expect(isSessionProposed({ status: "scheduled", class: { status: "proposed" } })).toBe(true);
    expect(isSessionProposed({ status: "scheduled", class_status: "proposed" })).toBe(true);
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

  test("renders Proposed and NOT Scheduled when parent class is proposed even if showScheduled is true", () => {
    render(
      <ClassSessionStatusBadge
        session={{ status: "scheduled", class: { status: "proposed" } }}
        showScheduled={true}
      />
    );
    expect(screen.getByText("Proposed")).toBeInTheDocument();
    expect(screen.queryByText("Scheduled")).toBeNull();
  });

  test("renders nothing when status is scheduled and showScheduled is false", () => {
    const { container } = render(
      <ClassSessionStatusBadge session={{ status: "scheduled" }} showScheduled={false} />
    );
    expect(container).toBeEmptyDOMElement();
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

  test("correctly identifies private sessions", () => {
    expect(isSessionPrivate({ is_private: true })).toBe(true);
    expect(isSessionPrivate({ is_private: 1 })).toBe(true);
    expect(isSessionPrivate({ class: { is_private: true } })).toBe(true);
    expect(isSessionPrivate({ class: { private_student_id: 42 } })).toBe(true);
    expect(isSessionPrivate({ status: "scheduled" })).toBe(false);
  });

  test("renders Private 1-on-1 badge when session is private", () => {
    render(<ClassSessionStatusBadge session={{ status: "scheduled", is_private: true }} />);
    expect(screen.getByText(/Private 1-on-1/i)).toBeInTheDocument();
  });

  test("returns correct status-driven card styles for Active, Proposed, Private, and Cancelled", () => {
    const activeStyles = getSessionCardStyles({ status: "scheduled" });
    expect(activeStyles.status).toBe("active");
    expect(activeStyles.cardBorder).toContain("border-emerald");
    expect(activeStyles.cardClickable).toBe(true);

    const privateStyles = getSessionCardStyles({ status: "scheduled", is_private: true });
    expect(privateStyles.status).toBe("private");
    expect(privateStyles.cardBorder).toContain("border-amber");
    expect(privateStyles.cardClickable).toBe(true);

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

