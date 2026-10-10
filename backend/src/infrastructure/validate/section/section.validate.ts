import { z } from "zod";

const userIdSchema = z.string().min(1, "Không được để trống userId");
const listIdSchema = z.string().min(1, "Không được để trống listId");
const sectionIdSchema = z.string().min(1, "Không được để trống sectionId");
const taskIdSchema = z.string().min(1, "Không được để trống taskId");

// GetSectionByIdUsecase.execute({ sectionId })
export const GetSectionByIdSchemaDTO = z.object({
  sectionId: sectionIdSchema,
});

// UpdateSectionUsecase.execute(id, userId, data: Partial<Omit<ISectionWithId, "id">>)
export const UpdateSectionSchemaDTO = z.object({
  id: sectionIdSchema,
  userId: userIdSchema,
  data: z
    .object({
      name: z.string().min(1, "Tên section không được để trống").max(100, "Tên section tối đa 100 ký tự").optional(),
      list: listIdSchema.optional(),
      tasks: z.array(taskIdSchema).optional(),
      path: z.string().optional(),
      order: z.number().optional(),
    })
    .optional(),
});

// DeleteSectionUsecase.execute({ sectionId, userId })
export const DeleteSectionSchemaDTO = z.object({
  sectionId: sectionIdSchema,
  userId: userIdSchema,
});

// GetAllSectionUsecase.execute(listId, user_id)
export const GetAllSectionSchemaDTO = z.object({
  listId: listIdSchema,
  user_id: userIdSchema,
});

// CreateSectionUsecase.execute({ user_id, list_id, data: Pick<ISectionWithId, "name" | "id"> })
export const CreateSectionSchemaDTO = z.object({
  user_id: userIdSchema,
  list_id: listIdSchema,
  data: z.object({
    id: sectionIdSchema,
    name: z.string().min(1, "Tên section không được để trống").max(100, "Tên section tối đa 100 ký tự"),
  }),
});

export type GetSectionByIdDTO = z.infer<typeof GetSectionByIdSchemaDTO>;
export type UpdateSectionDTO = z.infer<typeof UpdateSectionSchemaDTO>;
export type DeleteSectionDTO = z.infer<typeof DeleteSectionSchemaDTO>;
export type GetAllSectionDTO = z.infer<typeof GetAllSectionSchemaDTO>;
export type CreateSectionDTO = z.infer<typeof CreateSectionSchemaDTO>;
