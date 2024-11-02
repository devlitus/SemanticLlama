export interface TextChunk {
  text: string;
  start: number;
  end: number;
}

export interface ChunkWithEmbedding extends TextChunk {
  embedding: number[];
}

export interface DocumentEmbedding {
  id: string;
  chunks: ChunkWithEmbedding[];
  filename: string;
  filePath: string;
  createdAt: string;
}

export interface SearchResult {
  text: string;
  filename: string;
  filePath: string;
  similarity: number;
}
