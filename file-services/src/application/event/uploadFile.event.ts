import type DeleteFileUsecase from "@application/usecase/deleteFile.usecase.js";
import type UploadFileUsecase from "@application/usecase/uploadFile.usecase.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import fs from "node:fs/promises";
import path from "node:path";
import { UploadConfig } from "src/config.js";

interface ISubUploadFile {
  userId: string;
  file: {
    buffer: string; // base64 (do usecase gửi qua RabbitMQ)
    mimeType: string;
    originalName: string;
    size: number;
    fileName: string;
  };
}

export default class UploadFileEvent implements IUsecase<void> {
  constructor(
    private readonly uploadFileUC: UploadFileUsecase,
    private readonly deleteFileUC: DeleteFileUsecase,
    private readonly consumer: IConsumer,
  ) {}

  async handle(dto: ISubUploadFile) {
    const { userId, file } = dto;

    if (!/^[\w-]+$/.test(userId)) {
      throw new Error("Invalid userId");
    }
    const fileName = path.basename(file.fileName);
    const userDir = path.resolve(UploadConfig.DIR, "avatars", userId);
    await fs.mkdir(userDir, { recursive: true });
    await this.uploadFileUC.execute(
        {
          buffer: Buffer.from(file.buffer, "base64"),
          mimetype: file.mimeType,
          originalName: file.originalName,
          size: file.size,
        },
        `avatars/${userId}`,
        fileName,
      );
    const existing = await fs.readdir(userDir);
    const oldFiles = existing.filter((name) => name !== fileName);
    await this.deleteFileUC.execute(oldFiles,`avatars/${userId}`)
    return fileName;
  }

  async execute(): Promise<void> {
    await this.consumer.sub<ISubUploadFile>(
      "exchange.file",
      "file-upload-queue",
      ["file.upload"],
      "direct",
      async (event) => {
        await this.handle({
          file: event.file,
          userId: event.userId,
        });
      },
    );
  }
}