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
    getQuizzes,
    createQuiz,
    toggleQuizStatus,
} from "../src/controllers/quizzesController";

function mockReq(data: any = {}) {
    return {
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

describe("Quiz Controller", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve retornar lista de quizzes", async () => {
        mocks.query.mockResolvedValueOnce([{ id: 1, titulo: "Quiz" }]);

        const req = mockReq();
        const res = mockRes();

        await getQuizzes(req, res);

        expect(res.json).toHaveBeenCalled();
    });

    it("deve criar quiz com sucesso", async () => {
        mocks.query
            .mockResolvedValueOnce({ insertId: 1 })
            .mockResolvedValueOnce([{ id: 1, titulo: "Novo Quiz" }]);

        const req = mockReq({
            body: { nome: "Novo Quiz" },
        });

        const res = mockRes();

        await createQuiz(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("deve retornar erro se nome vazio", async () => {
        const req = mockReq({ body: { nome: "" } });
        const res = mockRes();

        await createQuiz(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("deve alternar status do quiz", async () => {
        mocks.query
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce([{ id: 1, ativo: false }]);

        const req = mockReq({ params: { id: "1" } });
        const res = mockRes();

        await toggleQuizStatus(req, res);

        expect(res.json).toHaveBeenCalled();
    });
});