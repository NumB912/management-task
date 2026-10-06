export interface IFileStorage {
  save(input: { buffer: Buffer; filename: string; mimeType: string }): Promise<string>;
}