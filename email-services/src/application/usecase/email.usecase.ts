import type Email from "@domain/entities/email.entities.js"
import type IEmailService from "@domain/service/email.service.js"
import type IUsecase from "@domain/usecase/usecase.entities.js"

export default class SendEmail implements IUsecase<void>{
    private service:IEmailService
    constructor(service:IEmailService){
        this.service = service
    }
    async execute(email:Partial<Email>): Promise<void> {
       await this.service.sendEmail(email)
    }
}