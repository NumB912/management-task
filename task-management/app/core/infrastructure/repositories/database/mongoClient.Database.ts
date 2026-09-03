import { databaseConfig } from "@/app/core/config/database.config";
import mongoose, { Mongoose } from "mongoose";

const globalClient = globalThis as typeof globalThis & {
  _MongodbClientGlobal:MongodbClient
}

export class MongodbClient {
  private static instance: MongodbClient;
  private readonly client: Mongoose;
  private isReconnecting = false;
  private isShuttingDown = false;

  private constructor() {
    this.client = mongoose;
  }

  static async getInstance(): Promise<MongodbClient> {
    if(globalClient._MongodbClientGlobal){
      return globalClient._MongodbClientGlobal
    }

    if (!this.instance) {
      this.instance = new MongodbClient();
      this.instance.registerEventListeners();
      await this.instance.connect();
      globalClient._MongodbClientGlobal = this.instance
    }
    return this.instance;
  }

  private registerEventListeners(): void {
    this.client.connection.removeAllListeners("connected");
    this.client.connection.removeAllListeners("disconnected");
    this.client.connection.removeAllListeners("error");
    this.client.connection.on("connected", () => {
      console.log("[MongoDB] Đã kết nối với database");
    });

    this.client.connection.on("disconnected", async () => {
      if (this.isShuttingDown) return;
      console.warn("[MongoDB] Mất kết nối với database");
      await this.reconnect();
    });

    this.client.connection.on("error", (err: Error) => {
      console.error("[MongoDB] Lỗi kết nối:", err.message);
    });

    const shutdown = async (signal: string) => {
      console.log(`[MongoDB] Nhận tín hiệu ${signal}, đang ngắt kết nối...`);
      this.isShuttingDown = true;
      await this.disconnect();
      process.exit(0);
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  }

  private async reconnect(): Promise<void> {
    if (this.isReconnecting) {
      console.log("[MongoDB] Đang trong quá trình reconnect, bỏ qua...");
      return;
    }

    this.isReconnecting = true;
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 2000;

    try {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(
            `[MongoDB] Thử kết nối lại lần ${attempt}/${MAX_RETRIES}...`,
          );
          await this.connect();
          console.log("[MongoDB] Kết nối lại thành công");
          return;
        } catch (error) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          console.error(error);
          console.error(
            `[MongoDB] Kết nối lại thất bại, thử lại sau ${delay}ms`,
          );
          await this.sleep(delay);
        }
      }
      console.error("[MongoDB] Hết số lần thử kết nối lại. Dừng ứng dụng.");
      process.exit(1);
    } finally {
      this.isReconnecting = false;
    }
  }

  async connect(): Promise<void> {
    if (this.client.connection.readyState === 1) return;
    const uri = databaseConfig.URI;
    if (!uri) {
      throw new Error("[MongoDB] Thiếu URI trong cấu hình");
    }

    await this.client.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  async disconnect(): Promise<void> {
    this.isShuttingDown = true;
    await this.client.disconnect();
    console.log("[MongoDB] Đã ngắt kết nối");
  }

  getClient(): Mongoose {
    return this.client;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


