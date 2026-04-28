import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Perguntas } from "./Perguntas";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
const mockGet = vi.fn();
const mockPatch = vi.fn();

let mockQuizId = "1";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ quizId: mockQuizId }),
  };
});

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
  },
}));

vi.mock("../../components/Pagination", () => ({
  TablePagination: ({ currentPage }: any) => (
    <div data-testid="pagination">Página {currentPage}</div>
  ),
}));

describe("Perguntas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuizId = "1";
    mockGet.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("deve redirecionar se quizId for inválido", async () => {
    mockQuizId = "abc";

    render(
      <MemoryRouter>
        <Perguntas />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/quizzes");
    });
  });

  it("deve carregar perguntas da API", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          pergunta: "Pergunta 1",
          categoria: "Categoria 1",
          dificuldade: "Fácil",
          ativo: true,
        },
      ],
    });

    render(
      <MemoryRouter>
        <Perguntas />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Pergunta 1")).toBeInTheDocument();
    expect(screen.getByText("Categoria 1")).toBeInTheDocument();
    expect(screen.getByText("Fácil")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("deve navegar ao clicar em adicionar", async () => {
    render(
      <MemoryRouter>
        <Perguntas />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /Adicionar/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/quizzes/1/perguntas/adicionar",
    );
  });

  it("deve navegar para edição", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          pergunta: "Pergunta",
          categoria: "Cat",
          dificuldade: "Fácil",
          ativo: true,
        },
      ],
    });

    render(
      <MemoryRouter>
        <Perguntas />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Pergunta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/quizzes/1/perguntas/adicionar?id=1",
    );
  });

  it("deve alterar status da pergunta", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          pergunta: "Pergunta",
          categoria: "Cat",
          dificuldade: "Fácil",
          ativo: true,
        },
      ],
    });

    mockPatch.mockResolvedValueOnce({
      data: { ativo: false },
    });

    render(
      <MemoryRouter>
        <Perguntas />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Pergunta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Inativar" }));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith("/perguntas/1/status");
    });
  });

  it("deve renderizar paginação", async () => {
    render(
      <MemoryRouter>
        <Perguntas />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId("pagination")).toBeInTheDocument();
  });
});
