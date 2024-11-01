import type { APIRoute } from "astro";
import { FileProcessor } from "../../service/fileProcessor";
import { EmbeddingService } from "../../service/embeddings";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    // Validar tipo de archivo
    if (file.type !== "text/plain" && file.type !== "application/pdf") {
      return new Response(
        JSON.stringify({
          error:
            "Tipo de archivo no válido. Solo se aceptan archivos .txt y .pdf",
        }),
        {
          status: 400,
        }
      );
    }

    // Extraer texto del archivo
    const content = await FileProcessor.extractText(file);

    const embeddingService = new EmbeddingService();
    await embeddingService.initialize();

    const result = await embeddingService.processTextFile({
      filename: file.name,
      content,
    });

    return new Response(JSON.stringify({ success: true, document: result }), {
      status: 200,
    });
  } catch (error) {
    console.error("Upload error:", error);
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
