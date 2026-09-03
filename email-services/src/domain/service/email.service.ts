import type Email from "@domain/entities/email.entities.js";

export default interface IEmailService{
    sendEmail(props:Partial<Email>):Promise<void>
}