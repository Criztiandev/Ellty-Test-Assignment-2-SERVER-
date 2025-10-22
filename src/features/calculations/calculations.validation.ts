import { z } from 'zod';

export const createStartingNumberSchema = z.object({
  number: z
    .number({
      message: 'Number must be a valid number',
    })
    .min(-1_000_000, { message: 'Number must be greater than or equal to -1,000,000' })
    .max(1_000_000, { message: 'Number must be less than or equal to 1,000,000' }),
});

export const addOperationSchema = z.object({
  operation: z.enum(['+', '-', '*', '/'], {
    message: 'Operation must be one of: +, -, *, /',
  }),
  number: z
    .number({
      message: 'Number must be a valid number',
    })
    .min(-1_000_000, { message: 'Number must be greater than or equal to -1,000,000' })
    .max(1_000_000, { message: 'Number must be less than or equal to 1,000,000' }),
});

export type CreateStartingNumberInput = z.infer<typeof createStartingNumberSchema>;
export type AddOperationInput = z.infer<typeof addOperationSchema>;
