import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().min(1, 'Login é obrigatório.').max(255),
  password: z.string().min(1, 'Senha é obrigatória.').max(255),
});

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').max(100),
  email: z.string().email('E-mail inválido.').max(255),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.').max(255),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório.'),
  password: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

export const quizSchema = z.object({
  nome: z.string().min(1, 'Título é obrigatório.').max(255),
  descricao: z.string().max(1000).optional().default(''),
  ativo: z.boolean().optional().default(true),
  id_categoria: z.number().int().positive().nullable().optional(),
  tempo_estimado_min: z.number().int().min(1).optional().default(10),
  tentativas_max: z.number().int().min(1).optional().default(3),
  visibilidade: z.enum(['publico', 'privado']).optional().default('publico'),
  feedback_ativo: z.boolean().optional().default(true),
});

export const informativoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório.').max(255),
  resumo: z.string().max(500).optional().default(''),
  conteudo_md: z.string().optional().default(''),
  autor: z.string().max(100).optional().default(''),
  imagem_url: z.string().url().nullable().optional(),
  ativo: z.boolean().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
});

/**
 * Helper to validate request body with a Zod schema.
 * Returns { success: true, data } or { success: false, error: string }.
 */
export function validateBody<T>(schema: z.ZodType<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: firstIssue?.message || 'Dados inválidos.' };
}
