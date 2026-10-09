import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import axios from "axios";
import ExamYearCreateModal from "./ExamYearCreateModal";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
}));

describe("ExamYearCreateModal Paper Types", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    examBodies: [
      { id: 2, name: "JAMB PAST QUESTIONS" },
      { id: 1, name: "WAEC" }
    ],
    courseId: 1,
    selectedExamBodyId: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        data: [{ id: 14, name: "English" }]
      }
    });
  });

  test("renders question paper types toggle and defaults to disabled", async () => {
    await act(async () => {
      render(<ExamYearCreateModal {...defaultProps} />);
    });

    expect(screen.getByText(/Paper \/ Question Types/i)).toBeInTheDocument();
    expect(screen.getByText(/Does this exam year have question paper variants/i)).toBeInTheDocument();
    
    // Presets should not be visible initially
    expect(screen.queryByText(/Quick Presets/i)).not.toBeInTheDocument();
  });

  test("toggling paper types displays preset options and default types", async () => {
    await act(async () => {
      render(<ExamYearCreateModal {...defaultProps} />);
    });

    const toggleButton = screen.getByRole("button", { name: /Toggle paper types/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText(/Quick Presets/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Paper Types/i)).toBeInTheDocument();
    expect(screen.getByText(/Types A - D/i)).toBeInTheDocument();
    expect(screen.getByText(/Colors \(Green, Yellow\.\.\.\)/i)).toBeInTheDocument();

    // Default types should be present
    expect(screen.getByText("Type A")).toBeInTheDocument();
    expect(screen.getByText("Type B")).toBeInTheDocument();
    expect(screen.getByText("Type C")).toBeInTheDocument();
    expect(screen.getByText("Type D")).toBeInTheDocument();
  });

  test("switching presets updates the active paper types", async () => {
    await act(async () => {
      render(<ExamYearCreateModal {...defaultProps} />);
    });

    const toggleButton = screen.getByRole("button", { name: /Toggle paper types/i });
    fireEvent.click(toggleButton);

    const colorsPresetBtn = screen.getByText(/Colors \(Green, Yellow\.\.\.\)/i);
    fireEvent.click(colorsPresetBtn);

    expect(screen.getByText("Type Green")).toBeInTheDocument();
    expect(screen.getByText("Type Purple")).toBeInTheDocument();
    expect(screen.getByText("Type Red")).toBeInTheDocument();
    expect(screen.getByText("Type Yellow")).toBeInTheDocument();
  });

  test("adding a custom paper type works", async () => {
    await act(async () => {
      render(<ExamYearCreateModal {...defaultProps} />);
    });

    const toggleButton = screen.getByRole("button", { name: /Toggle paper types/i });
    fireEvent.click(toggleButton);

    const customInput = screen.getByPlaceholderText(/Add custom type/i);
    const addBtn = screen.getByRole("button", { name: /Add/i });

    fireEvent.change(customInput, { target: { value: "Type Diamond" } });
    fireEvent.click(addBtn);

    expect(screen.getByText("Type Diamond")).toBeInTheDocument();
  });

  test("submitting form sends has_paper_types and paper_types in payload", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "Exam year created successfully.",
        data: { id: 10, year: 2010 }
      }
    });

    await act(async () => {
      render(<ExamYearCreateModal {...defaultProps} />);
    });

    // Wait for subjects to load
    await waitFor(() => {
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    // Select subject
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: 14 } });

    // Toggle paper types ON
    const toggleButton = screen.getByRole("button", { name: /Toggle paper types/i });
    fireEvent.click(toggleButton);

    // Click Save
    const submitBtn = screen.getByRole("button", { name: /Save Exam Year/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    const postCallArgs = axios.post.mock.calls[0];
    const payload = postCallArgs[1];

    expect(payload.has_paper_types).toBe(true);
    expect(payload.paper_types).toEqual(["Type A", "Type B", "Type C", "Type D"]);
  });

  test("renders in edit mode and submits via axios.put", async () => {
    axios.put.mockResolvedValue({
      data: {
        message: "Exam Year updated successfully!",
        data: { id: 42, year: 2012, has_paper_types: true, paper_types: ["Type Red", "Type Blue"] }
      }
    });

    const editProps = {
      ...defaultProps,
      yearToEdit: {
        id: 42,
        year: 2012,
        exam_body_id: 2,
        subject_id: 14,
        status: "active",
        has_paper_types: true,
        paper_types: ["Type Red", "Type Blue"],
        subject: { id: 14, name: "English" }
      }
    };

    await act(async () => {
      render(<ExamYearCreateModal {...editProps} />);
    });

    expect(screen.getByText(/EDIT EXAM YEAR 2012/i)).toBeInTheDocument();
    expect(screen.getByText("Type Red")).toBeInTheDocument();
    expect(screen.getByText("Type Blue")).toBeInTheDocument();

    const updateBtn = screen.getByRole("button", { name: /Update Exam Year/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
    });

    const [url, payload] = axios.put.mock.calls[0];
    expect(url).toContain("/api/admin/exam-years/update/42");
    expect(payload.year).toBe(2012);
    expect(payload.has_paper_types).toBe(true);
    expect(payload.paper_types).toEqual(["Type Red", "Type Blue"]);
  });
});
