import { RequestQueue } from "@/lib/queue";
import { withRetry } from "@/lib/retry";

export class OllamaClient {
  private baseUrl: string;
  private model: string;
  private queue: RequestQueue;

  constructor(baseUrl = "http://localhost:11434", model = "llama3.2") {
    this.baseUrl = baseUrl;
    this.model = model;
    this.queue = new RequestQueue(2);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || typeof text !== "string") {
      throw new Error(`Invalid text input: ${typeof text}`);
    }

    return this.queue.add(async () => {
      return withRetry(
        async () => {
          console.log(
            "Generating embedding for text:",
            text.substring(0, 100) + "..."
          );

          const response = await fetch(`${this.baseUrl}/api/embeddings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "nomic-embed-text",
              prompt: text,
              options: { temperature: 0.0 },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Ollama API error (${response.status}): ${errorText}`
            );
          }

          const data = await response.json();

          if (!data?.embedding || !Array.isArray(data.embedding)) {
            throw new Error("Invalid embedding response from API");
          }

          console.log(`Generated embedding of length ${data.embedding.length}`);
          return data.embedding;
        },
        {
          maxRetries: 5,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffFactor: 2,
        }
      );
    });
  }
}
