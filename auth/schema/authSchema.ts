import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email obrigatorio.",
    })
    .email(),
  password: z.string().min(6, {
    message: "Senha deve ter 6 cacacteres ou mais.",
  }),
  name: z.string().optional(),
});

export type TAuthSchema = z.infer<typeof authSchema>;
