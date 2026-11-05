import { rotationAt, choosePixelRatio } from "./medalMotion";

test("a turn takes five seconds even after missed frames", () => {
  expect(rotationAt(1.25)).toBeCloseTo(Math.PI / 2);
  expect(rotationAt(2.5)).toBeCloseTo(Math.PI);
  expect(rotationAt(5)).toBeCloseTo(0);
  expect(rotationAt(7.5)).toBeCloseTo(Math.PI);
});

test("slow frames lower resolution within a readable floor", () => {
  expect(choosePixelRatio(1.5, 45)).toBe(1.25);
  expect(choosePixelRatio(1, 45)).toBe(.75);
  expect(choosePixelRatio(.75, 45)).toBe(.75);
  expect(choosePixelRatio(1.5, 16)).toBe(1.5);
});
