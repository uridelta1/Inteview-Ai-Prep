import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

/**
 * Extracts raw text from an uploaded resume buffer.
 * @param {Buffer} buffer
 * @param {"pdf"|"docx"} fileType
 */
export const extractResumeText = async (buffer, fileType) => {
  if (fileType === "pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (fileType === "docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  throw new Error("Unsupported file type");
};

export const mimeToFileType = (mimetype) => {
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    return "docx";
  return null;
};
