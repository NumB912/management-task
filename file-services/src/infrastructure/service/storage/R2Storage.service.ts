import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";
import type {
  IStorageService,
  UploadParams,
} from "@domain/service/IStorageService.js";
import { R2Config } from "src/config.js";
export class R2StorageService implements IStorageService {
  async listKeys(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const res = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: token,
        }),
      );
      keys.push(...(res.Contents?.map((o) => o.Key!) ?? []));
      token = res.NextContinuationToken;
    } while (token);
    return keys;
  }
  getPublicUrl(key: string) {
    return `${R2Config.R2_PUBLIC_URL}/${key}`;
  }
  private readonly client = new S3Client({
    region: "auto",
    endpoint: `https://${R2Config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2Config.R2_ACCESS_KEY_ID!,
      secretAccessKey: R2Config.R2_SECRET_ACCESS_KEY!,
    },
  });
  private readonly bucket = R2Config.R2_BUCKET!;

  getUploadUrl(key: string, contentType: string) {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 300 },
    );
  }

  getDownloadUrl(key: string) {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: 3600 },
    );
  }

  async upload({ key, body, contentType }: UploadParams) {
    await new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.isBuffer(body) ? body : Readable.fromWeb(body as never),
        ContentType: contentType,
      },
    }).done();
  }

  async deleteMany(keys: string[]): Promise<void> {
    for (let i = 0; i < keys.length; i += 1000) {
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })),
            Quiet: true,
          },
        }),
      );
    }
  }
  async delete(key: string) {
    console.log(key)
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
