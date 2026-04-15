import mammoth from "mammoth";

export async function parseDocument(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<string> {
  if (fileType === "pdf") {
    try {
      // Dynamic import to handle Vercel serverless compatibility
      const pdfParse = await import("pdf-parse");
      const PDFParse = pdfParse.PDFParse || pdfParse.default?.PDFParse;
      if (PDFParse) {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();
        return result.text;
      }
      // Fallback: pdf-parse v1 API
      const parse = pdfParse.default || pdfParse;
      if (typeof parse === "function") {
        const result = await parse(buffer);
        return result.text;
      }
      throw new Error("Could not find pdf-parse API");
    } catch (e) {
      // Last resort fallback: extract raw text from PDF buffer
      const text = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
      if (text.length > 100) return text;
      throw new Error(`PDF parsing failed: ${e instanceof Error ? e.message : "unknown error"}`);
    }
  }

  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

export function detectFileType(fileName: string): "pdf" | "docx" {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  throw new Error(`Unsupported file extension: .${ext}. Use PDF or DOCX.`);
}
