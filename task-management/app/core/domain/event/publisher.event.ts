import { type } from "./type.event"


export interface IPublisher{
    pub<T>(exchangeName:string,routingkey:string,type:type,event:T):Promise<void>
    close():Promise<void>
}