import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function parseDocument(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<string> {
  if (fileType === "pdf") {
    const result = await pdfParse(buffer);
    return result.text;
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
