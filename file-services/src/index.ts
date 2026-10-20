import "./config-env.js";
import "./config.js";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import UploadFileEvent from "@application/event/uploadFile.event.js";
import DeleteFileEvent from "@application/event/deleteFile.event.js";
import { R2StorageService } from "@infrastructure/service/storage/R2Storage.service.js";

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
