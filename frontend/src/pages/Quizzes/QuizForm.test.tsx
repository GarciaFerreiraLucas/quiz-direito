import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QuizForm } from "./QuizForm";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

let mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
  },
}));

describe("QuizForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockGet.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("deve renderizar o formulário corretamente", () => {
    render(
      <MemoryRouter>
        <QuizForm />
      </MemoryRouter>,
    );

    expect(screen.getByText("Novo Quiz")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Título do Quiz")).toBeInTheDocument();
  });

  it("deve enviar dados corretamente ao criar quiz", async () => {
    mockPost.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <QuizForm />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText("Título do Quiz"),
      "Meu Quiz",
    );

    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/quizzes",
        expect.objectContaining({
          nome: "Meu Quiz",
        }),
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/quizzes");
  });

  it("deve carregar categorias no select", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 1, nome: "Categoria 1" },
        { id: 2, nome: "Categoria 2" },
      ],
    });

    render(
      <MemoryRouter>
        <QuizForm />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Categoria 1")).toBeInTheDocument();
    expect(screen.getByText("Categoria 2")).toBeInTheDocument();
  });

  it("deve exibir erro ao falhar no envio", async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        data: { error: "Erro da API" },
      },
    });

    render(
      <MemoryRouter>
        <QuizForm />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText("Título do Quiz"),
      "Teste",
    );

    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByText("Erro da API")).toBeInTheDocument();
  });
});
