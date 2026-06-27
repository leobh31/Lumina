import { useState, useEffect } from 'react';
import { Book } from '../types';
import { X, Save, Trash2, Calendar, Star, BookOpen, Clock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onSave: (updatedBook: Book) => void;
  onDelete: (bookId: string) => void;
  onOpenKindle: (book: Book) => void;
  isAdmin?: boolean;
  onRequestAuth?: (message: string) => void;
}

export default function BookDetailModal({ 
  book, 
  onClose, 
  onSave, 
  onDelete, 
  onOpenKindle,
  isAdmin = false,
  onRequestAuth
}: BookDetailModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<'reading' | 'completed' | 'want-to-read'>('reading');
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Sync with current book
  useEffect(() => {
    if (book) {
      setCurrentPage(book.currentPage);
      setRating(book.rating);
      setNotes(book.notes || '');
      setStatus(book.status);
      setShowConfirmDelete(false);
    }
  }, [book]);

  if (!book) return null;

  const handleSave = () => {
    const updatedBook: Book = {
      ...book,
      currentPage,
      rating,
      notes: notes.trim(),
      status,
      // If page counter is maxed, auto mark as completed
      ...(currentPage === book.totalPages ? { status: 'completed' as const } : {}),
      // If status is completed but pages isn't maxed, we can ask or auto sync it. Let's make it intuitive:
      ...(status === 'completed' ? { currentPage: book.totalPages } : {}),
      lastReadDate: new Date().toISOString().split('T')[0]
    };
    onSave(updatedBook);
  };

  const handlePageChange = (val: number) => {
    const pageNum = Math.max(0, Math.min(book.totalPages, val));
    setCurrentPage(pageNum);
    
    // Auto status change if page turns
    if (pageNum === book.totalPages) {
      setStatus('completed');
    } else if (pageNum > 0 && status === 'want-to-read') {
      setStatus('reading');
    } else if (pageNum === 0 && status === 'reading') {
      setStatus('want-to-read');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" id="book-modal-wrapper">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
          id="book-modal-backdrop"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white border border-stone-200 shadow-2xl rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col z-10 overflow-hidden p-4 sm:p-6 md:p-8"
          id="book-modal-content"
        >
          {/* Close Button */}
          <button 
            type="button"
            className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center transition border border-stone-200/60 z-20"
            onClick={onClose}
            id="close-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex gap-4 sm:gap-6 items-start mb-4 pb-4 border-b border-stone-100 flex-shrink-0" id="modal-header-section">
            {/* Visual Book cover in modal */}
            <div 
              className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg shadow-md flex-shrink-0 relative flex flex-col justify-between p-2 text-white text-xs select-none"
              style={{ background: book.coverColor || '#444' }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20 border-r border-white/5"></div>
              <div className="pl-1.5 pt-1">
                <p className="text-[6px] sm:text-[7px] font-mono opacity-80 uppercase tracking-wider">{book.category}</p>
                <h4 className="font-serif font-bold text-[9px] sm:text-[10px] leading-tight line-clamp-3 mt-1">{book.title}</h4>
              </div>
              <p className="pl-1.5 text-[7px] sm:text-[8px] italic truncate">{book.author}</p>
            </div>

            <div className="space-y-1 min-w-0 flex-1 pr-6">
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full border bg-stone-100 text-stone-800 border-stone-200 inline-block">
                {book.category}
              </span>
              <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-stone-900 leading-tight mt-1 sm:mt-2 truncate" title={book.title}>{book.title}</h2>
              <p className="text-xs sm:text-sm text-stone-500 font-sans truncate">por {book.author}</p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs text-stone-400 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {book.totalPages} págs
                </span>
                {book.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {book.startDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-5 my-1" id="modal-scrollable-body">
            
            {/* Kindle Reader Quick-Access Banner */}
            <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/15 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-1" id="kindle-quick-access">
              <div className="space-y-0.5 max-w-full sm:max-w-[280px] md:max-w-[340px]">
                <h4 className="text-xs font-sans uppercase tracking-widest font-bold text-[#5A5A40]">Leitor Imersivo Kindle</h4>
                <p className="text-[10px] sm:text-[11px] text-stone-500 font-serif italic leading-snug hidden sm:block">Abra a tela semelhante ao Kindle, sintonize exegese crítica por IA e ouça a leitura falada.</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenKindle(book)}
                className="w-full sm:w-auto px-3.5 py-2 bg-[#5A5A40] hover:bg-[#4A4A33] text-white text-[10px] sm:text-xs font-sans font-bold uppercase tracking-widest rounded-lg transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" /> Ler no Kindle
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-4 sm:space-y-5" id="modal-form-fields">
              {/* Row 1: Status & Progress Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold mb-1">
                    Status de Leitura
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 transition font-sans"
                  >
                    <option value="reading">Lendo Atualmente</option>
                    <option value="want-to-read">Quero Ler (Desejo)</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold mb-1">
                    Progresso das Páginas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentPage}
                      onChange={(e) => handlePageChange(parseInt(e.target.value) || 0)}
                      min={0}
                      max={book.totalPages}
                      className="w-20 sm:w-24 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 transition"
                    />
                    <span className="text-xs sm:text-sm font-mono text-stone-400">/ {book.totalPages}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 10)}
                        className="w-6 h-6 sm:w-7 sm:h-7 text-[10px] sm:text-xs border border-stone-200 bg-stone-50 hover:bg-stone-100 rounded-lg flex items-center justify-center font-mono transition text-stone-600"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 10)}
                        className="w-6 h-6 sm:w-7 sm:h-7 text-[10px] sm:text-xs border border-stone-200 bg-stone-50 hover:bg-stone-100 rounded-lg flex items-center justify-center font-mono transition text-stone-600"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Notes & Annotations Textarea */}
              <div>
                <label className="block text-[10px] sm:text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold mb-1">
                  Anotações e Reflexões Pessoais
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Qual o principal ensinamento desse trecho? Escreva insights, citações ou reflexões..."
                  className="w-full bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 transition leading-relaxed font-sans h-32 sm:h-44 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-2 sm:mt-3 flex-shrink-0" id="modal-footer-actions">
            {showConfirmDelete ? (
              <div className="flex items-center gap-2 w-full justify-between" id="confirm-delete-actions">
                <span className="text-[10px] sm:text-xs font-mono text-rose-600 font-semibold uppercase animate-pulse">
                  Excluir permanentemente?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition text-xs font-sans font-semibold cursor-pointer"
                    id="cancel-delete-btn"
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(book.id);
                      setShowConfirmDelete(false);
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition text-xs font-sans font-semibold shadow-sm cursor-pointer"
                    id="confirm-delete-btn"
                  >
                    Sim, Excluir
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (isAdmin) {
                      setShowConfirmDelete(true);
                    } else {
                      if (onRequestAuth) {
                        onRequestAuth(`Para excluir o livro "${book.title}", é necessário acesso de Administrador.`);
                      }
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold font-mono uppercase tracking-wider border ${
                    isAdmin 
                      ? "hover:bg-rose-50 border-transparent hover:border-rose-200 text-rose-600 cursor-pointer" 
                      : "bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300 cursor-pointer"
                  }`}
                  id="delete-book-btn"
                  title={isAdmin ? "Excluir livro da estante" : "Exclusão restrita para administradores"}
                >
                  {isAdmin ? <Trash2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} 
                  {isAdmin ? "Excluir" : "Excluir (Restrito)"}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition text-xs sm:text-sm font-sans font-semibold text-center cursor-pointer"
                    id="cancel-modal-btn"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition text-xs sm:text-sm font-sans font-semibold flex items-center gap-1.5 text-center cursor-pointer"
                    id="save-modal-btn"
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
