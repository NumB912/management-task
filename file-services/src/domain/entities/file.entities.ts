import { ValidationError } from "@domain/errors/AppError.js";

export interface FileUploadProps {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
  maxSizeBytes?: number;
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default class FileUpload {
  readonly buffer: Buffer;
  readonly originalName: string;
  readonly mimetype: string;

  constructor(props: FileUploadProps) {
    const errors: string[] = [];
    const maxSize = props.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;

    if (!props.buffer || props.buffer.length === 0) {
      errors.push("File rỗng");
    } else if (props.buffer.length > maxSize) {
      errors.push(
        `File vượt quá dung lượng cho phép (${Math.floor(maxSize / 1024 / 1024)}MB)`,
      );
    }

    if (!props.originalName || props.originalName.trim() === "") {
      errors.push("Thiếu tên file gốc (originalName)");
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    this.buffer = props.buffer;
    this.originalName = props.originalName.trim();
    this.mimetype = props.mimetype || "application/octet-stream";
  }

  get size(): number {
    return this.buffer.length;
  }
}
