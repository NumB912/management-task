import { z } from "zod";

const userIdSchema = z.string().min(1, "Không được để trống userId");
const pomodoroIdSchema = z.string().min(1, "Không được để trống pomodoroId");
const taskIdSchema = z.string().min(1, "Không được để trống taskId");

// GetPomodoroUsecase.execute(userId)
export const GetPomodoroSchemaDTO = z.object({
  userId: userIdSchema,
});

// CreatePomodoroUsecase.execute(data: Pick<IPomodoroWithId, "name" | "progress" | "start" | "task">, userId)
export const CreatePomodoroSchemaDTO = z.object({
  userId: userIdSchema,
  data: z.object({
    name: z.string().min(1, "Tên pomodoro không được để trống").max(200, "Tên pomodoro tối đa 200 ký tự"),
    start: z.coerce.date(),
    progress: z.array(
      z.object({
        startPause: z.coerce.date(),
        duration: z.number().int().min(0, "Duration không được âm"),
      }),
    ),
    task: taskIdSchema.optional(),
  }),
});

// UpdatePomodoroUsecase.execute(id, userId, data: Pick<Ipomodoro, "task">)
export const UpdatePomodoroSchemaDTO = z.object({
  id: pomodoroIdSchema,
  userId: userIdSchema,
  data: z
    .object({
      task: z
        .object({
          id: taskIdSchema,
          name: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

// DeletePomodoroUsecase.execute(id, userId)
export const DeletePomodoroSchemaDTO = z.object({
  id: pomodoroIdSchema,
  userId: userIdSchema,
});

export type GetPomodoroDTO = z.infer<typeof GetPomodoroSchemaDTO>;
export type CreatePomodoroDTO = z.infer<typeof CreatePomodoroSchemaDTO>;
export type UpdatePomodoroDTO = z.infer<typeof UpdatePomodoroSchemaDTO>;
export type DeletePomodoroDTO = z.infer<typeof DeletePomodoroSchemaDTO>;
