export interface FileUploadInput {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
}

export interface IPublisherFile {
  upload(file: FileUploadInput): Promise<void>;
  remove(filename: string): Promise<void>;
  close(): Promise<void>;
}
