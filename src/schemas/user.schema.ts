import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, { error: "Ім'я має містити мінімум 2 символи" }),
  email: z.email({ error: 'Невірний формат email' }),
  age: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int({ error: 'Вік має бути цілим числом' }).min(18, { error: 'Вік має бути не менше 18' }).optional()
  ),
  phone: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().regex(/^\+380\d{9}$/, { error: 'Формат телефону: +380XXXXXXXXX' }).optional()
  ),
});

export type UserFormInput = z.input<typeof userSchema>;
export type UserFormData = z.output<typeof userSchema>;