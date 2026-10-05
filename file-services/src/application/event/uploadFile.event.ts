import type UploadFileUsecase from "@application/usecase/uploadFile.usecase.js";
import FileUpload from "@domain/entities/file.entities.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import { UploadConfig } from "src/config.js";

export default class UploadFileEvent implements IUsecase<void> {
  private uploadFileUC: UploadFileUsecase;
  private consumer: IConsumer;

  constructor(uploadFileUC: UploadFileUsecase, consumer: IConsumer) {
    this.uploadFileUC = uploadFileUC;
    this.consumer = consumer;
  }

  async handle(content: Buffer, headers: Record<string, unknown>) {
    console.log(">>> [FILE UPLOAD CONSUMER] Nhận được file");

    const originalName =
      typeof headers["originalName"] === "string"
        ? headers["originalName"]
        : "file.bin";
    const mimetype =
      typeof headers["mimetype"] === "string"
        ? headers["mimetype"]
        : "application/octet-stream";

    const file = new FileUpload({
      buffer: content,
      originalName,
      mimetype,
      maxSizeBytes: UploadConfig.MAX_SIZE_MB * 1024 * 1024,
    });

    const dto = await this.uploadFileUC.execute(file);
    console.log(
      `[FILE UPLOAD CONSUMER] Đã lưu: ${dto.filename} (${dto.size} bytes)`,
    );
  }

  async execute(): Promise<void> {
    await this.consumer.subBuffer(
      "exchange.file",
      "file-upload-queue",
      ["file.upload"],
      "direct",
      async ({content,headers}) => {
        await this.handle(content, headers);
      },
    );
  }
}
