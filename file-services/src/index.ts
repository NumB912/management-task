import "dotenv/config";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import LocalStorageService from "@infrastructure/service/storage/localStorage.service.js";
import UploadFileUsecase from "@application/usecase/uploadFile.usecase.js";
import DeleteFileUsecase from "@application/usecase/deleteFile.usecase.js";
import UploadFileEvent from "@application/event/uploadFile.event.js";
import DeleteFileEvent from "@application/event/deleteFile.event.js";
import express, { type Request, type Response } from "express";
import path from "node:path";
import { UploadConfig } from "./config.js";
const app = express()
app.use(
  "/uploads",
  express.static(path.resolve(UploadConfig.DIR), {
    maxAge: "7d",      
    immutable: true,
    index: false,     
    dotfiles: "deny", 
  }),
);
async function bootstraping() {
  try {
    const consumer = await Consumer.create();
    console.log("Consumer connected to RabbitMQ successfully");
    const storageService = new LocalStorageService();
    const uploadFileUC = new UploadFileUsecase(storageService);
    const deleteFileUC = new DeleteFileUsecase(storageService);
    const uploadFileEvent = new UploadFileEvent(uploadFileUC,deleteFileUC, consumer);
    const deleteFileEvent = new DeleteFileEvent(deleteFileUC, consumer);
    await uploadFileEvent.execute();
    await deleteFileEvent.execute();
  } catch (error) {
    console.error(error);
  }
}

bootstraping();

app.listen(3006, "0.0.0.0", () => {
  console.log("Mở server tại cổng:", 3006);
});