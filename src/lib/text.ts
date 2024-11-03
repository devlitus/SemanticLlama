export class TextProcessor {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(chunkSize = 500, chunkOverlap = 100) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  splitIntoChunks(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    let currentChunk = "";
    let currentStart = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();

      if (
        currentChunk.length + sentence.length > this.chunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push({
          text: currentChunk.trim(),
          start: currentStart,
          end: currentStart + currentChunk.length,
        });

        const lastSentences = currentChunk
          .split(/[.!?]+\s+/)
          .slice(-2)
          .join(". ");
        currentChunk = lastSentences + " " + sentence;
        currentStart =
          currentStart + currentChunk.length - lastSentences.length;
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence;
      }
    }

    if (currentChunk) {
      chunks.push({
        text: currentChunk.trim(),
        start: currentStart,
        end: currentStart + currentChunk.length,
      });
    }

    return chunks;
  }

  findOverlap(str1: string, str2: string): string {
    let overlap = "";
    const minLength = Math.min(str1.length, str2.length);

    for (let i = 1; i <= minLength; i++) {
      if (str1.endsWith(str2.slice(0, i))) {
        overlap = str2.slice(0, i);
      }
    }

    return overlap;
  }
}
