import { z } from "zod";

const userIdSchema = z.string().min(1, "Không được để trống userId");
const tagIdSchema = z.string().min(1, "Không được để trống tagId");
const tagNameSchema = z
  .string()
  .min(1, "Tên tag không được để trống")
  .max(50, "Tên tag tối đa 50 ký tự");

// CreateTagUsecase.execute({ name, id, userId })
export const CreateTagSchemaDTO = z.object({
  name: tagNameSchema,
  id: tagIdSchema,
  userId: userIdSchema,
});

// UpdateTagOnlyMeUsecase.execute({ id, name, userId })
export const UpdateTagOnlyMeSchemaDTO = z.object({
  id: tagIdSchema,
  name: tagNameSchema,
  userId: userIdSchema,
});

// DeleteTagOnlyMeUsecase.execute({ id, userId, isShare? })
export const DeleteTagOnlyMeSchemaDTO = z.object({
  id: tagIdSchema,
  userId: userIdSchema,
  isShare: z.boolean().optional(),
});

// UpdateTagUsecase.execute({ id, name, userId })
export const UpdateTagWithShareSchemaDTO = z.object({
  id: tagIdSchema,
  name: tagNameSchema,
  userId: userIdSchema,
});

// DeleteTagWithShareUsecase.execute({ id, userId })
export const DeleteTagWithShareSchemaDTO = z.object({
  id: tagIdSchema,
  userId: userIdSchema,
});

export type CreateTagDTO = z.infer<typeof CreateTagSchemaDTO>;
export type UpdateTagOnlyMeDTO = z.infer<typeof UpdateTagOnlyMeSchemaDTO>;
export type DeleteTagOnlyMeDTO = z.infer<typeof DeleteTagOnlyMeSchemaDTO>;
export type UpdateTagWithShareDTO = z.infer<typeof UpdateTagWithShareSchemaDTO>;
export type DeleteTagWithShareDTO = z.infer<typeof DeleteTagWithShareSchemaDTO>;
