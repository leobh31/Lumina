import React from 'react';
import { Book } from '../types';
import { Bookmark, Notebook, Check, Star, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface BookCardProps {
  key?: string;
  book: Book;
  onPageUpdate: (bookId: string, newPages: number) => void;
  onSelect: (book: Book) => void;
  onOpenKindle: (book: Book) => void;
}

export default function BookCard({ book, onPageUpdate, onSelect, onOpenKindle }: BookCardProps) {
  const percentage = Math.round((book.currentPage / book.totalPages) * 100);

  // Quick page options to add
  const handleQuickAdd = (e: React.MouseEvent, amount: number) => {
    e.stopPropagation(); // Avoid selecting/opening modal
    const updated = Math.min(book.totalPages, book.currentPage + amount);
    onPageUpdate(book.id, updated);
  };

  const isCompleted = book.status === 'completed' || book.currentPage === book.totalPages;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(book)}
      className="py-4 px-1 bg-transparent border-b border-black/10 hover:bg-black/[0.01] transition-all duration-300 flex gap-6 cursor-pointer relative group overflow-hidden"
      id={`book-card-${book.id}`}
    >
      {/* Visual Hardcover Book Representation */}
      <div 
        className="w-24 h-36 rounded-sm shadow-md flex-shrink-0 relative flex flex-col justify-between p-2.5 text-white select-none overflow-hidden"
        style={{ background: book.coverColor || 'linear-gradient(135deg, #5A5A40, #1A1A1A)' }}
        id={`book-cover-${book.id}`}
      >
        {/* Book Spine Shadow Overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20 border-r border-white/5"></div>
        
        {/* Embossed effect circles in back */}
        <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full border border-white/5 bg-white/[0.02]"></div>
        
        <div className="pl-1.5 mt-1">
          <p className="text-[8px] font-sans tracking-widest text-stone-200/80 uppercase font-bold truncate max-w-full">
            {book.category}
          </p>
          <h4 className="text-xs font-serif font-bold tracking-tight text-white leading-tight line-clamp-3 mt-1.5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            {book.title}
          </h4>
        </div>

        <div className="pl-1.5">
          <p className="text-[9px] font-sans font-light italic text-stone-200/90 truncate max-w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
            {book.author}
          </p>
          
          {/* Progress badge in self cover */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[8px] font-mono bg-white/15 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {percentage}%
            </span>
            {isCompleted && (
              <span className="bg-emerald-600 text-white rounded-full p-0.5" id={`completion-badge-${book.id}`}>
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Book Metadata & Interactive Controls */}
      <div className="flex-grow flex flex-col justify-between min-w-0" id={`book-details-${book.id}`}>
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[9px] uppercase font-sans tracking-widest font-bold px-2 py-0.5 border ${
              book.category === 'Filosofia' ? 'bg-[#5A5A40]/5 text-[#5A5A40] border-[#5A5A40]/20' :
              book.category === 'Literatura' ? 'bg-rose-50 text-rose-900 border-rose-200' :
              book.category === 'História' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
              'bg-blue-50 text-blue-900 border-blue-200'
            }`}>
              {book.category}
            </span>
            
            {book.rating && (
              <div className="flex items-center gap-0.5 text-stone-750 fill-stone-750" id={`book-rating-${book.id}`}>
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[11px] font-mono font-bold">{book.rating}</span>
              </div>
            )}
          </div>

          <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight leading-snug mt-2 group-hover:text-[#5A5A40] transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-stone-500 font-sans mt-0.5 truncate">{book.author}</p>
          
          {/* Notes summary snippet if any */}
          {book.notes && (
            <p className="text-[11px] text-stone-400 font-sans mt-2 line-clamp-2 italic leading-relaxed border-l border-stone-250 pl-2">
              "{book.notes}"
            </p>
          )}
        </div>

        <div className="mt-3">
          {/* Progress bar in right side */}
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[10px] font-mono text-stone-500">
              {book.currentPage} de {book.totalPages} págs
            </span>
            <span className="text-[10px] font-mono text-stone-600 font-bold">{percentage}%</span>
          </div>

          <div className="w-full bg-stone-100 rounded-none h-1 overflow-hidden mb-3">
            <div 
              className={`h-1 transition-all duration-300 ${isCompleted ? 'bg-emerald-600' : 'bg-[#5A5A40]'}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {/* Controls row */}
          {book.status === 'reading' ? (
            <div className="flex items-center gap-1.5" id={`quick-controls-${book.id}`}>
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, 10)}
                className="text-[10px] font-sans px-2 py-0.5 bg-stone-50 border border-black/10 hover:bg-stone-100 hover:border-black/20 text-stone-750 font-medium transition cursor-pointer"
                title="Avançar 10 páginas"
              >
                +10 pág
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, 30)}
                className="text-[10px] font-sans px-2 py-0.5 bg-stone-50 border border-black/10 hover:bg-stone-100 hover:border-black/20 text-stone-750 font-medium transition cursor-pointer"
                title="Avançar 30 páginas"
              >
                +30 pág
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenKindle(book); }}
                className="text-[10px] font-sans px-2.5 py-0.5 bg-[#5A5A40] hover:bg-[#4A4A33] text-white transition ml-auto flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
                title="Abrir no E-Reader Kindle"
              >
                <BookOpen className="w-3.5 h-3.5" /> Ler
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect(book); }}
                className="text-[10px] font-sans px-2.5 py-0.5 bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-[#5A5A40] hover:bg-[#5A5A40]/10 transition flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
              >
                <Notebook className="w-3 h-3" /> Anotar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs font-serif text-stone-400 gap-2" id={`status-label-${book.id}`}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenKindle(book); }}
                className="text-[10px] text-[#5A5A40] hover:underline font-sans uppercase tracking-widest font-bold cursor-pointer flex items-center gap-1.5"
                title="Modo E-Reader"
              >
                <BookOpen className="w-3 h-3 text-[#5A5A40]" /> Ler no Kindle
              </button>
              <span className="text-[10px] bg-stone-50 border border-black/10 px-2 py-0.5 hover:bg-stone-100 transition hover:text-stone-700 text-right cursor-pointer font-sans uppercase tracking-wider font-semibold">
                Editar
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
