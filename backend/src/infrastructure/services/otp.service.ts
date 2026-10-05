import { AppError,type ICache, IOtpService } from "@/domain";
import { Inject, Injectable } from "@nestjs/common";
import crypto from "node:crypto"
import { TYPES } from "../types/dependency.type";

@Injectable()
export default class OTPService implements IOtpService {
  private readonly LENGTH = 6;
  private readonly OTP_RETRY_TIME = 5;

  constructor(@Inject(TYPES.Cache) private readonly cache:ICache) {
  }

  public async generateOtp(email: string):Promise<string> {
      const number = Math.pow(10, this.LENGTH - 1);
      const otp = crypto.randomInt(0, number).toString().padStart(6, "0");
      const time = await this.cache.get(`otp-created-at:${email}`) as string|null

      if(time && typeof time === 'string'){
        const cur = new Date()
        const cacheTime = new Date(time)
        if(cur.getTime() - cacheTime.getTime() < 30*1000){
            throw new AppError("TIME","Thao tác quá nhà vui lòng thử lại",400)
        }
      }

      if(await this.cache.get(`otp:${email}`)){
        await this.cache.delete(`otp:${email}`)
        await this.cache.delete(`otp-retry:${email}`)
        await this.cache.delete(`otp-created-at:${email}`)
      }

      await this.cache.set(`otp-retry:${email}`, 0);
      await this.cache.set(`otp-created-at:${email}`,new Date().toString())
      await this.cache.set(`otp:${email}`, otp, 300);
      return otp
  }

  public async verify(email: string, otp: string) {
    const otpcache = await this.cache.get(`otp:${email}`);
    const otpRetry = (await this.cache.get(`otp-retry:${email}`)) as number;

    if(!otpcache){
      throw new AppError("","Hết hạn",500)
    }

    if (otpRetry >= this.OTP_RETRY_TIME) {
      await this.cache.delete(`otp:${email}`);
      await this.cache.delete(`otp-retry:${email}`);
            throw new AppError("","Thử quá nhiều lần",500)
    }

    if (otpcache !== otp) {
      await this.cache.set(`otp-retry:${email}`, otpRetry + 1);
           throw new AppError("","Lỗi khống đúng otp",500)
    }

    await this.cache.delete(`otp:${email}`);
    await this.cache.delete(`otp-retry:${email}`);
  }
}