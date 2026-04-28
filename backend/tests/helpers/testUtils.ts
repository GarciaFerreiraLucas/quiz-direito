/**
 * Utilitários para testes - validação de dados e helpers
 */

// Caracteres inválidos comuns
export const INVALID_CHARACTERS = {
    emojis: ['😀', '🎉', '❤️', '🚀', '👨‍👩‍👧‍👦'],
    html: ['<script>', '</script>', '<img src=x onerror=alert(1)>', '<iframe>'],
    sql: ["'; DROP TABLE users;--", "1' OR '1'='1", "admin'--"],
    special: ['<', '>', '"', "'", '&', ';', '|', '`', '$', '{', '}'],
};

// Dados válidos de exemplo
export const VALID_DATA = {
    nome: 'João Silva',
    email: 'joao@example.com',
    login: 'joao_silva',
    password: 'SenhaSegura123!',
    titulo: 'Quiz de Direito',
    descricao: 'Descrição válida do quiz',
};

// Dados inválidos para testes
export const INVALID_DATA = {
    emptyString: '',
    onlySpaces: '   ',
    tooShort: 'ab',
    tooLong: 'a'.repeat(300),
    invalidEmail: 'nao_eh_email',
    weakPassword: '123456',
    negativeNumber: -5,
    notAnEmail: 'usuario@',
};

/**
 * Verifica se uma string contém caracteres inválidos (emojis, HTML, SQL injection, etc)
 */
export function hasInvalidCharacters(str: string): boolean {
    if (!str) return false;

    // Verifica emojis
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff])/g;
    if (emojiRegex.test(str)) return true;

    // Verifica caracteres especiais perigosos
    const dangerousRegex = /[<>'"&;|`${}\\]/g;
    if (dangerousRegex.test(str)) return true;

    return false;
}

/**
 * Sanitiza uma string removendo caracteres inválidos
 */
export function sanitizeString(str: string): string {
    if (!str) return str;

    // Remove emojis
    let sanitized = str.replace(
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff])/g,
        ''
    );

    // Remove caracteres especiais perigosos
    sanitized = sanitized.replace(/[<>'"&;|`${}\\]/g, '');

    return sanitized;
}

/**
 * Cria um mock para Express Request
 */
export function createMockRequest(overrides = {}): any {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        ...overrides,
    };
}

/**
 * Cria um mock para Express Response
 */
export function createMockResponse(): any {
    const res: any = {
        statusCode: null,
        responseData: null,
        headers: {},
    };

    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };

    res.json = (data: any) => {
        res.responseData = data;
        return res;
    };

    res.send = (data: any) => {
        res.responseData = data;
        return res;
    };

    return res;
}

/**
 * Testa múltiplas strings contra caracteres inválidos
 */
export function validateMultipleStrings(...strings: string[]): { valid: boolean; invalid: string[] } {
    const invalid = strings.filter(str => hasInvalidCharacters(str));
    return {
        valid: invalid.length === 0,
        invalid,
    };
}
