import { extractTextFromPDF } from "@/lib/pdf";

export class FileProcessor {
  static async extractText(file: File): Promise<string> {
    const fileType = file.type || "";

    try {
      if (fileType === "application/pdf") {
        return await extractTextFromPDF(file);
      } else if (fileType === "text/plain") {
        return await file.text();
      } else {
        throw new Error(
          "Tipo de archivo no soportado. Solo se aceptan archivos .txt y .pdf"
        );
      }
    } catch (error) {
      console.error("Error processing file:", error);
      throw error;
    }
  }
}
