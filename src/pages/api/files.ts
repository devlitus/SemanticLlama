import type { APIRoute } from "astro";
import { EmbeddingService } from "../../service/embeddings";

export const GET: APIRoute = async () => {
  try {
    const embeddingService = new EmbeddingService();
    await embeddingService.initialize();

    const files = embeddingService.getProcessedFiles();

    return new Response(
      JSON.stringify({
        success: true,
        files: files.map((doc) => ({
          filename: doc.filename,
          createdAt: doc.createdAt,
        })),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
