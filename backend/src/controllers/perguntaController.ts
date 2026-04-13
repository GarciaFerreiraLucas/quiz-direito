import { Request, Response } from "express";

interface Alternativa {
    id: number;
    texto: string;
    feedback: string;
    correta: boolean;
}

interface Pergunta {
    id: number;
    pergunta: string;
    categoria: string;
    dificuldade: "Fácil" | "Média" | "Difícil";
    status: "Ativo" | "Inativo";
    alternativas: Alternativa[];
}

const perguntasFake: Pergunta[] = [
    {
        id: 1,
        pergunta: "O que é controle de constitucionalidade?",
        categoria: "Direito Constitucional",
        dificuldade: "Fácil",
        status: "Ativo",
        alternativas: [
            { id: 1, texto: "É a verificação da compatibilidade de normas com a Constituição", feedback: "Correta", correta: true },
            { id: 2, texto: "É um contrato administrativo", feedback: "Incorreta", correta: false },
            { id: 3, texto: "É uma pena criminal", feedback: "Incorreta", correta: false },
            { id: 4, texto: "É um tributo federal", feedback: "Incorreta", correta: false },
        ],
    },
    {
        id: 2,
        pergunta: "O que caracteriza dolo eventual?",
        categoria: "Direito Penal",
        dificuldade: "Média",
        status: "Ativo",
        alternativas: [
            { id: 1, texto: "Quando o agente prevê o resultado e o aceita", feedback: "Correta", correta: true },
            { id: 2, texto: "Quando não há intenção nem culpa", feedback: "Incorreta", correta: false },
            { id: 3, texto: "Quando há legítima defesa", feedback: "Incorreta", correta: false },
            { id: 4, texto: "Quando a conduta é culposa simples", feedback: "Incorreta", correta: false },
        ],
    },
];

export class PerguntaController {
    static listar(req: Request, res: Response): void {
        res.status(200).json(perguntasFake);
    }

    static buscarPorId(req: Request, res: Response): void {
        const id = Number(req.params.id);

        const pergunta = perguntasFake.find((item) => item.id === id);

        if (!pergunta) {
            res.status(404).json({ message: "Pergunta não encontrada" });
            return;
        }

        res.status(200).json(pergunta);
    }

    static criar(req: Request, res: Response): void {
        const { pergunta, categoria, dificuldade, status, alternativas } = req.body;

        const novaPergunta: Pergunta = {
            id: perguntasFake.length + 1,
            pergunta,
            categoria,
            dificuldade,
            status,
            alternativas: alternativas || [],
        };

        perguntasFake.push(novaPergunta);

        res.status(201).json({
            message: "Pergunta criada com sucesso",
            data: novaPergunta,
        });
    }
}