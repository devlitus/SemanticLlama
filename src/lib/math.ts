export class VectorMath {
  static cosineSimilarity(a: number[], b: number[]): number {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      throw new Error(`Invalid input types: a(${typeof a}), b(${typeof b})`);
    }

    if (a.length !== b.length) {
      throw new Error(`Vector length mismatch: a(${a.length}), b(${b.length})`);
    }

    try {
      const dotProduct = a.reduce((sum, val, i) => {
        if (typeof val !== "number" || typeof b[i] !== "number") {
          throw new Error(`Invalid values at index ${i}`);
        }
        return sum + val * b[i];
      }, 0);

      const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

      if (normA === 0 || normB === 0) return 0;

      return Math.max(-1, Math.min(1, dotProduct / (normA * normB)));
    } catch (error) {
      console.error("Error in cosineSimilarity:", error);
      throw error;
    }
  }
}
