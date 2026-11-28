import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";

const mockNavigate = jest.fn();

jest.mock(
  "react-router-dom",
  () => ({
    useParams: () => ({ token: "test-cbt-token" }),
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

jest.mock("@iconify/react", () => ({
  Icon: (props) => <span data-testid="icon" {...props} />,
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
}));

import BootcampCbt from "./BootcampCbt";

describe("BootcampCbt public page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    axios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 5,
          title: "Week 2 - JAMB Mathematics",
          subject_track: "jamb_maths",
          subject_label: "JAMB Mathematics",
          week_start_date: "2026-11-23",
          duration_minutes: 20,
          questions_count: 20,
          is_open: true,
        },
      },
    });
  });

  test("registers new student, shows 4-digit secret PIN card, then displays This Week / Last Week and Top 3 + pinned rank #4+", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          secret_pin: "4829",
          participant: { id: 11, full_name: "Chinedu Okafor", phone: "08012345678" },
          attempt: null,
          record: {
            subject_track: "jamb_maths",
            subject_label: "JAMB Mathematics",
            last_week: { title: "Week 1 - JAMB Maths", score: 15, total_questions: 20, time_taken_seconds: 500 },
            this_week: null,
          },
          leaderboard: {
            top_three: [
              { rank: 1, participant_id: 1, full_name: "Adaeze N.", score: 20, total_questions: 20, time_taken_seconds: 300, is_me: false },
              { rank: 2, participant_id: 2, full_name: "Tunde B.", score: 19, total_questions: 20, time_taken_seconds: 340, is_me: false },
              { rank: 3, participant_id: 3, full_name: "Zainab M.", score: 18, total_questions: 20, time_taken_seconds: 360, is_me: false },
            ],
            my_entry: {
              rank: 7,
              participant_id: 11,
              full_name: "Chinedu Okafor",
              score: 14,
              total_questions: 20,
              time_taken_seconds: 410,
              is_me: true,
            },
            total_participants: 12,
          },
          review: [],
        },
      },
    });

    render(<BootcampCbt />);

    const titles = await screen.findAllByText("Week 2 - JAMB Mathematics");
    expect(titles.length).toBeGreaterThanOrEqual(1);

    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: "Chinedu Okafor" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 08012345678/i), {
      target: { value: "08012345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register & Get Secret PIN/i }));

    expect(await screen.findByText("4829")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /I Have Saved It/i }));

    expect(await screen.findByText(/Welcome, Chinedu Okafor/i)).toBeInTheDocument();
    expect(screen.getByText(/Week 1 - JAMB Maths/i)).toBeInTheDocument();
    expect(screen.getByText("Adaeze N.")).toBeInTheDocument();
    expect(screen.getByTestId("my-pinned-rank-row")).toHaveTextContent("#7");
    expect(screen.getByTestId("my-pinned-rank-row")).toHaveTextContent("Chinedu Okafor");
  });

  test("shows invalid link message when token lookup fails", async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { message: "This CBT link is invalid or no longer exists." } },
    });

    render(<BootcampCbt />);

    expect(await screen.findByText(/Invalid CBT Link/i)).toBeInTheDocument();
    expect(screen.getByText(/This CBT link is invalid or no longer exists/i)).toBeInTheDocument();
  });
});
