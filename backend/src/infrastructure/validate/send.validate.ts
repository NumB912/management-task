import { z } from 'zod';

export const sendSchemaDTO = z.object({
  email:z.email('email không phù hợp'),
});


export type sendDTO = z.infer<typeof sendSchemaDTO>;