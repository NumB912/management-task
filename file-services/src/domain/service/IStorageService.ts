export interface UploadParams {
  key: string;
  body: Buffer | NodeJS.ReadableStream;
  contentType: string;
}

export interface IStorageService {
  upload(params: UploadParams): Promise<void>;
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getPublicUrl(key: string): string;
  listKeys(prefix: string): Promise<string[]>;
  delete(key: string): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
}