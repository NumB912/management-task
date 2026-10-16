import { AppError, ValidationError } from "@domain/errors/AppError.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type { IStorageService } from "@domain/service/IStorageService.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";

export default class DeleteFileEvent implements IUsecase<void> {
    private readonly storageService: IStorageService
    private readonly consumer: IConsumer

  constructor(storageService: IStorageService, consumer: IConsumer) {
    this.storageService = storageService;
    this.consumer = consumer;
  }

  async handle(dto: { fileName: string,userId:string }) {
    const { fileName,userId } = dto;
    console.log(fileName)
    await this.storageService.delete(fileName)
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
        try{
                  await this.handle({
          userId:event.userId,
          fileName: event.fileName,
        });
        }catch(error){
          throw new AppError("INTERNAL","Lỗi trong quá trình thực thi",500)
        }
      },
    );
  }
}
