import { z } from "zod";

const userIdSchema = z.string().min(1, "Không được để trống userId");
const listIdSchema = z.string().min(1, "Không được để trống listId");
const sectionIdSchema = z.string().min(1, "Không được để trống sectionId");
const taskIdSchema = z.string().min(1, "Không được để trống taskId");
const ruleIdSchema = z.string().min(1, "Không được để trống ruleId");

const prioritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Màu phải đúng định dạng hex (ví dụ: #F87171)");

const repeatSchema = z.object({
  mode: z.enum(["week", "day", "none", "month", "specificday"]),
  every: z.number().int().positive().optional(),
  dates: z.array(z.number().int().min(1).max(31)).optional(),
  days: z.array(z.number().int().min(0).max(6)).optional(),
  specificDays: z.array(z.coerce.date()).optional(),
});

const createRuleSchema = z.object({
  id: ruleIdSchema,
  priority: prioritySchema.optional(),
  tags: z.array(z.string().min(1, "Tên tag không được để trống")),
  repeat: repeatSchema,
  timer: z.number().int().positive().nullable().optional(),
  endTimer: z.number().int().positive().nullable().optional(),
  start_date: z.coerce.date().nullable().optional(),
  end_date: z.coerce.date().nullable().optional(),
  color: colorSchema.optional(),
});

const updateRuleSchema = createRuleSchema.partial();

// CreateTaskUsecase.execute({ listId, userId, data: ICreateTaskDTO })
export const CreateTaskSchemaDTO = z.object({
  listId: listIdSchema,
  userId: userIdSchema,
  data: z.object({
    id: taskIdSchema,
    name: z.string().min(1, "Tên task không được để trống").max(200, "Tên task tối đa 200 ký tự"),
    section: sectionIdSchema.nullable().optional(),
    rule: createRuleSchema,
  }),
});

// CreateTaskWithSection.execute({ listId, sectionId, userId, data: ICreateTaskDTO })
export const CreateTaskWithSectionSchemaDTO = z.object({
  listId: listIdSchema,
  sectionId: sectionIdSchema,
  userId: userIdSchema,
  data: z.object({
    id: taskIdSchema,
    name: z.string().min(1, "Tên task không được để trống").max(200, "Tên task tối đa 200 ký tự"),
    section: sectionIdSchema.nullable().optional(),
    rule: createRuleSchema,
  }),
});

// UpdateTaskUsecase.execute({ id, data: Partial<Omit<ITask,"id"|"status"|"done_at">>, userId })
export const UpdateTaskSchemaDTO = z.object({
  id: taskIdSchema,
  userId: userIdSchema,
  data: z
    .object({
      name: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      list: listIdSchema.optional(),
      section: sectionIdSchema.nullable().optional(),
      rule: updateRuleSchema.optional(),
    })
    .optional(),
});

// UpdateRuleUsecase.execute(taskId, data: Partial<IRule>, userId)
export const UpdateRuleSchemaDTO = z.object({
  taskId: taskIdSchema,
  userId: userIdSchema,
  data: updateRuleSchema,
});

// UpdateStatusUsecase.execute({ taskId, data: PayloadUpdateStatus, userId })
export const UpdateTaskStatusSchemaDTO = z.object({
  taskId: taskIdSchema,
  userId: userIdSchema,
  data: z.object({
    status: z.enum(["done", "won't do", "pending"]),
    id: taskIdSchema,
    record: z.record(
      z.string(),
      z.object({
        date: z.coerce.date(),
        rule: ruleIdSchema,
      }),
    ),
  }),
});

// DeleteTaskUsecase.execute(id, userId)
export const DeleteTaskSchemaDTO = z.object({
  id: taskIdSchema,
  userId: userIdSchema,
});

// GetAllTasksWithIdsUsecase.execute({ userId, listId, taskIds })
export const GetTasksByIdsSchemaDTO = z.object({
  userId: userIdSchema,
  listId: listIdSchema,
  taskIds: z.array(taskIdSchema).min(1, "Phải có ít nhất 1 taskId"),
});

export type CreateTaskDTO = z.infer<typeof CreateTaskSchemaDTO>;
export type CreateTaskWithSectionDTO = z.infer<typeof CreateTaskWithSectionSchemaDTO>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchemaDTO>;
export type UpdateRuleDTO = z.infer<typeof UpdateRuleSchemaDTO>;
export type UpdateTaskStatusDTO = z.infer<typeof UpdateTaskStatusSchemaDTO>;
export type DeleteTaskDTO = z.infer<typeof DeleteTaskSchemaDTO>;
export type GetTasksByIdsDTO = z.infer<typeof GetTasksByIdsSchemaDTO>;
