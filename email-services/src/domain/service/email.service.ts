import type Email from "@domain/entities/email.entities.js";

export default interface IEmailService{
    sendEmail(props:Email):Promise<void>
}
