import { AppError } from "./AppError.js"

export class OtpErr extends AppError{

    static invalidOtp(){
        return new OtpErr("OTP_ERROR","OTP không đúng",401)
    }

    static expiredOtp(){
        return new OtpErr("OTP_ERROR","OTP hết hạn",401)
    }

    static maxAttemptsExceeded(){
        return new OtpErr("OTP_ERROR","OTP hết lần nhập",429)
    }

}