import { useState, useEffect } from 'react';
import { Book, LearningPath, Category } from './types';
import { INITIAL_CATEGORIES, INITIAL_BOOKS, INITIAL_PATHS } from './initialData';
import { savePassagesToIndexedDB, deletePassagesFromIndexedDB } from './utils/indexedDb';

// Subcomponents
import StatsBanner from './components/StatsBanner';
import BookCard from './components/BookCard';
import PathCard from './components/PathCard';
import BookDetailModal from './components/BookDetailModal';
import AddBookModal from './components/AddBookModal';
import AddPathModal from './components/AddPathModal';
import KindleReader from './components/KindleReader';

// Icons
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Compass, 
  Feather, 
  Sparkles, 
  BookOpen, 
  LogOut, 
  Bookmark, 
  GraduationCap,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INTERESTING_QUOTES = [
  { text: "A leitura de todos os bons livros é como uma conversação com os melhores espíritos dos séculos passados.", author: "René Descartes" },
  { text: "Não há livro tão mau que não tenha algo de bom.", author: "Miguel de Cervantes" },
  { text: "A filosofia ensina a agir, não a falar.", author: "Sêneca" },
  { text: "A literatura é a maneira mais agradável de ignorar a vida.", author: "Fernando Pessoa" },
  { text: "O homem não é nada mais do que aquilo que faz de si mesmo.", author: "Jean-Paul Sartre" },
  { text: "A herança dos livros é a mais preciosa que podemos legar às gerações futuras.", author: "Immanuel Kant" }
];

export default function App() {
  // --- Persistent States ---
  const [books, setBooks] = useState<Book[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentBookTab, setCurrentBookTab] = useState<'reading' | 'want-to-read' | 'completed'>('reading');
  const [showTrilhas, setShowTrilhas] = useState(false);
  const [showNivel, setShowNivel] = useState(false);

  // --- Modal Controllers ---
  const [selectedBookForNotes, setSelectedBookForNotes] = useState<Book | null>(null);
  const [activeKindleBook, setActiveKindleBook] = useState<Book | null>(null);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddPathOpen, setIsAddPathOpen] = useState(false);

  // --- Quotes State ---
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Load from LocalStorage
  useEffect(() => {
    const savedBooks = localStorage.getItem('lumina_books');
    const savedPaths = localStorage.getItem('lumina_paths');

    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    } else {
      setBooks(INITIAL_BOOKS);
      localStorage.setItem('lumina_books', JSON.stringify(INITIAL_BOOKS));
    }

    if (savedPaths) {
      setPaths(JSON.parse(savedPaths));
    } else {
      setPaths(INITIAL_PATHS);
      localStorage.setItem('lumina_paths', JSON.stringify(INITIAL_PATHS));
    }

    // Set a random quote index
    setQuoteIndex(Math.floor(Math.random() * INTERESTING_QUOTES.length));
  }, []);

  // Helper helper to save states
  const saveBooksState = (newBooks: Book[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem('lumina_books', JSON.stringify(newBooks));
    } catch (err) {
      console.error("Erro ao salvar livros no LocalStorage:", err);
      alert("Aviso: O armazenamento local do navegador está cheio. Suas preferências de leitura podem não persistir corretamente após recarregar a página.");
    }
  };

  const savePathsState = (newPaths: LearningPath[]) => {
    setPaths(newPaths);
    localStorage.setItem('lumina_paths', JSON.stringify(newPaths));
  };

  // --- Handlers ---
  const handlePageUpdateFromCard = (bookId: string, newPages: number) => {
    const updated = books.map(book => {
      if (book.id === bookId) {
        const isNowCompleted = newPages === book.totalPages;
        return {
          ...book,
          currentPage: newPages,
          status: isNowCompleted ? ('completed' as const) : book.status,
          lastReadDate: new Date().toISOString().split('T')[0]
        };
      }
      return book;
    });
    saveBooksState(updated);
  };

  const handleSaveBookDetailsFromModal = (updatedBook: Book) => {
    const updated = books.map(b => b.id === updatedBook.id ? updatedBook : b);
    saveBooksState(updated);
    setSelectedBookForNotes(null);
  };

  const handleDeleteBook = (bookId: string) => {
    const filtered = books.filter(b => b.id !== bookId);
    saveBooksState(filtered);
    setSelectedBookForNotes(null);
    deletePassagesFromIndexedDB(bookId).catch(console.error);
  };

  const handleTogglePathwayStep = (pathId: string, stepId: string) => {
    const updated = paths.map(path => {
      if (path.id === pathId) {
        const updatedSteps = path.steps.map(step => {
          if (step.id === stepId) {
            return { ...step, completed: !step.completed };
          }
          return step;
        });
        return { ...path, steps: updatedSteps };
      }
      return path;
    });
    savePathsState(updated);
  };

  const handleCreateBook = async (newBookData: Omit<Book, 'id'>) => {
    const bookId = `book_${Date.now()}`;
    
    // If we have custom uploaded passages, save them separately to IndexedDB
    if (newBookData.uploadedPassages && newBookData.uploadedPassages.length > 0) {
      try {
        await savePassagesToIndexedDB(bookId, newBookData.uploadedPassages);
      } catch (err) {
        console.error("Erro ao salvar trechos no IndexedDB:", err);
      }
    }

    const { uploadedPassages, ...cleanBookData } = newBookData;

    const newBook: Book = {
      ...cleanBookData,
      id: bookId,
      startDate: newBookData.status === 'reading' ? new Date().toISOString().split('T')[0] : undefined
    };
    saveBooksState([newBook, ...books]);
  };

  const handleCreatePath = (newPathData: Omit<LearningPath, 'id'>) => {
    const newPath: LearningPath = {
      ...newPathData,
      id: `path_${Date.now()}`
    };
    savePathsState([newPath, ...paths]);
  };

  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INTERESTING_QUOTES.length);
  };

  // Reset to default seed data if they want to start fresh/test
  const resetToSeedData = () => {
    if (confirm("Deseja resetar a sua estante e trilhas para o modelo inicial do Lumina? Todos os seus dados customs serão limpos.")) {
      localStorage.removeItem('lumina_books');
      localStorage.removeItem('lumina_paths');
      setBooks(INITIAL_BOOKS);
      setPaths(INITIAL_PATHS);
      setSelectedCategory('todos');
      setSearchTerm('');
    }
  };

  // --- Filtering calculations ---
  const currentCategoryObj = INITIAL_CATEGORIES.find(c => c.id === selectedCategory);

  const filteredBooks = books.filter(book => {
    // 1. Filter by Selected Category pill
    if (selectedCategory !== 'todos') {
      if (book.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
    // 2. Filter by Search input
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchesTitle = book.title.toLowerCase().includes(term);
      const matchesAuthor = book.author.toLowerCase().includes(term);
      if (!matchesTitle && !matchesAuthor) return false;
    }
    // 3. Filter by Current tab (Reading, Want to Read, Completed)
    if (book.status !== currentBookTab) return false;

    return true;
  });

  const filteredPaths = paths.filter(path => {
    // 1. Filter by Selected Category pill
    if (selectedCategory !== 'todos') {
      if (path.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
    // 2. Filter by Search input
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      if (!path.name.toLowerCase().includes(term) && !path.description.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-serif p-3 sm:p-6 md:p-8 selection:bg-stone-200 selection:text-black pb-12" id="lumina-app">
      {/* Outer Editorial Container Frame */}
      <div className="max-w-7xl mx-auto bg-[#F5F2ED] min-h-[calc(100vh-4rem)] p-4 sm:p-8 md:p-10 flex flex-col justify-between rounded-sm relative">
        
        {/* Editorial Brand Header */}
        <header className="border-b border-black/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6" id="primary-header">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#5A5A40] font-bold">
                LUMINA // ESTUDOS & LITERATURA ATIVA
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-[#1A1A1A] mt-2 flex items-baseline gap-1" id="app-title-logo">
              Lumina
              <span className="text-[#5A5A40] font-light text-xl italic font-serif ml-1">shelf</span>
            </h1>
            
            <p className="text-xs text-stone-500 font-sans tracking-wide max-w-lg">
              Caderno literário dedicado ao cultivo de estudos rigorosos, anotações e trilhas guiadas.
            </p>
          </div>

          {/* Quick Config Actions */}
          <div className="flex items-center gap-3.5 animate-fade-in" id="header-action-panel">
            <button
              onClick={() => setIsAddBookOpen(true)}
              className="px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#4A4A33] text-white rounded-none text-[10px] font-sans uppercase tracking-[0.1em] transition flex items-center gap-1.5 font-bold cursor-pointer shadow-sm hover:shadow-md"
              title="Adicionar um novo livro (inclusive obras completas em formato .txt ou .pdf)"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Livro (.txt, .pdf)
            </button>
            <div className="h-4 w-px bg-black/10"></div>
            <button
              onClick={resetToSeedData}
              className="px-3 py-1.5 border border-black/10 hover:border-black/30 rounded-none text-[10px] font-sans uppercase tracking-widest text-[#1A1A1A] hover:bg-white transition flex items-center gap-1.5 font-bold cursor-pointer"
              title="Restaurar dados modelo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resetar Estante
            </button>
            <div className="h-4 w-px bg-black/10 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-stone-400">
              <span>Sincronia Local</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] inline-block animate-pulse"></span>
            </div>
          </div>
        </header>

        {/* Motivational Literary Quote Banner */}
        <div className="mb-8 p-6 bg-white/40 border border-black/10 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden" id="quotes-widget">
          {/* subtle editorial bar design */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5A5A40]"></div>
          
          <div className="space-y-1 max-w-3xl min-h-12 flex flex-col justify-center pl-3">
            <p className="text-sm font-serif italic text-[#1A1A1A] leading-relaxed font-semibold">
              "{INTERESTING_QUOTES[quoteIndex].text}"
            </p>
            <p className="text-[10px] font-sans text-[#5A5A40] font-bold uppercase tracking-widest pt-1">
              — {INTERESTING_QUOTES[quoteIndex].author}
            </p>
          </div>

          <button
            type="button"
            onClick={rotateQuote}
            className="flex-shrink-0 p-2 border border-black/10 hover:border-black/25 hover:bg-white text-stone-600 transition cursor-pointer"
            title="Sortear outra citação"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Row & Dashboard Stats Info */}
        <section className="mb-8" id="filtering-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-black/10 mb-6 pb-4">
            {/* Horizontal elegant indices */}
            <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-none" id="categories-pill-row">
              {INITIAL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'todos' ? books.length : books.filter(b => b.category.toLowerCase() === cat.id.toLowerCase()).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`pb-1 text-[11px] font-sans uppercase tracking-[0.16em] transition-all cursor-pointer hover:text-black border-b-2 shrink-0 ${
                      isSelected
                        ? 'font-bold text-[#1A1A1A] border-[#5A5A40]'
                        : 'text-stone-400 border-transparent hover:border-stone-500'
                    }`}
                  >
                    {cat.name} <span className="opacity-60 text-[9px] font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Simple Search Input */}
            <div className="relative w-full md:w-64" id="search-box">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar livros ou trilhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-black/10 bg-white/70 rounded-none focus:outline-none focus:bg-white focus:border-stone-600 transition text-[#1A1A1A] font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 font-sans text-[9px] uppercase tracking-wider text-stone-400 hover:text-[#1A1A1A] font-bold"
                >
                  [limpar]
                </button>
              )}
            </div>
          </div>

          {/* Detailed Category Description banner */}
          {selectedCategory !== 'todos' && currentCategoryObj && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border border-[#5A5A40]/30 bg-white/40 text-stone-800 rounded-none mb-6 flex items-start gap-3"
              id="category-definition-banner"
            >
              <Compass className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#5A5A40]" />
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider font-sans text-[#5A5A40]">Foco Temático: {currentCategoryObj.name}</h4>
                <p className="text-xs opacity-90 mt-0.5 font-serif leading-relaxed italic">{currentCategoryObj.description}</p>
              </div>
            </motion.div>
          )}
        </section>

        {/* Dashboard Panels Grid */}
        <section className="grid grid-cols-1 gap-8 items-start mb-8 flex-grow" id="main-grid">
          
          {/* LEFT SIDE: BIBLIOTECA (Takes full width) */}
          <div className="w-full space-y-6 transition-all duration-300" id="shelf-column">
            
            {/* ESTANTE PARTICULAR */}
            <div className="bg-white/60 border border-black/10 rounded-sm p-6 relative" id="shelf-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-black/5 pb-4">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#5A5A40]" />
                    Estante Particular
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5 font-sans">
                    Gerencie o progresso e notas críticas dos seus volumes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(true)}
                  className="px-4 py-2 bg-[#5A5A40] hover:bg-[#4A4A33] text-white text-xs font-sans font-bold uppercase tracking-widest rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="trigger-add-book"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Livro
                </button>
              </div>

              {/* Shelf Sub-Tabs: Reading / Wants / Completed */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 border-b border-black/5 pb-3 mb-6 font-sans text-xs">
                {(['reading', 'want-to-read', 'completed'] as const).map((tab) => {
                  const isActive = currentBookTab === tab;
                  const label = 
                    tab === 'reading' ? 'Lendo Agora' : 
                    tab === 'want-to-read' ? 'Lista de Desejos' : 'Lidos';
                  
                  // Filter the count dynamically by the currently active category and search filter
                  const count = books.filter(b => {
                    if (b.status !== tab) return false;
                    if (selectedCategory !== 'todos') {
                      if (b.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
                    }
                    if (searchTerm.trim() !== '') {
                      const term = searchTerm.toLowerCase();
                      const matchesTitle = b.title.toLowerCase().includes(term);
                      const matchesAuthor = b.author.toLowerCase().includes(term);
                      if (!matchesTitle && !matchesAuthor) return false;
                    }
                    return true;
                  }).length;

                  return (
                    <button
                      key={tab}
                      onClick={() => setCurrentBookTab(tab)}
                      className={`pb-1 uppercase tracking-wider font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 whitespace-nowrap ${
                        isActive
                          ? 'text-[#5A5A40] border-[#5A5A40]'
                          : 'text-stone-400 border-transparent hover:text-stone-700'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="text-[9px] font-mono opacity-65">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onPageUpdate={handlePageUpdateFromCard}
                        onSelect={setSelectedBookForNotes}
                        onOpenKindle={(b) => setActiveKindleBook(b)}
                      />
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full py-16 text-center space-y-2 border border-dashed border-stone-300 rounded-none bg-stone-50/25"
                      id="empty-books-prompt"
                    >
                      <BookOpen className="w-6 h-6 text-stone-400 mx-auto" />
                      <p className="text-xs font-sans uppercase tracking-widest font-bold text-stone-600">Nenhum livro registrado</p>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto px-4 font-serif leading-relaxed italic">
                        Não existem volumes ativos nessa seção para a categoria atual. Registre um novo volume acima.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Menu de Recursos Simplificado */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center py-2" id="extensions-menu">
              <button
                type="button"
                translate="no"
                onClick={() => setShowTrilhas(!showTrilhas)}
                className={`w-full sm:w-auto px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer border rounded-none ${
                  showTrilhas 
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40]' 
                    : 'bg-white/60 border-black/10 text-stone-700 hover:bg-white hover:border-black/25'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Trilha de Estudos
              </button>

              <button
                type="button"
                translate="no"
                onClick={() => setShowNivel(!showNivel)}
                className={`w-full sm:w-auto px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer border rounded-none ${
                  showNivel 
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40]' 
                    : 'bg-white/60 border-black/10 text-stone-700 hover:bg-white hover:border-black/25'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Nível de Estudo
              </button>
            </div>

          </div>

          {/* PANEL EXTENSIONS (Takes full width, rendered when either panel is active) */}
          {(showTrilhas || showNivel) && (
            <div className="w-full space-y-6" id="extensions-column">
              
              {/* TRILHAS DE ESTUDO PANEL */}
              <AnimatePresence>
                {showTrilhas && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/60 border border-black/10 rounded-sm p-6" id="paths-card">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-black/5 pb-4">
                        <div>
                          <h2 className="text-lg font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#5A5A40]" />
                            Trilhas de Estudo
                          </h2>
                          <p className="text-xs text-stone-500 mt-0.5 font-sans">
                            Roteiros cronológicos estruturados passo-a-passo.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAddPathOpen(true)}
                          className="px-3.5 py-2 border border-black/10 hover:border-black/25 bg-white hover:bg-stone-50 text-stone-750 text-xs font-sans font-bold uppercase tracking-widest rounded-none transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                          id="trigger-add-path"
                        >
                          <Plus className="w-3.5 h-3.5" /> Trilha
                        </button>
                      </div>

                      {/* Trails List */}
                      <div className="space-y-4" id="paths-list-wrapper">
                        <AnimatePresence mode="popLayout">
                          {filteredPaths.length > 0 ? (
                            filteredPaths.map((path) => (
                              <PathCard
                                key={path.id}
                                path={path}
                                books={books}
                                onToggleStep={handleTogglePathwayStep}
                              />
                            ))
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="py-16 text-center space-y-2 border border-dashed border-stone-300 rounded-none bg-stone-50/25"
                              id="empty-paths-prompt"
                            >
                              <Compass className="w-6 h-6 text-stone-400 mx-auto" />
                              <p className="text-xs font-sans uppercase tracking-widest font-bold text-stone-600">Nenhum roteiro registrado</p>
                              <p className="text-xs text-stone-400 max-w-xs mx-auto px-4 font-serif leading-relaxed italic">
                                Crie um roteiro personalizado com leituras encadeadas para consolidar sua formação.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NÍVEL DE ESTUDO PANEL */}
              <AnimatePresence>
                {showNivel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <StatsBanner books={books} paths={paths} />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

        </section>

        {/* Humble and Polished Editorial Footer */}
        <footer className="border-t border-black/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-400 mt-auto" id="primary-footer">
          <div className="flex items-center gap-2">
            <span className="text-[#1A1A1A] font-serif font-bold text-sm tracking-tight">Lumina</span>
            <span className="text-xs font-mono">|</span>
            <span className="text-xs font-sans uppercase tracking-widest text-[#5A5A40] font-bold">Caderno Literário Integrado</span>
          </div>
          <p className="text-[10px] font-sans uppercase tracking-widest hover:text-stone-600 transition text-center">
            Lumina © 2026 — Cultivando Conhecimento através da Atenção e Disciplina.
          </p>
        </footer>

      </div>

      {/* --- MODALS OVERLAYS --- */}

      {/* Book details, notes and rating Editor Modal */}
      <BookDetailModal
        book={selectedBookForNotes}
        onClose={() => setSelectedBookForNotes(null)}
        onSave={handleSaveBookDetailsFromModal}
        onDelete={handleDeleteBook}
        onOpenKindle={(b) => {
          setSelectedBookForNotes(null);
          setActiveKindleBook(b);
        }}
      />

      {/* Kindle Reader View */}
      {activeKindleBook && (
        <KindleReader
          book={activeKindleBook}
          onClose={() => setActiveKindleBook(null)}
          onPageUpdate={handlePageUpdateFromCard}
        />
      )}

      {/* Form modal to register a new book */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onAdd={handleCreateBook}
      />

      {/* Form modal to establish a new learning trail */}
      <AddPathModal
        isOpen={isAddPathOpen}
        onClose={() => setIsAddPathOpen(false)}
        books={books}
        onAdd={handleCreatePath}
      />

    </div>
  );
}
