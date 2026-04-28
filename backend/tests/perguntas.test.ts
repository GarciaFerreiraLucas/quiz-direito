import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    release: vi.fn(),
}));

vi.mock("../src/database/connection", () => ({
    default: {
        getConnection: vi.fn().mockResolvedValue({
            query: mocks.query,
            release: mocks.release,
        }),
    },
}));

import {
    getPerguntas,
    createPergunta,
    togglePerguntaStatus,
} from "../src/controllers/perguntasController";

function mockReq(data: any = {}) {
    return {
        query: {},
        params: {},
        body: {},
        ...data,
    } as any;
}

function mockRes() {
    return {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
    } as any;
}

describe("Perguntas Controller", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve retornar lista de perguntas", async () => {
        mocks.query
            .mockResolvedValueOnce([
                {
                    id_pergunta: 1,
                    enunciado: "Pergunta?",
                    categoria: "Cat",
                    dificuldade: "facil",
                    status: 1,
                },
            ])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const req = mockReq({ query: { quizId: "1" } });
        const res = mockRes();

        await getPerguntas(req, res);

        expect(res.json).toHaveBeenCalled();
    });

    it("deve criar pergunta com sucesso", async () => {
        mocks.query
            .mockResolvedValueOnce({ insertId: 10 })
            .mockResolvedValue({});

        const req = mockReq({
            body: {
                enunciado: "Pergunta teste",
                alternativas: [
                    { texto: "A", correta: true },
                    { texto: "B", correta: false },
                ],
                quizId: 1,
            },
        });

        const res = mockRes();

        await createPergunta(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ id: 10 })
        );
    });

    it("deve retornar erro se faltar alternativas", async () => {
        const req = mockReq({
            body: { enunciado: "Teste", alternativas: [] },
        });

        const res = mockRes();

        await createPergunta(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("deve alternar status da pergunta", async () => {
        mocks.query
            .mockResolvedValueOnce([{ id_pergunta: 1, status: 1 }])
            .mockResolvedValueOnce({});

        const req = mockReq({ params: { id: "1" } });
        const res = mockRes();

        await togglePerguntaStatus(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ativo: false })
        );
    });
});