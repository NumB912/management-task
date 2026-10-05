import {type type} from "@domain/type/message/publisher.type.js"

export default interface IPublisher{
    pub<T>(exchangeName:string,routingkey:string,type:type,event:T):Promise<void>
    pubBuffer(
      exchangeName:string,
      routingKey:string,
      type:type,
      content:Buffer,
      headers?:Record<string, unknown>
    ):Promise<void>
    close():Promise<void>
}
