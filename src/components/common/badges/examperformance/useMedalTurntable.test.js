import React, { useRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useMedalTurntable } from "./useMedalTurntable";
import * as tiers from "./tiers";

function HookHarness(props) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ready = useMedalTurntable({ canvasRef, containerRef, ...props });
  return (
    <div ref={containerRef} data-testid="turntable-host" data-ready={String(ready)}>
      <canvas ref={canvasRef} />
    </div>
  );
}

describe("useMedalTurntable", () => {
  const originalImage = window.Image;
  const originalCreateImageBitmap = window.createImageBitmap;
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalDeviceMemory = Object.getOwnPropertyDescriptor(navigator, "deviceMemory");

  afterEach(() => {
    window.Image = originalImage;
    window.createImageBitmap = originalCreateImageBitmap;
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    if (originalDeviceMemory) {
      Object.defineProperty(navigator, "deviceMemory", originalDeviceMemory);
    } else {
      delete navigator.deviceMemory;
    }
    jest.restoreAllMocks();
  });

  test("static grid cards do not load any turntable sheet", () => {
    const getMediaSpy = jest.spyOn(tiers, "getTierMedia");
    render(
      <HookHarness
        tier="gold"
        size={140}
        earned={true}
        interactive={false}
        spin={false}
        animated={false}
        reducedMotion={false}
      />
    );
    expect(getMediaSpy).not.toHaveBeenCalled();
  });

  test("desktop (>4GB) loads 400px HD turntable sheets, draws to canvas, and closes bitmaps on unmount", async () => {
    Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: 8 });
    const drawImage = jest.fn();
    const clearRect = jest.fn();
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage,
      clearRect,
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low",
    }));

    const loadTurntable = jest.fn();
    const loadHdTurntable = jest.fn().mockResolvedValue([
      { default: "gold-spin-hd-1.webp" },
      { default: "gold-spin-hd-2.webp" },
    ]);
    jest.spyOn(tiers, "getTierMedia").mockReturnValue({
      snapshot: "gold.webp",
      loadTurntable,
      loadHdTurntable,
    });

    window.Image = class MockImage {
      decode() {
        return Promise.resolve();
      }
    };
    const close = jest.fn();
    window.createImageBitmap = jest.fn().mockResolvedValue({ close });

    const { unmount } = render(
      <HookHarness
        tier="gold"
        size={360}
        earned={true}
        interactive={true}
        spin={false}
        animated={true}
        reducedMotion={false}
      />
    );

    expect(loadHdTurntable).toHaveBeenCalledTimes(1);
    expect(loadTurntable).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId("turntable-host")).toHaveAttribute("data-ready", "true");
    });
    expect(drawImage).toHaveBeenCalled();

    unmount();
    expect(clearRect).toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(2);
  });

  test("4GB RAM devices use the compact single turntable sheet instead of HD sheets", async () => {
    Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: 4 });
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
      clearRect: jest.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low",
    }));

    const loadTurntable = jest.fn().mockResolvedValue({ default: "gold-spin.webp" });
    const loadHdTurntable = jest.fn();
    jest.spyOn(tiers, "getTierMedia").mockReturnValue({
      snapshot: "gold.webp",
      loadTurntable,
      loadHdTurntable,
    });

    window.Image = class MockImage {
      decode() {
        return Promise.resolve();
      }
    };
    const close = jest.fn();
    window.createImageBitmap = jest.fn().mockResolvedValue({ close });

    const { unmount } = render(
      <HookHarness
        tier="gold"
        size={360}
        earned={true}
        interactive={true}
        spin={false}
        animated={true}
        reducedMotion={false}
      />
    );

    expect(loadTurntable).toHaveBeenCalledTimes(1);
    expect(loadHdTurntable).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId("turntable-host")).toHaveAttribute("data-ready", "true");
    });

    unmount();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
