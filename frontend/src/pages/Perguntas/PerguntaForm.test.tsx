import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerguntaForm } from "./PerguntaForm";
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
    useParams: () => ({ quizId: "1" }),
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

describe("PerguntaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockGet.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("deve renderizar o formulário", () => {
    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    expect(
      screen.getByPlaceholderText("Texto da Pergunta"),
    ).toBeInTheDocument();
  });

  it("deve carregar categorias no select", async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: 1, nome: "Categoria Teste" }],
    });

    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Categoria Teste")).toBeInTheDocument();
  });

  it("deve atualizar o campo de pergunta", async () => {
    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText("Texto da Pergunta");

    await userEvent.type(textarea, "Minha pergunta");

    expect(textarea).toHaveValue("Minha pergunta");
  });

  it("deve marcar alternativa como correta", () => {
    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    const radios = screen.getAllByRole("radio");

    fireEvent.click(radios[2]);

    expect(radios[2]).toBeChecked();
  });

  it("deve enviar dados corretamente ao criar pergunta", async () => {
    mockPost.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText("Texto da Pergunta"),
      "Pergunta teste",
    );

    const inputs = screen.getAllByPlaceholderText("Texto da Alternativa");

    for (let i = 0; i < inputs.length; i++) {
      await userEvent.type(inputs[i], `Alt ${i + 1}`);
    }

    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/perguntas",
        expect.objectContaining({
          enunciado: "Pergunta teste",
          quizId: 1,
        }),
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/quizzes/1/perguntas");
  });

  it("não deve enviar se faltar dados", async () => {
    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  it("deve carregar pergunta e atualizar via PUT", async () => {
    mockSearchParams = new URLSearchParams("id=1");

    mockGet.mockImplementation((url: string) => {
      if (url === "/categorias") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/perguntas/1") {
        return Promise.resolve({
          data: {
            pergunta: "Pergunta existente",
            categoriaId: 1,
            dificuldade: "facil",
            ativo: true,
            alternativas: [
              { texto: "A", correta: true },
              { texto: "B", correta: false },
              { texto: "C", correta: false },
              { texto: "D", correta: false },
            ],
          },
        });
      }

      return Promise.resolve({ data: [] });
    });

    mockPut.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    expect(
      await screen.findByDisplayValue("Pergunta existente"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/perguntas/1", expect.any(Object));
    });
  });

  it("deve navegar ao clicar em voltar", () => {
    render(
      <MemoryRouter>
        <PerguntaForm />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/quizzes/1/perguntas");
  });
});
