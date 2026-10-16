import { z } from "zod";
import { Types } from "mongoose";

const hexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Màu phải ở định dạng hex, ví dụ #FF0000");

export const colorSchema = z.object({
  color: hexColorSchema,
});

export type IColorInput = z.infer<typeof colorSchema>;