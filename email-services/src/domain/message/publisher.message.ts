import {type type} from "@domain/type/message/publisher.type.js"

export default interface IPublisher{
    pub<T>(exchangeName:string,routingkey:string,type:type,event:T):Promise<void>
    close():Promise<void>
}