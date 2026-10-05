/**
 * Ví dụ producer gửi file (raw buffer) qua RabbitMQ cho file-services.
 *
 * Chạy:  npx tsx examples/send-file.example.ts <đường_dẫn_file> [remove_filename]
 *
 * Giao thức message:
 *  - Upload: exchange "exchange.file", routing key "file.upload"
 *      + content  : buffer thô của file
 *      + headers  : { originalName, mimetype }
 *  - Remove: exchange "exchange.file", routing key "file.remove"
 *      + headers  : { filename }   (filename là tên file đã lưu, vd: "uuid-anh.png")
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Publisher from "@infrastructure/service/message/publisher.message.js";

const filePath = process.argv[2];
const removeFilename = process.argv[3];

async function main() {
  const publisher = await Publisher.create();

  if (filePath) {
    const buffer = await readFile(filePath);
    const originalName = path.basename(filePath);

    await publisher.pubBuffer(
      "exchange.file",
      "file.upload",
      "direct",
      buffer,
      { originalName, mimetype: "application/octet-stream" },
    );
    console.log(`[Example] Đã gửi upload: ${originalName} (${buffer.length} bytes)`);
  }

  if (removeFilename) {
    await publisher.pubBuffer(
      "exchange.file",
      "file.remove",
      "direct",
      Buffer.alloc(0),
      { filename: removeFilename },
    );
    console.log(`[Example] Đã gửi remove: ${removeFilename}`);
  }

  await publisher.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
