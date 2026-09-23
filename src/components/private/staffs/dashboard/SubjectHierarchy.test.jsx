import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import SubjectHierarchy from "./SubjectHierarchy";

// Mock Iconify Icon
jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className }) => <span data-testid={`icon-${icon}`} className={className} />,
}));

// Mock Axios
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

const mockCoursesData = [
  {
    id: 2,
    title: "WAEC Masterclass",
    name: "WAEC",
    code: "WAEC",
    slug: "waec",
    total_course_enrollments: 13,
    total_unique_students: 13,
    subjects: [
      {
        id: 2,
        name: "English Language",
        description: "Core English curriculum",
        status: "active",
        departments: ["science", "commercial", "art"],
        tutors: [{ id: 1, firstname: "John", surname: "Doe", role: "lead" }],
        classes_count: 1,
        classes: [{ id: 1, title: "WAEC - English", status: "active" }],
        enrolled_count: 13,
        students: [
          {
            id: 101,
            fullname: "Amina Yusuf",
            email: "amina@example.com",
            department: "science",
            enrolled_at: "2026-08-15T00:00:00.000Z",
          },
        ],
      },
      {
        id: 4,
        name: "Biology",
        description: "Life sciences",
        status: "active",
        departments: ["science"],
        tutors: [],
        classes_count: 1,
        classes: [],
        enrolled_count: 13,
        students: [],
      },
    ],
  },
  {
    id: 4,
    title: "GCE Preparation",
    name: "GCE",
    code: "GCE",
    slug: "gce",
    total_course_enrollments: 4,
    total_unique_students: 4,
    subjects: [
      {
        id: 7,
        name: "Mathematics",
        description: "GCE Maths",
        status: "active",
        departments: ["science"],
        tutors: [],
        classes_count: 1,
        classes: [],
        enrolled_count: 4,
        students: [],
      },
    ],
  },
];

describe("SubjectHierarchy Analytical Overview Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("staff_token", "fake-token");
  });

  test("renders KPI sparkline cards and trajectory chart", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        courses: mockCoursesData,
      },
    });

    render(<SubjectHierarchy />);

    // Check 3 Overview KPI Cards
    await waitFor(() => {
      expect(screen.getByText("Course enrollments")).toBeInTheDocument();
      expect(screen.getByText("WAEC share")).toBeInTheDocument();
      expect(screen.getByText("Subject registrations")).toBeInTheDocument();
    });

    // Check Trajectory Chart Header
    expect(screen.getByText("Program enrollment trajectories")).toBeInTheDocument();
    expect(screen.getByText("12w")).toBeInTheDocument();
    expect(screen.getByText("6m")).toBeInTheDocument();
    expect(screen.getByText("1y")).toBeInTheDocument();

    // Check Table Section
    expect(
      screen.getByText("Top subject enrollment paths & registration share")
    ).toBeInTheDocument();
    expect(screen.getByText("English Language")).toBeInTheDocument();
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
  });

  test("opens student roster drilldown modal on row click", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        courses: mockCoursesData,
      },
    });

    render(<SubjectHierarchy />);

    await waitFor(() => {
      expect(screen.getByText("English Language")).toBeInTheDocument();
    });

    // Click on row
    fireEvent.click(screen.getByText("English Language"));

    // Modal appears with student details
    await waitFor(() => {
      expect(screen.getByText("Amina Yusuf")).toBeInTheDocument();
      expect(screen.getByText("amina@example.com")).toBeInTheDocument();
    });
  });
});
