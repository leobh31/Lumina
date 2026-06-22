import { Book, LearningPath } from '../types';
import { BookOpen, Compass, Award, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsBannerProps {
  books: Book[];
  paths: LearningPath[];
}

export default function StatsBanner({ books, paths }: StatsBannerProps) {
  const totalBooks = books.length;
  const readingBooks = books.filter(b => b.status === 'reading').length;
  const completedBooks = books.filter(b => b.status === 'completed').length;
  
  const totalPagesRead = books.reduce((acc, book) => acc + (book.currentPage || 0), 0);
  
  // Calculate level based on pages read
  let userLevel = 'Iniciante Literário';
  let nextLevelPages = 500;
  
  if (totalPagesRead >= 2000) {
    userLevel = 'Erudito de Alexandria';
    nextLevelPages = 5000;
  } else if (totalPagesRead >= 1000) {
    userLevel = 'Filósofo Livre';
    nextLevelPages = 2000;
  } else if (totalPagesRead >= 400) {
    userLevel = 'Leitor Autônomo';
    nextLevelPages = 1000;
  }

  // Calculate paths completed
  const completedPaths = paths.filter(path => {
    if (path.steps.length === 0) return false;
    return path.steps.every(step => step.completed);
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="stats-banner-container">
      {/* Level Card */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-5 bg-white/60 border border-black/10 rounded-sm flex flex-col justify-between hover:border-black/20 hover:bg-white/80 transition-all duration-300"
        id="stat-card-level"
      >
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/5">
          <span className="text-[10px] font-sans text-stone-500 uppercase tracking-widest font-semibold">Nível de Estudos</span>
          <Award className="w-4 h-4 text-stone-700" />
        </div>
        <div>
          <h3 className="text-lg font-serif text-stone-900 font-bold leading-tight">{userLevel}</h3>
          <p className="text-[11px] text-stone-500 mt-1 font-mono">
            {totalPagesRead}/{nextLevelPages} págs
          </p>
          <div className="w-full bg-stone-200/60 rounded-full h-1 mt-3 overflow-hidden">
            <div 
              className="bg-[#5A5A40] h-1 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (totalPagesRead / nextLevelPages) * 100)}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Pages Read Card */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="p-5 bg-white/60 border border-black/10 rounded-sm flex flex-col justify-between hover:border-black/20 hover:bg-white/80 transition-all duration-300"
        id="stat-card-pages"
      >
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/5">
          <span className="text-[10px] font-sans text-stone-500 uppercase tracking-widest font-semibold">Páginas Lidas</span>
          <BookOpen className="w-4 h-4 text-stone-700" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-stone-900">{totalPagesRead}</span>
            <span className="text-[11px] text-stone-500 font-sans uppercase tracking-wider font-semibold">págs</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {readingBooks} livros ativos | {completedBooks} de {totalBooks} lidos
          </p>
        </div>
      </motion.div>

      {/* Study Paths Completed */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-5 bg-white/60 border border-black/10 rounded-sm flex flex-col justify-between hover:border-black/20 hover:bg-white/80 transition-all duration-300"
        id="stat-card-paths"
      >
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/5">
          <span className="text-[10px] font-sans text-stone-500 uppercase tracking-widest font-semibold">Estudo Concluído</span>
          <Compass className="w-4 h-4 text-stone-700" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-stone-900">{completedPaths}</span>
            <span className="text-[11px] text-stone-500 font-sans uppercase tracking-wider font-semibold">trilhas</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            de {paths.length} trilhas sugeridas
          </p>
        </div>
      </motion.div>

      {/* Motivation Streak */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="p-5 bg-white/60 border border-black/10 rounded-sm flex flex-col justify-between hover:border-black/20 hover:bg-white/80 transition-all duration-300"
        id="stat-card-streak"
      >
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/5">
          <span className="text-[10px] font-sans text-stone-500 uppercase tracking-widest font-semibold">Foco diário</span>
          <Flame className="w-4 h-4 text-[#5A5A40]" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-stone-900">4</span>
            <span className="text-[11px] text-stone-500 font-sans uppercase tracking-wider font-semibold">dias úteis</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 italic">
            "A disciplina supera o talento."
          </p>
        </div>
      </motion.div>
    </div>
  );
}
