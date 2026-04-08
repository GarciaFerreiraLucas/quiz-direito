export type CadastroTipo = 'tags' | 'categorias' | 'quizzes';

export type CadastroItem = {
  id: number;
  titulo: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  tag?: string;
};

type CadastroInput = {
  nome: string;
  descricao: string;
  ativo?: boolean;
  tag?: string;
};

const STORAGE_KEYS: Record<CadastroTipo, string> = {
  tags: 'quiz-direito-tags',
  categorias: 'quiz-direito-categorias',
  quizzes: 'quiz-direito-quizzes',
};

function buildDefaultItems(prefixo: string): CadastroItem[] {
  return Array.from({ length: 8 }, (_, index) => {
    const ordem = index + 1;
    return {
      id: ordem,
      titulo: `Título ${prefixo} ${ordem}`,
      nome: `${prefixo} ${ordem}`,
      descricao: '',
      ativo: ordem < 8,
    };
  });
}

const DEFAULT_ITEMS: Record<CadastroTipo, CadastroItem[]> = {
  tags: buildDefaultItems('Tag'),
  categorias: buildDefaultItems('Categoria'),
  quizzes: buildDefaultItems('Quiz'),
};

function getStorageKey(tipo: CadastroTipo): string {
  return STORAGE_KEYS[tipo];
}

function parseItems(raw: string | null): CadastroItem[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const validItems = parsed
      .map((item) => {
        if (
          typeof item !== 'object' ||
          item === null ||
          typeof item.id !== 'number' ||
          typeof item.titulo !== 'string' ||
          typeof item.nome !== 'string' ||
          typeof item.descricao !== 'string' ||
          typeof item.ativo !== 'boolean' ||
          (item.tag !== undefined && typeof item.tag !== 'string')
        ) {
          return null;
        }

        return item as CadastroItem;
      })
      .filter((item): item is CadastroItem => item !== null);

    return validItems;
  } catch {
    return null;
  }
}

function persist(tipo: CadastroTipo, items: CadastroItem[]): void {
  localStorage.setItem(getStorageKey(tipo), JSON.stringify(items));
}

export function getCadastroItems(tipo: CadastroTipo): CadastroItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_ITEMS[tipo];
  }

  const storageKey = getStorageKey(tipo);
  const parsed = parseItems(localStorage.getItem(storageKey));

  if (parsed && parsed.length > 0) {
    return parsed;
  }

  const defaults = DEFAULT_ITEMS[tipo];
  persist(tipo, defaults);
  return defaults;
}

export function getCadastroItemById(tipo: CadastroTipo, id: number): CadastroItem | null {
  const items = getCadastroItems(tipo);
  return items.find((item) => item.id === id) ?? null;
}

export function saveCadastroItem(tipo: CadastroTipo, input: CadastroInput, editingId?: number): CadastroItem {
  const items = getCadastroItems(tipo);
  const nomeNormalizado = input.nome.trim();
  const descricaoNormalizada = input.descricao.trim();
  const ativoNormalizado = input.ativo ?? true;
  const tagNormalizada = input.tag?.trim() || undefined;

  if (editingId) {
    const updatedItems = items.map((item) =>
      item.id === editingId
        ? {
            ...item,
            titulo: nomeNormalizado,
            nome: nomeNormalizado,
            descricao: descricaoNormalizada,
            ativo: ativoNormalizado,
            tag: tagNormalizada,
          }
        : item,
    );

    persist(tipo, updatedItems);
    return updatedItems.find((item) => item.id === editingId) ?? updatedItems[0];
  }

  const nextId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
  const newItem: CadastroItem = {
    id: nextId,
    titulo: nomeNormalizado,
    nome: nomeNormalizado,
    descricao: descricaoNormalizada,
    ativo: ativoNormalizado,
    tag: tagNormalizada,
  };

  const updatedItems = [newItem, ...items];
  persist(tipo, updatedItems);
  return newItem;
}

export function toggleCadastroStatus(tipo: CadastroTipo, id: number): CadastroItem[] {
  const updatedItems = getCadastroItems(tipo).map((item) =>
    item.id === id
      ? {
          ...item,
          ativo: !item.ativo,
        }
      : item,
  );

  persist(tipo, updatedItems);
  return updatedItems;
}
