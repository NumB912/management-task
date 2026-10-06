import type FileUpload from "@domain/entities/file.entities.js";
import type {
  UploadedFileDto,
  UploadService,
} from "@domain/service/upload.service.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";

export default class UploadFileUsecase
  implements IUsecase<UploadedFileDto>
{
  private storage: UploadService;

  constructor(storage: UploadService) {
    this.storage = storage;
  }

  async execute(file: FileUpload,fileName:string,url:string): Promise<UploadedFileDto> {
    return this.storage.saveFile(file,fileName,url);
  }
}
