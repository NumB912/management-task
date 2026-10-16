import "dotenv/config";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import UploadFileEvent from "@application/event/uploadFile.event.js";
import DeleteFileEvent from "@application/event/deleteFile.event.js";
import express, { type Request, type Response } from "express";
import path from "node:path";
import { UploadConfig } from "./config.js";
import { R2StorageService } from "@infrastructure/service/storage/R2Storage.service.js";



// const AVATAR_ROOT = path.resolve(UploadConfig.DIR, "avatars");
// const USER_ID_RE = /^[a-f0-9]{24}$/;
// const IMAGE_RE = /^[\w.-]+\.(png|jpe?g|webp|gif)$/i;
// app.get(
//   "/api/files/avatars/:userId/:filename",
//   (req: Request, res: Response) => {
//     const userId = String(req.params.userId);
//     const filename = String(req.params.filename);
//     if (!USER_ID_RE.test(userId) || !IMAGE_RE.test(filename)) {
//       return res.status(400).json({ message: "Đường dẫn không hợp lệ" });
//     }
//     const filePath = path.resolve(AVATAR_ROOT, userId, filename);
//     if (!filePath.startsWith(AVATAR_ROOT + path.sep)) {
//       return res.status(400).json({ message: "Đường dẫn không hợp lệ" });
//     }
//     res.sendFile(
//       filePath,
//       {
//         dotfiles: "deny",
//         maxAge: "7d",
//         immutable: true,
//         headers: { "Cross-Origin-Resource-Policy": "cross-origin" },
//       },
//       (err) => {
//         if (err && !res.headersSent) {
//           res.status(404).json({ message: "Không tìm thấy ảnh" });
//         }
//       },
//     );
//   },
// );

async function bootstraping() {
  try {
    const consumer = await Consumer.create();
    console.log("Rabbit kết nối thành công");
    const r2StorageService = new R2StorageService()

    const uploadFileEvent = new UploadFileEvent(
      r2StorageService,
      consumer,
    );
    const deleteFileEvent = new DeleteFileEvent(r2StorageService, consumer);

    await uploadFileEvent.execute();
    await deleteFileEvent.execute();
    console.log("khởi tạo thành công")
  } catch (error) {
    console.error(error);
  }
}

bootstraping();