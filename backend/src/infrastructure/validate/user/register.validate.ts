import { z } from "zod";

export const RegisterSchemaDTO = z.object({
  password: z
    .string()
    .min(8, "Tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Cần ít nhất một chữ hoa")
    .regex(/\d/, "Cần ít nhất một chữ số")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
      "Cần ít nhất một ký tự đặc biệt"
    ),

  name: z
    .string()
    .min(2, "Tối thiểu 2 ký tự")
    .regex(
      /^[a-zA-ZÀ-ỹ\s]+$/,
      "Tên không được chứa ký tự đặc biệt hoặc số"
    ),
});
export type registerDTO = z.infer<typeof RegisterSchemaDTO>;