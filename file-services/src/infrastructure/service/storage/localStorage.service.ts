import { randomUUID } from "node:crypto";
import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type FileUpload from "@domain/entities/file.entities.js";
import type {
  MultipartFileLike,
  UploadedFileDto,
  UploadService,
} from "@domain/service/upload.service.js";
import { UploadConfig } from "src/config.js";

export default class LocalStorageService implements UploadService {
  private readonly uploadDir: string;
  private ready: Promise<void> | null = null;

  constructor(uploadDir: string = UploadConfig.DIR) {
    this.uploadDir = path.resolve(uploadDir);
  }

  private ensureDir(): Promise<void> {
    this.ready ??= mkdir(this.uploadDir, { recursive: true }).then(() => {});
    return this.ready;
  }

  private safeName(name: string): string {
    const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
    return base || "file.bin";
  }

  async saveFile(file: FileUpload): Promise<UploadedFileDto> {
    await this.ensureDir();
    const filename = `${randomUUID()}-${this.safeName(file.originalName)}`;
    await writeFile(path.join(this.uploadDir, filename), file.buffer);

    return {
      filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      url: `${UploadConfig.BASE_URL}/uploads/${filename}`,
    };
  }

  toDto(file: MultipartFileLike): UploadedFileDto {
    const filename = file.filename ?? this.safeName(file.originalname);
    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${UploadConfig.BASE_URL}/uploads/${filename}`,
    };
  }

  toDtos(files: MultipartFileLike[]): UploadedFileDto[] {
    return files.map((file) => this.toDto(file));
  }

  async deleteFile(filename: string): Promise<void> {
    await this.ensureDir();
    const safe = this.safeName(filename);

    try {
      await unlink(path.join(this.uploadDir, safe));
    } catch (error) {
       if ((error as { code?: string }).code === "ENOENT") {
        console.warn(`[Storage] File không tồn tại, bỏ qua: ${safe}`);
        return;
      }
      throw error;
    }
  }

  async deleteFiles(filenames: string[]): Promise<void> {
    await Promise.all(filenames.map((filename) => this.deleteFile(filename)));
  }

  async exists(filename: string): Promise<boolean> {
    await this.ensureDir();
    try {
      await access(path.join(this.uploadDir, this.safeName(filename)));
      return true;
    } catch {
      return false;
    }
  }
}
