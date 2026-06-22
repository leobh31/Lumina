import React, { useState } from 'react';
import { LearningPath, PathStep, Book } from '../types';
import { ChevronDown, ChevronUp, CheckCircle, Circle, BookOpen, Clock, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PathCardProps {
  key?: string;
  path: LearningPath;
  books: Book[];
  onToggleStep: (pathId: string, stepId: string) => void;
}

export default function PathCard({ path, books, onToggleStep }: PathCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const completedSteps = path.steps.filter(s => s.completed).length;
  const totalSteps = path.steps.length;
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Find corresponding books for the steps to display covers
  const getLinkedBook = (bookId?: string): Book | undefined => {
    if (!bookId) return undefined;
    return books.find(b => b.id === bookId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 border border-black/10 rounded-sm overflow-hidden hover:border-black/25 hover:bg-white transition-all duration-300"
      id={`path-card-${path.id}`}
    >
      {/* Path Base Card Header Info */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 cursor-pointer flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-stone-50/50 transition-colors"
        id={`path-header-${path.id}`}
      >
        <div className="flex-grow space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] uppercase font-sans tracking-widest font-bold px-2 py-0.5 border ${
              path.category === 'Filosofia' ? 'bg-[#5A5A40]/5 text-[#5A5A40] border-[#5A5A40]/20' :
              path.category === 'Literatura' ? 'bg-rose-50 text-rose-950 border-rose-200' :
              path.category === 'História' ? 'bg-emerald-50 text-emerald-950 border-emerald-200' :
              'bg-blue-50 text-blue-950 border-blue-200'
            }`}>
              {path.category}
            </span>
            <span className="text-[9px] uppercase font-sans tracking-widest font-bold px-2 py-0.5 border border-black/15 bg-white/60 text-stone-700">
              {path.difficulty}
            </span>
            
            <div className="flex items-center gap-1 text-[10px] font-mono text-stone-500 ml-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>~{path.estimatedHours}h sugerido</span>
            </div>
          </div>

          <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight mt-1.5 hover:text-[#5A5A40] transition-colors">
            {path.name}
          </h3>
          <p className="text-xs text-stone-500 font-sans line-clamp-2 pr-4 leading-relaxed">
            {path.description}
          </p>
        </div>

        {/* Path Progress Metrics & Chevron Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-6 flex-shrink-0 border-t md:border-t-0 border-black/5 pt-3 md:pt-0" id={`path-progress-controls-${path.id}`}>
          <div className="flex flex-col md:items-end">
            <span className="text-[9px] font-sans text-stone-400 uppercase tracking-widest font-bold">Progresso</span>
            <span className="text-xs font-mono font-bold text-stone-800">
              {completedSteps}/{totalSteps} etapas ({percentage}%)
            </span>
            <div className="w-24 bg-stone-100 rounded-none h-1 mt-1.5 overflow-hidden hidden md:block">
              <div 
                className="bg-[#5A5A40] h-1 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <button 
            type="button"
            className="w-7 h-7 rounded-sm border border-black/10 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            id={`toggle-btn-${path.id}`}
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Checklist Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-black/5 bg-stone-100/30"
            id={`expanded-steps-${path.id}`}
          >
            <div className="p-5 space-y-3">
              <h4 className="text-[9px] uppercase font-sans font-bold text-stone-400 tracking-widest mb-2">
                Linha do Tempo de Aprendizado
              </h4>

              {path.steps.map((step, idx) => {
                const linkedBook = getLinkedBook(step.bookId);
                return (
                  <div 
                    key={step.id}
                    onClick={() => onToggleStep(path.id, step.id)}
                    className={`p-3.5 rounded-sm border transition-all flex items-start gap-4 cursor-pointer select-none ${
                      step.completed 
                        ? 'bg-stone-200/20 border-black/5 text-stone-400' 
                        : 'bg-white border-black/10 hover:border-black/20 text-stone-800'
                    }`}
                    id={`step-row-${step.id}`}
                  >
                    {/* Index or Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-300 hover:text-stone-500 transition" />
                      )}
                    </div>

                    <div className="flex-grow space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-stone-400 font-semibold">#0{idx + 1}</span>
                        <h5 className={`text-sm font-sans font-bold leading-tight ${step.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                          {step.title}
                        </h5>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed font-sans">{step.description}</p>
                      
                      {/* Linked Book Reference Display */}
                      {linkedBook && (
                        <div 
                          className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-none text-[10px] font-mono border ${
                            step.completed 
                              ? 'bg-stone-100/50 text-stone-400 border-black/5' 
                              : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/25'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid checking the checkbox if they tap on link
                          }}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Livro: {linkedBook.title} ({linkedBook.currentPage}/{linkedBook.totalPages} pág)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
