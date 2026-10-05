import { type } from "./type.event.js"



export interface IPublisher{
    pub<T>(exchangeName:string,routingkey:string,type:type,event:T):Promise<void>
    close():Promise<void>
}