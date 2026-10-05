import { z } from 'zod';

export const LoginSchemaDTO = z.object({
  email:z.email('email không phù hợp'),
  password:z.string()
  .min(8, 'Tối thiểu 8 ký tự')
});


export type LoginDTO = z.infer<typeof LoginSchemaDTO>;