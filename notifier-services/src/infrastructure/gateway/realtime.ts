import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
import type { Response } from "express";

export class SSERealtimeGateway implements IRealtimeGateway{
  private readonly instanceId = Math.random().toString(36).slice(2, 8);
  private readonly clients=new Map<string,Set<Response>>()


  register(userId: string, res: Response): void {
    const key = String(userId);
    let userClients = this.clients.get(key);
    if (!userClients) {
      userClients = new Set();
      this.clients.set(key, userClients);
    }
    userClients.add(res);
    console.log(
      `[Gateway ${this.instanceId}] đăng ký userId=${key}, tổng kết nối=${userClients.size}`,
    );
  }

  unregister(userId: string, res: Response): void {
    const key = String(userId);
    const userClients = this.clients.get(key);
    if (!userClients) return;
    userClients.delete(res);
    if (userClients.size === 0) this.clients.delete(key);
    console.log(
      `[Gateway ${this.instanceId}] hủy userId=${key}, còn lại=${userClients.size}`,
    );
  }
  pushToUser<T>(userId: string, event: string, payload: T): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;
    const endPayload = {
      ...payload,
      user:userId,
      event:event,
    }
    const message = `event: ${event}\ndata:${JSON.stringify(endPayload)}\n\n`;
    console.log(message)
    userClients.forEach((res) => {
      res.write(message)
    });
  }

}