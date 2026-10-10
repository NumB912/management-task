import { z } from "zod";

const userIdSchema = z.string().min(1, "Không được để trống userId");
const listIdSchema = z.string().min(1, "Không được để trống listId");
const sectionIdSchema = z.string().min(1, "Không được để trống sectionId");

// GetAllListUsecase.execute({ user_id })
export const GetAllListSchemaDTO = z.object({
  user_id: userIdSchema,
});

// CreateListUsecase.execute({ name, user })
export const CreateListSchemaDTO = z.object({
  name: z.string().min(1, "Tên list không được để trống").max(100, "Tên list tối đa 100 ký tự"),
  user: userIdSchema,
});

// GetAllListSectionUsecase.execute({ user_id })
export const GetAllListSectionSchemaDTO = z.object({
  user_id: userIdSchema,
});

// GetInboxUsecase.execute({ user_id })
export const GetInboxSchemaDTO = z.object({
  user_id: userIdSchema,
});

// GetListByIdUsecase.execute(listId)
export const GetListByIdSchemaDTO = z.object({
  listId: listIdSchema,
});

// UpdateListUsecase.execute({ id, name, userId })
export const UpdateListSchemaDTO = z.object({
  id: listIdSchema,
  name: z.string().min(1, "Tên list không được để trống").max(100, "Tên list tối đa 100 ký tự"),
  userId: userIdSchema,
});

// DeleteListUsecase.execute({ id, userId })
export const DeleteListSchemaDTO = z.object({
  id: listIdSchema,
  userId: userIdSchema,
});

// SortSectionUsecase.execute({ listId, startSectionId, endSectionId, userId })
export const SortSectionSchemaDTO = z.object({
  listId: listIdSchema,
  startSectionId: sectionIdSchema,
  endSectionId: sectionIdSchema,
  userId: userIdSchema,
});

export type GetAllListDTO = z.infer<typeof GetAllListSchemaDTO>;
export type CreateListDTO = z.infer<typeof CreateListSchemaDTO>;
export type GetAllListSectionDTO = z.infer<typeof GetAllListSectionSchemaDTO>;
export type GetInboxDTO = z.infer<typeof GetInboxSchemaDTO>;
export type GetListByIdDTO = z.infer<typeof GetListByIdSchemaDTO>;
export type UpdateListDTO = z.infer<typeof UpdateListSchemaDTO>;
export type DeleteListDTO = z.infer<typeof DeleteListSchemaDTO>;
export type SortSectionDTO = z.infer<typeof SortSectionSchemaDTO>;
