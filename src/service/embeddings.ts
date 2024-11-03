import { TextProcessor } from "../lib/text";
import { VectorMath } from "../lib/math";
import { StorageService } from "./storage";
import { OllamaClient } from "./ollamaClient";

interface SearchOptions {
  topK?: number;
  minSimilarity?: number;
}

export class EmbeddingService {
  private storage: StorageService;
  private ollama: OllamaClient;
  private textProcessor: TextProcessor;
  private embeddings: DocumentEmbedding[];

  constructor() {
    this.storage = new StorageService();
    this.ollama = new OllamaClient();
    this.textProcessor = new TextProcessor(500, 100);
    this.embeddings = [];
  }

  async initialize(): Promise<void> {
    try {
      await this.storage.initialize();
      this.embeddings = await this.storage.loadEmbeddings();
      console.log(`Initialized with ${this.embeddings.length} documents`);
    } catch (error) {
      console.error("Error initializing EmbeddingService:", error);
      throw error;
    }
  }

  getProcessedFiles(): Array<{ filename: string; createdAt: string }> {
    return this.embeddings.map((doc) => ({
      filename: doc.filename,
      createdAt: doc.createdAt,
    }));
  }

  private isFileDuplicate(filename: string): boolean {
    return this.embeddings.some((doc) => doc.filename === filename);
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

      const chunks = [];
      for (const chunk of textChunks) {
        try {
          const embedding = await this.ollama.generateEmbedding(chunk.text);
          chunks.push({
            ...chunk,
            embedding,
          });
          console.log(
            `Generated embedding for chunk of length ${chunk.text.length}`
          );
        } catch (error) {
          console.error(`Error generating embedding for chunk:`, error);
          throw error;
        }
      }

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
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      console.log(`Searching for query: "${query}"`);

      if (this.embeddings.length === 0) {
        console.log("No embeddings available for search");
        return [];
      }

      const { topK = 5, minSimilarity = 0.5 } = options;

      const queryEmbedding = await this.ollama.generateEmbedding(query);
      console.log(`Generated query embedding`);

      const results: SearchResult[] = [];

      for (const doc of this.embeddings) {
        console.log(`Processing document: ${doc.filename}`);

        for (const chunk of doc.chunks) {
          try {
            if (
              !Array.isArray(chunk.embedding) ||
              !Array.isArray(queryEmbedding)
            ) {
              console.error("Invalid embedding format:", {
                chunkEmbedding: chunk.embedding,
                queryEmbedding,
              });
              continue;
            }

            if (chunk.embedding.length !== queryEmbedding.length) {
              console.error("Embedding length mismatch:", {
                chunkLength: chunk.embedding.length,
                queryLength: queryEmbedding.length,
              });
              continue;
            }

            const similarity = VectorMath.cosineSimilarity(
              queryEmbedding,
              chunk.embedding
            );

            if (similarity >= minSimilarity) {
              results.push({
                text: chunk.text,
                filename: doc.filename,
                filePath: doc.filePath,
                similarity,
              });
            }
          } catch (error) {
            console.error(`Error processing chunk in ${doc.filename}:`, error);
            continue;
          }
        }
      }

      const sortedResults = results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      console.log(
        `Found ${sortedResults.length} results above threshold ${minSimilarity}`
      );
      return sortedResults;
    } catch (error) {
      console.error("Error finding similar texts:", error);
      throw error;
    }
  }
}
