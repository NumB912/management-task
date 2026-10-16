import { AppError } from "@domain/errors/AppError.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type { IStorageService } from "@domain/service/IStorageService.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import path from "node:path";

interface ISubUploadFile {
  userId: string;
  file: {
    buffer: string;
    mimeType: string;
    originalName: string;
    size: number;
    fileName: string;
  };
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

export default class UploadFileEvent implements IUsecase<void> {
  constructor(
    private readonly storageService: IStorageService,
    private readonly consumer: IConsumer,
  ) {}

  async handle(dto: ISubUploadFile): Promise<string> {
    const { userId, file } = dto;
    if (!/^[\w-]+$/.test(userId)) throw new Error("Invalid userId");
    if (!ALLOWED_MIME.has(file.mimeType))
      throw new Error("Unsupported file type");
    const fileName = path.posix.basename(file.fileName);
    if (!/^[\w.-]+$/.test(fileName)) throw new Error("Invalid fileName");
    const buffer = Buffer.from(file.buffer, "base64");
    if (buffer.length > MAX_AVATAR_SIZE) throw new Error("File too large");
    const prefix = `avatars/${userId}/`;
    const key = `${prefix}${fileName}`;
    await this.storageService.upload({
      key,
      body: buffer,
      contentType: file.mimeType,
    });
    try {
      const keys = await this.storageService.listKeys(prefix);
      const oldKeys = keys.filter((k) => k !== key);
      if (oldKeys.length) await this.storageService.deleteMany(oldKeys);
    } catch (err) {
      console.warn("Lỗi trong quá trình xóa", { userId, err });
    }
    return fileName;
  }

  async execute(): Promise<void> {
    await this.consumer.sub<ISubUploadFile>(
      "exchange.file",
      "file-upload-queue",
      ["file.upload"],
      "direct",
      async (event) => {
        try {
          await this.handle({ file: event.file, userId: event.userId });
        } catch (error) {
          throw new AppError("Lỗi trong quá trình thực thi", "INTERNAL", 500);
        }
      },
    );
  }
}
