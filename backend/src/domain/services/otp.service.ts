export interface IOtpService{
    generateOtp(email:string):Promise<string>
    verify(email:string,otp:string):Promise<void>
}