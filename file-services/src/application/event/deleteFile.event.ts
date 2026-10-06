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

  async handle(dto: { fileName: string,userId:string }) {
    const { fileName,userId } = dto;

    this.deleteFileUC.execute([fileName], `avatars/${userId}`);
    return fileName;
  }

  async execute(): Promise<void> {
    await this.consumer.sub<{
      fileName: string;
      userId:string;
    }>(
      "exchange.file",
      "file-remove-queue",
      ["file.remove"],
      "direct",
      async (event) => {
        await this.handle({
          userId:event.userId,
          fileName: event.fileName,
        });
      },
    );
  }
}
