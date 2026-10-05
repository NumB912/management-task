import "dotenv/config";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import LocalStorageService from "@infrastructure/service/storage/localStorage.service.js";
import UploadFileUsecase from "@application/usecase/uploadFile.usecase.js";
import DeleteFileUsecase from "@application/usecase/deleteFile.usecase.js";
import UploadFileEvent from "@application/event/uploadFile.event.js";
import DeleteFileEvent from "@application/event/deleteFile.event.js";

async function bootstraping() {
  try {
    const consumer = await Consumer.create();
    console.log("Consumer connected to RabbitMQ successfully");

    const storageService = new LocalStorageService();
    const uploadFileUC = new UploadFileUsecase(storageService);
    const deleteFileUC = new DeleteFileUsecase(storageService);

    const uploadFileEvent = new UploadFileEvent(uploadFileUC, consumer);
    const deleteFileEvent = new DeleteFileEvent(deleteFileUC, consumer);

    await uploadFileEvent.execute();
    await deleteFileEvent.execute();
  } catch (error) {
    console.error(error);
  }
}

bootstraping();
