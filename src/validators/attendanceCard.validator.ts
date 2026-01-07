import { z } from "zod";

export const createAttendanceCardSchema = z.object({
  company: z
    .string()
    .min(1, "Empresa é obrigatória")
    .max(100, "Nome da empresa muito longo"),
  eventType: z.enum(["reuniao", "manutencao", "implantacao", "suporte"]),
  description: z.string().max(500, "Descrição muito longa").optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional(),
  totalHours: z
    .number()
    .min(0, "Total de horas não pode ser negativo")
    .optional(),
});

export const updateAttendanceCardSchema = createAttendanceCardSchema.partial();

export type CreateAttendanceCardDTO = z.infer<
  typeof createAttendanceCardSchema
>;
export type UpdateAttendanceCardDTO = z.infer<
  typeof updateAttendanceCardSchema
>;
