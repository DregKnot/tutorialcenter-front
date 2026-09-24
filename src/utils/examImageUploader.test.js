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

import {
  sanitizeExamHtml,
  extractOptionTextAndImage,
  combineOptionTextAndImage
} from "./examImageUploader";

describe("examImageUploader Utilities", () => {
  describe("sanitizeExamHtml", () => {
    it("strips raw base64 data URIs from HTML while keeping normal text", () => {
      const input = '<p>What is the angle? <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="diagram" /></p>';
      const sanitized = sanitizeExamHtml(input);
      expect(sanitized).not.toContain("data:image/png;base64");
      expect(sanitized).toContain("What is the angle?");
    });

    it("preserves valid public storage link images", () => {
      const input = '<p>Diagram: <img src="http://tutorialcenter-back.test/storage/exams/images/abc123.png" alt="triangle" /></p>';
      const sanitized = sanitizeExamHtml(input);
      expect(sanitized).toBe(input);
    });

    it("preserves relative storage link images", () => {
      const input = '<p>Diagram: <img src="/storage/exams/images/abc123.png" alt="triangle" /></p>';
      const sanitized = sanitizeExamHtml(input);
      expect(sanitized).toBe(input);
    });
  });

  describe("extractOptionTextAndImage", () => {
    it("extracts text and image when option has both", () => {
      const input = 'Equilateral triangle <img src="https://api.test/storage/exams/images/tri.png" alt="Option A" class="exam-option-img" />';
      const { text, imageUrl } = extractOptionTextAndImage(input);
      expect(text).toBe("Equilateral triangle");
      expect(imageUrl).toBe("https://api.test/storage/exams/images/tri.png");
    });

    it("handles option with only an image", () => {
      const input = '<img src="https://api.test/storage/exams/images/graph.png" alt="Option B" />';
      const { text, imageUrl } = extractOptionTextAndImage(input);
      expect(text).toBe("");
      expect(imageUrl).toBe("https://api.test/storage/exams/images/graph.png");
    });

    it("handles option with only text", () => {
      const input = "45 degrees";
      const { text, imageUrl } = extractOptionTextAndImage(input);
      expect(text).toBe("45 degrees");
      expect(imageUrl).toBeNull();
    });

    it("handles empty or null option", () => {
      expect(extractOptionTextAndImage("")).toEqual({ text: "", imageUrl: null });
      expect(extractOptionTextAndImage(null)).toEqual({ text: "", imageUrl: null });
    });
  });

  describe("combineOptionTextAndImage", () => {
    it("combines text and image URL into option HTML", () => {
      const result = combineOptionTextAndImage("Circuit A", "https://api.test/storage/exams/images/circuit.png", "A");
      expect(result).toBe('Circuit A <img src="https://api.test/storage/exams/images/circuit.png" alt="Option A" class="exam-option-img" />');
    });

    it("handles image without text", () => {
      const result = combineOptionTextAndImage("", "https://api.test/storage/exams/images/circuit.png", "B");
      expect(result).toBe('<img src="https://api.test/storage/exams/images/circuit.png" alt="Option B" class="exam-option-img" />');
    });

    it("returns plain text when no image is provided", () => {
      const result = combineOptionTextAndImage("Plain option text", null);
      expect(result).toBe("Plain option text");
    });
  });
});
