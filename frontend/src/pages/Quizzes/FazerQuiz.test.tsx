import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FazerQuiz } from "./FazerQuiz";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
const mockPost = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ quizId: "1" }),
  };
});

vi.mock("../../services/api", () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

describe("FazerQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("deve exibir loading ao iniciar", () => {
    mockPost.mockResolvedValueOnce({
      data: {
        quiz: { id: 1, titulo: "Quiz Teste", tempoEstimadoMin: 10 },
        tentativaId: 1,
        perguntas: [],
      },
    });

    render(
      <MemoryRouter>
        <FazerQuiz />
      </MemoryRouter>,
    );

    expect(screen.getByText("Carregando quiz...")).toBeInTheDocument();
  });

  it("deve carregar perguntas corretamente", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        quiz: { id: 1, titulo: "Quiz Teste", tempoEstimadoMin: 10 },
        tentativaId: 1,
        perguntas: [
          {
            id: 1,
            enunciado: "Pergunta 1?",
            dificuldade: "Fácil",
            alternativas: [
              { id: 10, texto: "A", ordem: 1 },
              { id: 11, texto: "B", ordem: 2 },
            ],
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <FazerQuiz />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Pergunta 1?")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("deve selecionar uma alternativa", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        quiz: { id: 1, titulo: "Quiz Teste", tempoEstimadoMin: 10 },
        tentativaId: 1,
        perguntas: [
          {
            id: 1,
            enunciado: "Pergunta?",
            dificuldade: "Médio",
            alternativas: [{ id: 1, texto: "Opção 1", ordem: 1 }],
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <FazerQuiz />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByText("Opção 1"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/tentativas/1/responder",
        expect.objectContaining({
          perguntaId: 1,
          alternativaId: 1,
        }),
      );
    });
  });

  it("deve ir para próxima pergunta", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        quiz: { id: 1, titulo: "Quiz Teste", tempoEstimadoMin: 10 },
        tentativaId: 1,
        perguntas: [
          {
            id: 1,
            enunciado: "Pergunta 1?",
            dificuldade: "Fácil",
            alternativas: [{ id: 1, texto: "A", ordem: 1 }],
          },
          {
            id: 2,
            enunciado: "Pergunta 2?",
            dificuldade: "Médio",
            alternativas: [{ id: 2, texto: "B", ordem: 1 }],
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <FazerQuiz />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Pergunta 1?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(await screen.findByText("Pergunta 2?")).toBeInTheDocument();
  });

  it("deve finalizar quiz e mostrar resultado", async () => {
    mockPost
      .mockResolvedValueOnce({
        data: {
          quiz: { id: 1, titulo: "Quiz Teste", tempoEstimadoMin: 10 },
          tentativaId: 1,
          perguntas: [
            {
              id: 1,
              enunciado: "Pergunta?",
              dificuldade: "Fácil",
              alternativas: [{ id: 1, texto: "A", ordem: 1 }],
            },
          ],
        },
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        data: {
          pontuacao: 100,
          acertos: 1,
          erros: 0,
          totalPerguntas: 1,
          duracaoSegundos: 10,
          detalhes: [
            {
              perguntaId: 1,
              enunciado: "Pergunta?",
              alternativaEscolhida: "A",
              alternativaCorreta: "A",
              acertou: true,
            },
          ],
        },
      });

    render(
      <MemoryRouter>
        <FazerQuiz />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Pergunta?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar Quiz" }));

    expect(await screen.findByText("Resultado")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("deve mostrar erro se API falhar", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { error: "Erro ao iniciar" } },
    });

    render(
      <MemoryRouter>
        <FazerQuiz />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Erro ao iniciar/i)).toBeInTheDocument();
  });
});
