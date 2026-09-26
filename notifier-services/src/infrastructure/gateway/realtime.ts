import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
import type { Response } from "express";

export class SSERealtimeGateway implements IRealtimeGateway{
  private readonly instanceId = Math.random().toString(36).slice(2, 8);
  private readonly clients=new Map<string,Set<Response>>()

  register(userId:string,res:Response):void{
   const user = this.clients.get(userId)
    console.log(`[Gateway ${this.instanceId}] đăng ký với userId=${userId}`);
    if(!user){
      this.clients.set(userId,new Set())
    }
    user?.add(res)
  };
  unregister(userId:string,res:Response):void{
    const user = this.clients.get(userId)
    if(!user) return
    user.delete(res)
  }
  pushToUser<T>(userId: string, event: string, payload: T): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;
    const endPayload = {
      user:userId,
      ...payload,
      event:event,
    }
    const message = `event: ${event}\ndata: ${JSON.stringify(endPayload)}\n\n`;
    userClients.forEach((res) => {
      res.write(message)
    });
  }

}