import { Request, Response } from "express";

interface Quiz {
    id: number;
    titulo: string;
    tag: string;
    status: "Ativo" | "Inativo";
}

const quizzesFake: Quiz[] = [
    { id: 1, titulo: "Quiz de Direito Penal", tag: "Penal", status: "Ativo" },
    { id: 2, titulo: "Quiz de Direito Civil", tag: "Civil", status: "Ativo" },
    { id: 3, titulo: "Quiz de Direito Constitucional", tag: "Constitucional", status: "Inativo" },
];

export class QuizController {
    static listar(req: Request, res: Response): void {
        res.status(200).json(quizzesFake);
    }

    static buscarPorId(req: Request, res: Response): void {
        const id = Number(req.params.id);

        const quiz = quizzesFake.find((item) => item.id === id);

        if (!quiz) {
            res.status(404).json({ message: "Quiz não encontrado" });
            return;
        }

        res.status(200).json(quiz);
    }

    static criar(req: Request, res: Response): void {
        const { titulo, tag, status } = req.body;

        const novoQuiz: Quiz = {
            id: quizzesFake.length + 1,
            titulo,
            tag,
            status,
        };

        quizzesFake.push(novoQuiz);

        res.status(201).json({
            message: "Quiz criado com sucesso",
            data: novoQuiz,
        });
    }
}