import { EmbeddingService } from "@/services/embeddings";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const query = formData.get("query")?.toString();

    if (!query) {
      return new Response(JSON.stringify({ error: "No query provided" }), {
        status: 400,
      });
    }

    console.log("Received search query:", query);

    const embeddingService = new EmbeddingService();
    await embeddingService.initialize();
    const results = await embeddingService.findSimilarTexts(query, 5);

    return new Response(
      JSON.stringify({
        success: true,
        query,
        results,
        resultCount: results.length,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      }),
      {
        status: 500,
      }
    );
  }
};
