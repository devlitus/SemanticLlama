import type { DocumentEmbedding, SearchResult } from "@/types/embedding";
import { TextProcessor } from "@/lib/text";
import { VectorMath } from "@/lib/math";
import { OllamaClient } from "./ollamaClient";
import { StorageService } from "./storage";

export class EmbeddingService {
  private storage: StorageService;
  private ollama: OllamaClient;
  private textProcessor: TextProcessor;
  private embeddings: DocumentEmbedding[];

  constructor() {
    this.storage = new StorageService();
    this.ollama = new OllamaClient();
    this.textProcessor = new TextProcessor();
    this.embeddings = [];
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
    this.embeddings = await this.storage.loadEmbeddings();
  }
  private isFileDuplicate(filename: string): boolean {
    return this.embeddings.some((doc) => doc.filename === filename);
  }

  getProcessedFiles(): Array<{ filename: string; createdAt: string }> {
    return this.embeddings.map((doc) => ({
      filename: doc.filename,
      createdAt: doc.createdAt,
    }));
  }

  async processTextFile(fileData: {
    filename: string;
    content: string;
  }): Promise<DocumentEmbedding> {
    try {
      console.log(`Processing file: ${fileData.filename}`);

      if (this.isFileDuplicate(fileData.filename)) {
        throw new Error(
          `El archivo "${fileData.filename}" ya ha sido procesado anteriormente.`
        );
      }

      const fileId = Math.random().toString(36).substring(7);
      const safeFilename = `${fileId}-${fileData.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = await this.storage.saveFile(
        safeFilename,
        fileData.content
      );

      const textChunks = this.textProcessor.splitIntoChunks(fileData.content);
      console.log(`Split text into ${textChunks.length} chunks`);

      const chunks = await Promise.all(
        textChunks.map(async (chunk) => ({
          ...chunk,
          embedding: await this.ollama.generateEmbedding(chunk.text),
        }))
      );

      const document: DocumentEmbedding = {
        id: fileId,
        chunks,
        filename: fileData.filename,
        filePath,
        createdAt: new Date().toISOString(),
      };

      this.embeddings.push(document);
      await this.storage.saveEmbeddings(this.embeddings);

      console.log(`Document processed and saved with ID: ${fileId}`);
      return document;
    } catch (error) {
      console.error("Error processing file:", error);
      throw error;
    }
  }

  async findSimilarTexts(
    query: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    try {
      console.log(`Searching for query: "${query}"`);

      if (this.embeddings.length === 0) {
        console.log("No embeddings available for search");
        return [];
      }

      const queryEmbedding = await this.ollama.generateEmbedding(query);
      console.log(`Generated query embedding`);

      const results: SearchResult[] = [];

      for (const doc of this.embeddings) {
        for (const chunk of doc.chunks) {
          const similarity = VectorMath.cosineSimilarity(
            queryEmbedding,
            chunk.embedding
          );
          if (similarity > 0.5) {
            // Umbral de similitud
            results.push({
              text: chunk.text,
              filename: doc.filename,
              filePath: doc.filePath,
              similarity,
            });
          }
        }
      }

      const sortedResults = results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      console.log(`Found ${sortedResults.length} results`);
      return sortedResults;
    } catch (error) {
      console.error("Error finding similar texts:", error);
      throw error;
    }
  }
}
