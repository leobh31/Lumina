import { Book, LearningPath, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'todos',
    name: 'Todos',
    iconName: 'BookOpen',
    description: 'Ver todo o acervo',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-800',
    borderClass: 'border-stone-200'
  },
  {
    id: 'filosofia',
    name: 'Filosofia',
    iconName: 'Compass',
    description: 'Teoria do conhecimento, lógica, ética e existência',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-900',
    borderClass: 'border-amber-200'
  },
  {
    id: 'literatura',
    name: 'Literatura',
    iconName: 'Feather',
    description: 'Clássicos mundiais, romance, poesia e ficção',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-900',
    borderClass: 'border-rose-200'
  },
  {
    id: 'historia',
    name: 'História',
    iconName: 'Hourglass',
    description: 'Crônicas do passado, civilizações e biografias',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-900',
    borderClass: 'border-emerald-200'
  },
  {
    id: 'outros',
    name: 'Outros',
    iconName: 'Sparkles',
    description: 'Ciências, artes, ensaios e variados',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-900',
    borderClass: 'border-blue-200'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Assim Falou Zaratustra',
    author: 'Friedrich Nietzsche',
    totalPages: 320,
    currentPage: 128,
    category: 'Filosofia',
    coverColor: 'linear-gradient(135deg, #7c2d12, #451a03)', // Amber-900 to Amber-950
    status: 'reading',
    notes: 'Lendo com atenção especial ao capítulo "Das Três Metamorfoses" (o camelo, o leão e a criança). A linguagem poética é profundamente evocativa. Cada aforismo guarda camadas insolúveis de significado.',
    startDate: '2026-05-10',
    lastReadDate: '2026-06-20'
  },
  {
    id: 'b2',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    totalPages: 256,
    currentPage: 192,
    category: 'Literatura',
    coverColor: 'linear-gradient(135deg, #881337, #3f0712)', // Rose-900 to Rose-950
    status: 'reading',
    notes: 'A ironia machadiana e o narrador não confiável (Bento Santiago) são geniais. Mais do que saber do suposto adultério, o fascinante é analisar o ciúme corrosivo e a reconstrução de memórias.',
    startDate: '2026-06-01',
    lastReadDate: '2026-06-21'
  },
  {
    id: 'b3',
    title: 'Crítica da Razão Pura',
    author: 'Immanuel Kant',
    totalPages: 680,
    currentPage: 85,
    category: 'Filosofia',
    coverColor: 'linear-gradient(135deg, #064e3b, #022c22)', // Emerald-900 to Emerald-950
    status: 'reading',
    notes: 'A revolução copernicana da mente na Estética Transcendental: espaço e tempo como formas a priori da sensibilidade pura. Leitura complexa, exige ler cada parágrafo repetidas vezes.',
    startDate: '2026-04-15',
    lastReadDate: '2026-06-18'
  },
  {
    id: 'b4',
    title: 'Grande Sertão: Veredas',
    author: 'João Guimarães Rosa',
    totalPages: 600,
    currentPage: 150,
    category: 'Literatura',
    coverColor: 'linear-gradient(135deg, #78350f, #2d1500)', // Warm Amber/Orange to dark brown
    status: 'reading',
    notes: 'A travessia existencial de Riobaldo. A linguagem reinventada é sublime. "Viver é muito perigoso...", o sertão está dentro de nós. Diálogo fictício formidável com um interlocutor silencioso.',
    startDate: '2026-05-20',
    lastReadDate: '2026-06-15'
  },
  {
    id: 'b5',
    title: 'Meditações',
    author: 'Marco Aurélio',
    totalPages: 192,
    currentPage: 0,
    category: 'Filosofia',
    coverColor: 'linear-gradient(135deg, #1e3a8a, #0f172a)', // Blue-900 to Slate-950
    status: 'want-to-read',
    notes: 'Para começar assim que terminar Dom Casmurro. Pretendo adotar o estoicismo como prática de reflexão matinal.',
    startDate: '2026-06-21'
  },
  {
    id: 'b6',
    title: 'Cem Anos de Solidão',
    author: 'Gabriel García Márquez',
    totalPages: 448,
    currentPage: 448,
    category: 'Literatura',
    coverColor: 'linear-gradient(135deg, #115e59, #042f2e)', // Teal-800 to Teal-950
    status: 'completed',
    rating: 5,
    notes: 'Terminado! Uma das maiores obras-primas que já li. Macondo se torna um espelho de toda a história humana. A solidão dos Buendía ecoa de geração em geração. O final é avassalador.',
    startDate: '2026-03-01',
    lastReadDate: '2026-04-30'
  },
  {
    id: 'b7',
    title: 'A República',
    author: 'Platão',
    totalPages: 420,
    currentPage: 420,
    category: 'Filosofia',
    coverColor: 'linear-gradient(135deg, #312e81, #1e1b4b)', // Indigo-900 to Indigo-950
    status: 'completed',
    rating: 4,
    notes: 'Excelente ponto de partida para o pensamento político ocidental. O Mito da Caverna no Livro VII é inesquecível, ilustrando perfeitamente a ascensão dialética para o mundo das Ideias.',
    startDate: '2026-02-10',
    lastReadDate: '2026-03-15'
  }
];

export const INITIAL_PATHS: LearningPath[] = [
  {
    id: 'p1',
    name: 'Introdução à Filosofia Existencialista',
    description: 'Explore os principais pensadores que moldaram a filosofia da liberdade individual, da angústia e da criação de sentido no absurdo.',
    category: 'Filosofia',
    difficulty: 'Intermediário',
    estimatedHours: 50,
    steps: [
      { id: 'p1_s1', title: 'O Mito de Sísifo (Albert Camus)', description: 'Ler o ensaio sobre o absurdo e a revolta contra a falta de sentido intrínseco do universo.', completed: true, bookId: 'b1' },
      { id: 'p1_s2', title: 'O Existencialismo é um Humanismo (Sartre)', description: 'Estudar a conferência de Sartre que resume "a existência precede a essência" e a condenação a ser livre.', completed: true },
      { id: 'p1_s3', title: 'O Segundo Sexo (Beauvoir) - Seleção de capítulos', description: 'Compreender a análise existencialista aplicada à condição da mulher.', completed: false },
      { id: 'p1_s4', title: 'Assim Falou Zaratustra (Nietzsche)', description: 'Ler e correlacionar a superação do niilismo sugerida por Nietzsche com a liberdade existencialista.', completed: false, bookId: 'b1' }
    ]
  },
  {
    id: 'p2',
    name: 'Clássicos Modernistas Brasileiros',
    description: 'Uma imersão nas obras que romperam com o academicismo parnasiano e forjaram a identidade multifacetada da nossa literatura a partir de 1922.',
    category: 'Literatura',
    difficulty: 'Avançado',
    estimatedHours: 65,
    steps: [
      { id: 'p2_s1', title: 'Semana de Arte Moderna', description: 'Estudar o manifesto antropófago de Oswald de Andrade e o impacto de Anita Malfatti e Villa-Lobos.', completed: true },
      { id: 'p2_s2', title: 'Macunaíma (Mário de Andrade)', description: 'Explorar o herói sem nenhum caráter e a fusão do folclore nacional com linguagem inventiva.', completed: false },
      { id: 'p2_s3', title: 'Grande Sertão: Veredas (Guimarães Rosa)', description: 'Enfrentar a travessia épica e metafísica do jagunço Riobaldo pelo sertão de Minas.', completed: false, bookId: 'b4' },
      { id: 'p2_s4', title: 'Análise literária de "A Rosa do Povo" de Drummond', description: 'Ler a poesia lírico-política do poeta mineiro em face da Segunda Guerra.', completed: false }
    ]
  },
  {
    id: 'p3',
    name: 'Estoicismo: Filosofia Prática para a Vida',
    description: 'Aprenda os preceitos de Marco Aurélio, Sêneca e Epicteto para alcançar a ataraxia: paz de espírito perante as adversidades externas.',
    category: 'Filosofia',
    difficulty: 'Iniciante',
    estimatedHours: 30,
    steps: [
      { id: 'p3_s1', title: 'Cartas de um Estoico (Sêneca)', description: 'Ler as primeiras 20 cartas enviadas a Lucílio sobre o tempo, a amizade e a tranquilidade.', completed: false },
      { id: 'p3_s2', title: 'Meditações de Marco Aurélio', description: 'Analisar o diário íntimo do imperador filósofo sobre autodisciplina e impermanência.', completed: false, bookId: 'b5' },
      { id: 'p3_s3', title: 'O Manual de Epicteto', description: 'Estudar a distinção fundamental de Epicteto entre o que está sob nosso controle e o que não está.', completed: false },
      { id: 'p3_s4', title: 'Aplicar a Dic构造 fundamental de controle', description: 'Fazer o registro diário de uma circunstância externa estressante e como ela foi manejada racionalmente por 5 dias.', completed: false }
    ]
  }
];
