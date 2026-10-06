import { z } from 'zod';

export const PutProfileSchema = z.object({
  name:z.string().min(2,"Tên từ 2 ký tự trở lên")
});


export type PutProfileDTO = z.infer<typeof PutProfileSchema>;