import { z } from "zod";

const userIdSchema = z.string().min(1, "Không được để trống userId");
const filterIdSchema = z.string().min(1, "Không được để trống filterId");

const specialsSchema = z.enum(["overdue", "today", "next 7 days", "none"]);
const statusSchema = z.enum(["done", "pending", "none", "won't do"]);
const prioritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const filterDataSchema = z.object({
  name: z.string().min(1, "Tên filter không được để trống").max(100, "Tên filter tối đa 100 ký tự"),
  tags: z.array(z.string().min(1, "Tên tag không được để trống")),
  description: z.string().optional(),
  priority: prioritySchema,
  start_date: z.coerce.date().nullable(),
  end_date: z.coerce.date().nullable(),
  specials: specialsSchema,
  status: statusSchema,
});

// GetAllFiltersUsecase.execute(user_id)
export const GetAllFilterSchemaDTO = z.object({
  user_id: userIdSchema,
});

// CreateFilterUsecase.execute({ data, user_id })
export const CreateFilterSchemaDTO = z.object({
  data: filterDataSchema,
  user_id: userIdSchema,
});

// GetFilterByIdUsecase.execute({ id, userId })
export const GetFilterByIdSchemaDTO = z.object({
  id: filterIdSchema,
  userId: userIdSchema,
});

// UpdateFilterUsecase.execute({ id, data, user_id })
export const UpdateFilterSchemaDTO = z.object({
  id: filterIdSchema,
  data: filterDataSchema.partial().optional(),
  user_id: userIdSchema,
});

// DeleteFilterUsecase.execute(id)
export const DeleteFilterSchemaDTO = z.object({
  id: filterIdSchema,
});

export type GetAllFilterDTO = z.infer<typeof GetAllFilterSchemaDTO>;
export type CreateFilterDTO = z.infer<typeof CreateFilterSchemaDTO>;
export type GetFilterByIdDTO = z.infer<typeof GetFilterByIdSchemaDTO>;
export type UpdateFilterDTO = z.infer<typeof UpdateFilterSchemaDTO>;
export type DeleteFilterDTO = z.infer<typeof DeleteFilterSchemaDTO>;
