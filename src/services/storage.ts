import type { DocumentEmbedding } from "@/types/embedding";
import fs from "node:fs/promises";
import path from "node:path";

export class StorageService {
  private embeddingsPath: string;
  private docsPath: string;

  constructor() {
    this.embeddingsPath = path.join(process.cwd(), "public", "embeddings.json");
    this.docsPath = path.join(process.cwd(), "public", "docs");
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.docsPath, { recursive: true });
      console.log("Storage initialized:", this.docsPath);
    } catch (error) {
      console.error("Error initializing storage:", error);
      throw error;
    }
  }

  async loadEmbeddings(): Promise<DocumentEmbedding[]> {
    try {
      await fs.access(this.embeddingsPath);
      const data = await fs.readFile(this.embeddingsPath, "utf-8");
      const embeddings = JSON.parse(data);
      console.log(`Loaded ${embeddings.length} embeddings`);
      return embeddings;
    } catch (error) {
      console.log("No existing embeddings found");
      return [];
    }
  }

  async saveEmbeddings(embeddings: DocumentEmbedding[]): Promise<void> {
    try {
      await fs.writeFile(
        this.embeddingsPath,
        JSON.stringify(embeddings, null, 2)
      );
      console.log(`Saved ${embeddings.length} embeddings`);
    } catch (error) {
      console.error("Error saving embeddings:", error);
      throw error;
    }
  }

  async saveFile(filename: string, content: string): Promise<string> {
    try {
      const filePath = path.join(this.docsPath, filename);
      await fs.writeFile(filePath, content);
      const relativePath = path.join("docs", filename);
      console.log("File saved:", relativePath);
      return relativePath;
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    }
  }
}
