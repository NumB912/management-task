import type DeleteFileUsecase from "@application/usecase/deleteFile.usecase.js";
import { ValidationError } from "@domain/errors/AppError.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";

export default class DeleteFileEvent implements IUsecase<void> {
  private deleteFileUC: DeleteFileUsecase;
  private consumer: IConsumer;

  constructor(deleteFileUC: DeleteFileUsecase, consumer: IConsumer) {
    this.deleteFileUC = deleteFileUC;
    this.consumer = consumer;
  }

  async handle(content: Buffer, headers: Record<string, unknown>) {
    console.log(">>> [FILE DELETE CONSUMER] Nhận được yêu cầu xóa");

    let filename: string | null =
      typeof headers["filename"] === "string" ? headers["filename"] : null;
    if (!filename && content.length > 0) {
      try {
        const parsed: unknown = JSON.parse(content.toString());
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "filename" in parsed &&
          typeof (parsed as { filename: unknown }).filename === "string"
        ) {
          filename = (parsed as { filename: string }).filename;
        }
      } catch {
        // không phải JSON hợp lệ -> báo lỗi thiếu filename bên dưới
      }
    }

    if (!filename) {
      throw new ValidationError(["Thiếu tên file cần xóa (filename)"]);
    }

    await this.deleteFileUC.execute(filename);
    console.log(`[FILE DELETE CONSUMER] Đã xóa: ${filename}`);
  }

  async execute(): Promise<void> {
    await this.consumer.subBuffer(
      "exchange.file",
      "file-remove-queue",
      ["file.remove"],
      "direct",
      async ({content,headers}) => {
        await this.handle(content, headers);
      },
    );
  }
}
