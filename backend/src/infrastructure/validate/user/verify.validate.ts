import { z } from 'zod';

export const verifySchemaDTO = z.object({
  email:z.email('email không phù hợp'),
    
});


export type verifyDTO = z.infer<typeof verifySchemaDTO>;

export const confirmOtpSchemaDTO = z.object({
  email: z.email('Email không hợp lệ'),
  otp: z.string().length(6, 'Mã OTP phải là 6 chữ số'),
});
export type confirmOtpDTO = z.infer<typeof confirmOtpSchemaDTO>;

export const resetPasswordSchemaDTO = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});
export type resetPasswordDTO = z.infer<typeof resetPasswordSchemaDTO>;
