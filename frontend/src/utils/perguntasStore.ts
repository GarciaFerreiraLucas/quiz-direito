export type Alternativa = {
  texto: string;
  feedback: string;
  correta: boolean;
};

export type PerguntaItem = {
  id: number;
  quizId: number;
  pergunta: string;
  categoria: string;
  dificuldade: 'Fácil' | 'Moderada' | 'Difícil';
  ativo: boolean;
  alternativas: Alternativa[];
};

type SavePerguntaInput = {
  pergunta: string;
  categoria: string;
  dificuldade: 'Fácil' | 'Moderada' | 'Difícil';
  ativo: boolean;
  alternativas: Alternativa[];
};

function storageKey(quizId: number): string {
  return `quiz-direito-perguntas-${quizId}`;
}

function defaultAlternativas(): Alternativa[] {
  return [
    { texto: 'Alternativa A', feedback: '', correta: true },
    { texto: 'Alternativa B', feedback: '', correta: false },
    { texto: 'Alternativa C', feedback: '', correta: false },
    { texto: 'Alternativa D', feedback: '', correta: false },
  ];
}

function buildDefaultPerguntas(quizId: number): PerguntaItem[] {
  return Array.from({ length: 8 }, (_, index) => {
    const ordem = index + 1;

    let dificuldade: 'Fácil' | 'Moderada' | 'Difícil' = 'Fácil';
    if (ordem >= 4 && ordem <= 6) dificuldade = 'Moderada';
    if (ordem >= 7) dificuldade = 'Difícil';

    return {
      id: ordem,
      quizId,
      pergunta: `Descrição Pergunta ${ordem}`,
      categoria: `Categoria ${ordem}`,
      dificuldade,
      ativo: ordem < 8,
      alternativas: defaultAlternativas(),
    };
  });
}

function isAlternativa(val: unknown): val is Alternativa {
  if (typeof val !== 'object' || val === null) return false;
  const obj = val as Record<string, unknown>;
  return typeof obj.texto === 'string' && typeof obj.feedback === 'string' && typeof obj.correta === 'boolean';
}

function parsePerguntas(raw: string | null): PerguntaItem[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const valid = parsed
      .map((item) => {
        if (typeof item !== 'object' || item === null) return null;

        const obj = item as Record<string, unknown>;
        if (
          typeof obj.id !== 'number' ||
          typeof obj.quizId !== 'number' ||
          typeof obj.pergunta !== 'string' ||
          typeof obj.categoria !== 'string' ||
          (obj.dificuldade !== 'Fácil' && obj.dificuldade !== 'Moderada' && obj.dificuldade !== 'Difícil') ||
          typeof obj.ativo !== 'boolean' ||
          !Array.isArray(obj.alternativas)
        ) {
          return null;
        }

        const alternativas = obj.alternativas.filter(isAlternativa);
        if (alternativas.length !== 4) return null;

        return {
          id: obj.id,
          quizId: obj.quizId,
          pergunta: obj.pergunta,
          categoria: obj.categoria,
          dificuldade: obj.dificuldade,
          ativo: obj.ativo,
          alternativas,
        } as PerguntaItem;
      })
      .filter((item): item is PerguntaItem => item !== null);

    return valid;
  } catch {
    return null;
  }
}

function persistPerguntas(quizId: number, items: PerguntaItem[]): void {
  localStorage.setItem(storageKey(quizId), JSON.stringify(items));
}

export function getPerguntas(quizId: number): PerguntaItem[] {
  if (!Number.isFinite(quizId) || quizId <= 0) return [];

  if (typeof window === 'undefined') {
    return buildDefaultPerguntas(quizId);
  }

  const parsed = parsePerguntas(localStorage.getItem(storageKey(quizId)));
  if (parsed && parsed.length > 0) return parsed;

  const defaults = buildDefaultPerguntas(quizId);
  persistPerguntas(quizId, defaults);
  return defaults;
}

export function getPerguntaById(quizId: number, perguntaId: number): PerguntaItem | null {
  return getPerguntas(quizId).find((item) => item.id === perguntaId) ?? null;
}

export function togglePerguntaStatus(quizId: number, perguntaId: number): PerguntaItem[] {
  const updated = getPerguntas(quizId).map((item) =>
    item.id === perguntaId
      ? {
          ...item,
          ativo: !item.ativo,
        }
      : item,
  );

  persistPerguntas(quizId, updated);
  return updated;
}

export function savePergunta(quizId: number, input: SavePerguntaInput, editingId?: number): PerguntaItem {
  const base = getPerguntas(quizId);

  const pergunta = input.pergunta.trim();
  const categoria = input.categoria.trim();
  const alternativas = input.alternativas.map((alt) => ({
    texto: alt.texto.trim(),
    feedback: alt.feedback.trim(),
    correta: alt.correta,
  }));

  if (editingId) {
    const updated = base.map((item) =>
      item.id === editingId
        ? {
            ...item,
            pergunta,
            categoria,
            dificuldade: input.dificuldade,
            ativo: input.ativo,
            alternativas,
          }
        : item,
    );

    persistPerguntas(quizId, updated);
    return updated.find((item) => item.id === editingId) ?? updated[0];
  }

  const nextId = base.length > 0 ? Math.max(...base.map((item) => item.id)) + 1 : 1;
  const newItem: PerguntaItem = {
    id: nextId,
    quizId,
    pergunta,
    categoria,
    dificuldade: input.dificuldade,
    ativo: input.ativo,
    alternativas,
  };

  const updated = [newItem, ...base];
  persistPerguntas(quizId, updated);
  return newItem;
}
