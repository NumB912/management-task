import type FileUpload from "@domain/entities/file.entities.js";

export interface UploadService {
  saveFile(file: FileUpload,url:string,fileName:String): Promise<UploadedFileDto>;
  toDto(file: MultipartFileLike): UploadedFileDto;
  toDtos(files: MultipartFileLike[]): UploadedFileDto[];
  deleteFile(filename: string,url:string): Promise<void>;
  deleteFiles(filenames: string[],url:string): Promise<void>;
  exists(filename: string): Promise<boolean>;
}

export interface UploadedFileDto {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface MultipartFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  filename?: string;
  buffer?: Buffer;
}
