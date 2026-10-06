import type { UploadService } from "@domain/service/upload.service.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";

export default class DeleteFileUsecase implements IUsecase<void> {
  private storage: UploadService;
  constructor(storage: UploadService) {
    this.storage = storage;
  }
  async execute(filenames: string[],url:string): Promise<void> {
    await this.storage.deleteFiles(filenames,url);
  }
}
