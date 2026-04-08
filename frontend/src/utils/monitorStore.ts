export type MonitorItem = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
};

type MonitorInput = {
  nome: string;
  email: string;
  senha: string;
  ativo?: boolean;
};

const STORAGE_KEY = 'quiz-direito-monitores';

const DEFAULT_MONITORES: MonitorItem[] = Array.from({ length: 8 }, (_, index) => {
  const ordem = index + 1;
  return {
    id: ordem,
    nome: `Monitor ${ordem}`,
    email: `monitor${ordem}@email.com`,
    senha: '123456',
    ativo: ordem < 8,
  };
});

function parseItems(raw: string | null): MonitorItem[] | null {
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
          typeof item.nome !== 'string' ||
          typeof item.email !== 'string' ||
          typeof item.senha !== 'string' ||
          typeof item.ativo !== 'boolean'
        ) {
          return null;
        }

        return item as MonitorItem;
      })
      .filter((item): item is MonitorItem => item !== null);

    return validItems;
  } catch {
    return null;
  }
}

function persist(items: MonitorItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getMonitores(): MonitorItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_MONITORES;
  }

  const parsed = parseItems(localStorage.getItem(STORAGE_KEY));

  if (parsed && parsed.length > 0) {
    return parsed;
  }

  persist(DEFAULT_MONITORES);
  return DEFAULT_MONITORES;
}

export function getMonitorById(id: number): MonitorItem | null {
  const items = getMonitores();
  return items.find((item) => item.id === id) ?? null;
}

export function saveMonitor(input: MonitorInput, editingId?: number): MonitorItem {
  const items = getMonitores();
  const nomeNormalizado = input.nome.trim();
  const emailNormalizado = input.email.trim();
  const senhaNormalizada = input.senha.trim();
  const ativoNormalizado = input.ativo ?? true;

  if (editingId) {
    const updatedItems = items.map((item) =>
      item.id === editingId
        ? {
            ...item,
            nome: nomeNormalizado,
            email: emailNormalizado,
            senha: senhaNormalizada,
            ativo: ativoNormalizado,
          }
        : item,
    );

    persist(updatedItems);
    return updatedItems.find((item) => item.id === editingId) ?? updatedItems[0];
  }

  const nextId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
  const newItem: MonitorItem = {
    id: nextId,
    nome: nomeNormalizado,
    email: emailNormalizado,
    senha: senhaNormalizada,
    ativo: ativoNormalizado,
  };

  const updatedItems = [newItem, ...items];
  persist(updatedItems);
  return newItem;
}

export function toggleMonitorStatus(id: number): MonitorItem[] {
  const updatedItems = getMonitores().map((item) =>
    item.id === id
      ? {
          ...item,
          ativo: !item.ativo,
        }
      : item,
  );

  persist(updatedItems);
  return updatedItems;
}
