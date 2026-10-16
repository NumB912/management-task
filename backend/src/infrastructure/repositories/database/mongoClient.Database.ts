import { databaseConfig } from "@/domain/config/database.config.js";
import { Injectable, Logger } from "@nestjs/common";
import mongoose, { Mongoose } from "mongoose";
@Injectable()
export class MongodbClient {
  private readonly logger = new Logger(MongodbClient.name);
  private static instance: MongodbClient;
  private readonly client: Mongoose;
  private uri:string=""
  private isReconnecting = false;
  private isShuttingDown = false;

  private constructor() {
    this.client = mongoose;
  }

  static async getInstance(uri:string): Promise<MongodbClient> {
    if(this.instance){
      return this.instance
    }

    if (!this.instance) {
      this.instance = new MongodbClient();
      this.instance.uri = uri
      this.instance.registerEventListeners();
      await this.instance.connect();
    }
    return this.instance;
  }

  private registerEventListeners(): void {
    this.client.connection.removeAllListeners("connected");
    this.client.connection.removeAllListeners("disconnected");
    this.client.connection.removeAllListeners("error");
    this.client.connection.on("connected", () => {
      this.logger.log("Đã kết nối với database");
    });

    this.client.connection.on("disconnected", async () => {
      if (this.isShuttingDown) return;
      this.logger.warn("Mất kết nối với database; bắt đầu reconnect");
      await this.reconnect();
    });

    this.client.connection.on("error", (err: Error) => {
      this.logger.error("Lỗi kết nối database", err.stack);
    });

    const shutdown = async (signal: string) => {
      this.logger.log(`Nhận tín hiệu ${signal}, đang ngắt kết nối...`);
      this.isShuttingDown = true;
      await this.disconnect();
      process.exit(0);
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  }

  private async reconnect(): Promise<void> {
    if (this.isReconnecting) {
      this.logger.warn("Đang reconnect, bỏ qua yêu cầu reconnect trùng");
      return;
    }

    this.isReconnecting = true;
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 2000;

    try {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          this.logger.log(`Thử kết nối lại lần ${attempt}/${MAX_RETRIES}...`);
          await this.connect();
          this.logger.log("Kết nối lại thành công");
          return;
        } catch (error) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          this.logger.error(`Kết nối lại thất bại; thử lại sau ${delay}ms`, error instanceof Error ? error.stack : String(error));
          await this.sleep(delay);
        }
      }
      this.logger.error("Hết số lần thử kết nối lại. Dừng ứng dụng.");
      process.exit(1);
    } finally {
      this.isReconnecting = false;
    }
  }

  async connect(): Promise<void> {
    if (this.client.connection.readyState === 1) return;
    if (!this.uri) {
      throw new Error("[MongoDB] Thiếu URI trong cấu hình");
    }

    await this.client.connect(this.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  async disconnect(): Promise<void> {
    this.isShuttingDown = true;
    await this.client.disconnect();
    this.logger.log("Đã ngắt kết nối");
  }

  getClient(): Mongoose {
    return this.client;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


