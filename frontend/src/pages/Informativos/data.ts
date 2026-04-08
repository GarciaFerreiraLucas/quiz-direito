export interface InformativoItem {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  footnote: string;
}

export interface QuestionarioItem {
  id: number;
  title: string;
  description: string;
  category: string;
  questions: number;
}

export const mockInformativos: InformativoItem[] = [
  {
    id: 1,
    title: 'Princípios do Direito Civil',
    author: 'João Silva',
    date: '12/10/2025',
    category: 'Direito Civil',
    summary: 'Conceitos centrais de contratos, responsabilidade e obrigações.',
    content:
      'Este informativo apresenta os princípios estruturantes do Direito Civil aplicados a contratos e responsabilidade civil, com foco em previsibilidade, boa-fé e equilíbrio entre as partes.\n\nAbordaremos brevemente a função social do contrato, a teoria da imprevisão e os limites da autonomia privada, com exemplos práticos e jurisprudência recente.',
    footnote:
      'Para casos específicos, recomenda-se análise contextual do instrumento contratual e documentação comprobatória.',
  },
  {
    id: 2,
    title: 'Excludentes de Ilicitude',
    author: 'Maria Oliveira',
    date: '05/11/2025',
    category: 'Direito Penal',
    summary: 'Legítima defesa, estado de necessidade e estrito cumprimento do dever legal.',
    content:
      'As excludentes de ilicitude são causas que afastam a antijuridicidade da conduta típica. Este informativo aborda as principais hipóteses previstas no Código Penal.\n\nSerão analisadas a legítima defesa, o estado de necessidade, o estrito cumprimento do dever legal e o exercício regular de direito.',
    footnote:
      'A análise de cada excludente deve considerar as circunstâncias concretas e a proporcionalidade da conduta.',
  },
  {
    id: 3,
    title: 'Reforma Trabalhista: Impactos',
    author: 'Carlos Santos',
    date: '18/09/2025',
    category: 'Direito Trabalhista',
    summary: 'Principais mudanças e efeitos práticos em rotinas de RH.',
    content:
      'A reforma trabalhista trouxe significativas alterações nas relações de trabalho. Este informativo analisa os principais impactos para empregadores e empregados.\n\nDestacam-se as mudanças no regime de jornada, trabalho intermitente, negociação coletiva e terceirização.',
    footnote:
      'Recomenda-se acompanhamento das decisões do TST sobre a aplicação das novas normas.',
  },
  {
    id: 4,
    title: 'Direitos Fundamentais',
    author: 'Ana Costa',
    date: '22/08/2025',
    category: 'Direito Constitucional',
    summary: 'Análise dos direitos e garantias individuais na Constituição.',
    content:
      'Os direitos fundamentais constituem o núcleo da proteção constitucional ao indivíduo. Este informativo apresenta uma análise dos principais direitos previstos no art. 5º da CF.\n\nSerão abordados o direito à vida, liberdade, igualdade, segurança e propriedade.',
    footnote:
      'A interpretação dos direitos fundamentais deve considerar o princípio da concordância prática.',
  },
  {
    id: 5,
    title: 'Contratos Administrativos',
    author: 'Ricardo Mendes',
    date: '01/12/2025',
    category: 'Direito Administrativo',
    summary: 'Cláusulas exorbitantes e prerrogativas da administração pública.',
    content:
      'Os contratos administrativos possuem características próprias que os distinguem dos contratos privados. Este informativo explora as cláusulas exorbitantes.\n\nSerão analisadas as prerrogativas de alteração unilateral, rescisão, fiscalização e aplicação de sanções.',
    footnote:
      'A Nova Lei de Licitações (Lei nº 14.133/2021) trouxe importantes atualizações nesta matéria.',
  },
  {
    id: 6,
    title: 'Sucessão Legítima e Testamentária',
    author: 'Fernanda Lima',
    date: '15/07/2025',
    category: 'Direito Civil',
    summary: 'Regras de partilha e disposições de última vontade.',
    content:
      'O direito das sucessões trata da transmissão de bens após o falecimento. Este informativo aborda as duas modalidades: sucessão legítima e testamentária.\n\nSerão apresentados os herdeiros necessários, a legítima, os tipos de testamento e as cláusulas restritivas.',
    footnote:
      'Questões sucessórias envolvem análise individualizada do patrimônio e das relações familiares.',
  },
];

export const mockQuestionarios: QuestionarioItem[] = [
  {
    id: 1,
    title: 'Quiz: Princípios do Direito Civil',
    description: 'Teste seus conhecimentos sobre contratos e obrigações.',
    category: 'Direito Civil',
    questions: 10,
  },
  {
    id: 2,
    title: 'Quiz: Excludentes de Ilicitude',
    description: 'Avalie seu entendimento sobre legítima defesa e estado de necessidade.',
    category: 'Direito Penal',
    questions: 8,
  },
  {
    id: 3,
    title: 'Quiz: Reforma Trabalhista',
    description: 'Questões sobre as mudanças nas relações de trabalho.',
    category: 'Direito Trabalhista',
    questions: 12,
  },
  {
    id: 4,
    title: 'Quiz: Direitos Fundamentais',
    description: 'Perguntas sobre direitos e garantias individuais.',
    category: 'Direito Constitucional',
    questions: 15,
  },
  {
    id: 5,
    title: 'Quiz: Contratos Administrativos',
    description: 'Teste sobre cláusulas exorbitantes e licitações.',
    category: 'Direito Administrativo',
    questions: 10,
  },
  {
    id: 6,
    title: 'Quiz: Direito das Sucessões',
    description: 'Questões sobre herança, legítima e testamento.',
    category: 'Direito Civil',
    questions: 9,
  },
];
