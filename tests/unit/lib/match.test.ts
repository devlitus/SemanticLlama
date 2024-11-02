import { VectorMath } from "@/lib/math";
import { describe, expect, it } from "vitest";

describe("VectorMath", () => {
  describe("cosineSimilarity", () => {
    it("should return 1 for identical vectors", () => {
      const a = [1, 2, 3];
      const b = [1, 2, 3];
      expect(VectorMath.cosineSimilarity(a, b)).toBe(1);
    });

    it("should return 0 for orthogonal vectors", () => {
      const a = [1, 0];
      const b = [0, 1];
      expect(VectorMath.cosineSimilarity(a, b)).toBe(0);
    });

    it("should return -1 for opposite vectors", () => {
      const a = [1, 2, 3];
      const b = [-1, -2, -3];
      expect(VectorMath.cosineSimilarity(a, b)).toBe(-1);
    });

    it("should throw an error for mismatched vector lengths", () => {
      const a = [1, 2];
      const b = [1, 2, 3];
      expect(() => VectorMath.cosineSimilarity(a, b)).toThrowError(
        /Vector length mismatch/
      );
    });

    it("should throw an error for invalid input types", () => {
      const a = [1, 2];
      const b = "not an array" as any;
      expect(() => VectorMath.cosineSimilarity(a, b)).toThrowError(
        /Invalid input types/
      );
    });

    it("should return 0 for zero-length vectors", () => {
      const a = [0, 0, 0];
      const b = [0, 0, 0];
      expect(VectorMath.cosineSimilarity(a, b)).toBe(0);
    });
  });
});
