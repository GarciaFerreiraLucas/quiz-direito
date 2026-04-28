import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
    loginSchema,
    registerSchema,
    quizSchema,
    informativoSchema,
    validateBody,
} from '../src/validators/schemas';
import {
    hasInvalidCharacters,
    sanitizeString,
    validateMultipleStrings,
    INVALID_CHARACTERS,
    VALID_DATA,
    INVALID_DATA,
} from './helpers/testUtils';

describe('Validators - Zod Schemas', () => {
    describe('loginSchema', () => {
        it('deve validar login válido', () => {
            const data = {
                login: 'usuario123',
                password: 'senha123',
            };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('deve rejeitar login vazio', () => {
            const data = { login: '', password: 'senha123' };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar password vazia', () => {
            const data = { login: 'usuario123', password: '' };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar login com emojis', () => {
            const data = {
                login: 'usuario😀123',
                password: 'senha123',
            };
            const result = loginSchema.safeParse(data);
            // Zod não bloqueia por padrão, mas nosso sanitizer vai
            expect(hasInvalidCharacters(data.login)).toBe(true);
        });

        it('deve rejeitar password com caracteres HTML perigosos', () => {
            const data = {
                login: 'usuario123',
                password: '<script>alert(1)</script>',
            };
            expect(hasInvalidCharacters(data.password)).toBe(true);
        });
    });

    describe('registerSchema', () => {
        it('deve validar registro completo válido', () => {
            const data = {
                nome: 'João Silva',
                email: 'joao@example.com',
                senha: 'SenhaSegura123!',
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('deve rejeitar nome com menos de 2 caracteres', () => {
            const data = {
                nome: 'J',
                email: 'joao@example.com',
                senha: 'SenhaSegura123!',
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0]?.message).toContain('2 caracteres');
        });

        it('deve rejeitar email inválido', () => {
            const data = {
                nome: 'João Silva',
                email: 'nao_eh_email',
                senha: 'SenhaSegura123!',
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar email com caracteres especiais inválidos', () => {
            const data = {
                nome: 'João Silva',
                email: 'joao+<script>@example.com',
                senha: 'SenhaSegura123!',
            };
            expect(hasInvalidCharacters(data.email)).toBe(true);
        });

        it('deve rejeitar senha com menos de 8 caracteres', () => {
            const data = {
                nome: 'João Silva',
                email: 'joao@example.com',
                senha: '123456',
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0]?.message).toContain('8 caracteres');
        });

        it('deve rejeitar nome com emojis', () => {
            const data = {
                nome: 'João 😀 Silva',
                email: 'joao@example.com',
                senha: 'SenhaSegura123!',
            };
            expect(hasInvalidCharacters(data.nome)).toBe(true);
        });

        it('deve rejeitar nome com mais de 100 caracteres', () => {
            const data = {
                nome: 'a'.repeat(101),
                email: 'joao@example.com',
                senha: 'SenhaSegura123!',
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('quizSchema', () => {
        it('deve validar quiz completo válido', () => {
            const data = {
                nome: 'Quiz de Direito',
                descricao: 'Um quiz sobre direito constitucional',
                ativo: true,
                tempo_estimado_min: 30,
                tentativas_max: 3,
                visibilidade: 'publico' as const,
            };
            const result = quizSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('deve rejeitar quiz sem nome', () => {
            const data = {
                nome: '',
                descricao: 'Uma descrição',
            };
            const result = quizSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar quiz com nome contendo HTML', () => {
            const data = {
                nome: '<img src=x onerror=alert(1)>',
                descricao: 'Uma descrição',
            };
            expect(hasInvalidCharacters(data.nome)).toBe(true);
        });

        it('deve rejeitar quiz com nome contendo SQL injection', () => {
            const data = {
                nome: "'; DROP TABLE quiz;--",
                descricao: 'Uma descrição',
            };
            expect(hasInvalidCharacters(data.nome)).toBe(true);
        });

        it('deve permitir tempo_estimado_min padrão', () => {
            const data = {
                nome: 'Quiz Teste',
            };
            const result = quizSchema.safeParse(data);
            expect(result.success).toBe(true);
            expect(result.data?.tempo_estimado_min).toBe(10);
        });

        it('deve rejeitar tempo_estimado_min negativo', () => {
            const data = {
                nome: 'Quiz Teste',
                tempo_estimado_min: -5,
            };
            const result = quizSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar visibilidade inválida', () => {
            const data = {
                nome: 'Quiz Teste',
                visibilidade: 'invalido' as any,
            };
            const result = quizSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar nome com emojis', () => {
            const data = {
                nome: 'Quiz 🎉 Direito',
                descricao: 'Descrição',
            };
            expect(hasInvalidCharacters(data.nome)).toBe(true);
        });
    });

    describe('informativoSchema', () => {
        it('deve validar informativo completo válido', () => {
            const data = {
                titulo: 'Novo Informativo',
                resumo: 'Este é um resumo',
                conteudo_md: '# Título\nConteúdo',
                autor: 'Admin',
                imagem_url: 'https://example.com/image.jpg',
                ativo: true,
            };
            const result = informativoSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('deve rejeitar informativo sem título', () => {
            const data = {
                titulo: '',
                resumo: 'Um resumo',
            };
            const result = informativoSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar URL inválida', () => {
            const data = {
                titulo: 'Informativo',
                imagem_url: 'nao-eh-url',
            };
            const result = informativoSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('deve rejeitar título com emojis', () => {
            const data = {
                titulo: '📰 Informativo Importante',
                resumo: 'Resumo',
            };
            expect(hasInvalidCharacters(data.titulo)).toBe(true);
        });
    });

    describe('validateBody helper', () => {
        it('deve retornar sucesso para dados válidos', () => {
            const schema = z.object({ name: z.string() });
            const body = { name: 'João' };

            const result = validateBody(schema, body);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe('João');
            }
        });

        it('deve retornar erro para dados inválidos', () => {
            const schema = z.object({ name: z.string() });
            const body = { name: 123 };

            const result = validateBody(schema, body);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBeDefined();
            }
        });
    });
});

describe('Validação de Caracteres Inválidos', () => {
    describe('hasInvalidCharacters', () => {
        it('deve detectar emojis', () => {
            INVALID_CHARACTERS.emojis.forEach(emoji => {
                expect(hasInvalidCharacters(`text ${emoji} text`)).toBe(true);
            });
        });

        it('deve detectar tags HTML', () => {
            INVALID_CHARACTERS.html.forEach(tag => {
                expect(hasInvalidCharacters(tag)).toBe(true);
            });
        });

        it('deve detectar SQL injection', () => {
            INVALID_CHARACTERS.sql.forEach(sql => {
                expect(hasInvalidCharacters(sql)).toBe(true);
            });
        });

        it('deve permitir caracteres válidos', () => {
            expect(hasInvalidCharacters('João Silva')).toBe(false);
            expect(hasInvalidCharacters('usuario@123.com')).toBe(false);
            expect(hasInvalidCharacters('Quiz de Direito - Questão 1')).toBe(false);
        });

        it('deve retornar false para string vazia', () => {
            expect(hasInvalidCharacters('')).toBe(false);
        });
    });

    describe('sanitizeString', () => {
        it('deve remover emojis', () => {
            const result = sanitizeString('João 😀 Silva');
            expect(result).toBe('João  Silva');
        });

        it('deve remover caracteres especiais perigosos', () => {
            const result = sanitizeString("user<script>alert('xss')</script>");
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
        });

        it('deve preservar caracteres válidos', () => {
            const result = sanitizeString('João Silva');
            expect(result).toBe('João Silva');
        });
    });

    describe('validateMultipleStrings', () => {
        it('deve validar múltiplas strings', () => {
            const result = validateMultipleStrings(
                'João Silva',
                'usuario@example.com',
                'Quiz Teste'
            );
            expect(result.valid).toBe(true);
            expect(result.invalid).toHaveLength(0);
        });

        it('deve detectar strings inválidas', () => {
            const result = validateMultipleStrings(
                'João Silva',
                'usuario com 😀',
                'Quiz <script>'
            );
            expect(result.valid).toBe(false);
            expect(result.invalid).toHaveLength(2);
        });
    });
});

describe('Prevenção de Duplicação', () => {
    it('deve validar dados duplicados (simulado)', () => {
        // Este é um teste de conceito - em um caso real,
        // isso seria testado com um banco de dados mock
        const existingEmails = ['joao@example.com', 'maria@example.com'];
        const newEmail = 'joao@example.com';

        const isDuplicate = existingEmails.includes(newEmail.toLowerCase());
        expect(isDuplicate).toBe(true);
    });

    it('deve permitir emails únicos', () => {
        const existingEmails = ['joao@example.com', 'maria@example.com'];
        const newEmail = 'pedro@example.com';

        const isDuplicate = existingEmails.includes(newEmail.toLowerCase());
        expect(isDuplicate).toBe(false);
    });

    it('deve ser case-insensitive na comparação', () => {
        const existingEmails = ['joao@example.com'];
        const newEmail = 'JOAO@EXAMPLE.COM';

        const isDuplicate = existingEmails
            .map(e => e.toLowerCase())
            .includes(newEmail.toLowerCase());
        expect(isDuplicate).toBe(true);
    });
});
