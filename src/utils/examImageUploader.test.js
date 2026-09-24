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
  combineOptionTextAndImage,
  extractExplanationTextAndImage,
  combineExplanationTextAndImage
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

  describe("extractExplanationTextAndImage", () => {
    it("extracts text and image when explanation has text and wrapped diagram", () => {
      const input = '<p>The correct answer is derived using Ohm\'s law.</p><div class="exam-explanation-img mt-4"><img src="https://api.test/storage/exams/diagram.png" alt="Explanation Diagram" /></div>';
      const { text, imageUrl } = extractExplanationTextAndImage(input);
      expect(text).toBe("<p>The correct answer is derived using Ohm's law.</p>");
      expect(imageUrl).toBe("https://api.test/storage/exams/diagram.png");
    });

    it("extracts image and cleans up p-wrapped image", () => {
      const input = '<p>Look at the circuit:</p><p><img src="https://api.test/storage/exams/circuit.png" alt="Circuit" /></p>';
      const { text, imageUrl } = extractExplanationTextAndImage(input);
      expect(text).toBe("<p>Look at the circuit:</p>");
      expect(imageUrl).toBe("https://api.test/storage/exams/circuit.png");
    });

    it("handles explanation with only an image", () => {
      const input = '<div class="exam-explanation-img mt-4"><img src="https://api.test/storage/exams/only-diagram.png" /></div>';
      const { text, imageUrl } = extractExplanationTextAndImage(input);
      expect(text).toBe("");
      expect(imageUrl).toBe("https://api.test/storage/exams/only-diagram.png");
    });

    it("handles explanation with only text", () => {
      const input = "<p>Standard kinematic formula applies.</p>";
      const { text, imageUrl } = extractExplanationTextAndImage(input);
      expect(text).toBe("<p>Standard kinematic formula applies.</p>");
      expect(imageUrl).toBeNull();
    });

    it("handles empty or null explanation", () => {
      expect(extractExplanationTextAndImage("")).toEqual({ text: "", imageUrl: null });
      expect(extractExplanationTextAndImage(null)).toEqual({ text: "", imageUrl: null });
    });
  });

  describe("combineExplanationTextAndImage", () => {
    it("places explanation text at the TOP and picture BELOW it", () => {
      const text = "<p>Explanation text goes here</p>";
      const imageUrl = "https://api.test/storage/exams/diagram.png";
      const combined = combineExplanationTextAndImage(text, imageUrl);
      expect(combined).toBe(
        '<p>Explanation text goes here</p><div class="exam-explanation-img mt-4"><img src="https://api.test/storage/exams/diagram.png" alt="Explanation Diagram" class="max-h-80 rounded-xl object-contain mx-auto" /></div>'
      );
      // Verify text is before image
      const textIdx = combined.indexOf("<p>Explanation text goes here</p>");
      const imgIdx = combined.indexOf('<img src="https://api.test/storage/exams/diagram.png"');
      expect(textIdx).toBeLessThan(imgIdx);
    });

    it("handles image without text", () => {
      const combined = combineExplanationTextAndImage("", "https://api.test/storage/exams/diagram.png");
      expect(combined).toBe(
        '<div class="exam-explanation-img mt-4"><img src="https://api.test/storage/exams/diagram.png" alt="Explanation Diagram" class="max-h-80 rounded-xl object-contain mx-auto" /></div>'
      );
    });

    it("returns plain text when no image is provided", () => {
      const combined = combineExplanationTextAndImage("<p>Only text</p>", null);
      expect(combined).toBe("<p>Only text</p>");
    });
  });
});
