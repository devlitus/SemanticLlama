interface TextChunk {
  text: string;
  start: number;
  end: number;
}

interface ChunkEmbedding {
  text: string;
  start: number;
  end: number;
  embedding: number[];
}

interface DocumentEmbedding {
  id: string;
  chunks: ChunkEmbedding[];
  filename: string;
  filePath: string;
  createdAt: string;
}

interface SearchResult {
  text: string;
  filename: string;
  filePath: string;
  similarity: number;
}
