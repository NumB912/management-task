import { ArgumentMetadata, BadRequestException, Inject, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";
import { TYPES } from "../types/dependency.type.js";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Dữ liệu không hợp lệ',
        errors: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    return result.data;
  }
}