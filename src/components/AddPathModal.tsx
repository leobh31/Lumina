import React, { useState } from 'react';
import { LearningPath, PathStep, Book } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onAdd: (newPath: Omit<LearningPath, 'id'>) => void;
}

export default function AddPathModal({ isOpen, onClose, books, onAdd }: AddPathModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Filosofia');
  const [difficulty, setDifficulty] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [estimatedHours, setEstimatedHours] = useState<number>(20);

  // Steps builder state
  const [steps, setSteps] = useState<Omit<PathStep, 'id' | 'completed'>[]>([]);
  const [stepTitle, setStepTitle] = useState('');
  const [stepDesc, setStepDesc] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  if (!isOpen) return null;

  const handleAddStepToTempList = () => {
    if (!stepTitle.trim()) return;
    setSteps([
      ...steps,
      {
        title: stepTitle.trim(),
        description: stepDesc.trim(),
        bookId: selectedBookId || undefined
      }
    ]);
    setStepTitle('');
    setStepDesc('');
    setSelectedBookId('');
  };

  const handleRemoveStepFromTempList = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || steps.length === 0) {
      if (steps.length === 0) {
        alert('Por favor, adicione pelo menos 1 etapa para a sua trilha de aprendizado.');
      }
      return;
    }

    // Convert temp steps to valid steps with IDs
    const finalSteps: PathStep[] = steps.map((item, idx) => ({
      id: `p_new_s_${Date.now()}_${idx}`,
      title: item.title,
      description: item.description,
      bookId: item.bookId,
      completed: false
    }));

    onAdd({
      name: name.trim(),
      description: description.trim(),
      category,
      difficulty,
      estimatedHours,
      steps: finalSteps
    });

    // Reset Fields
    setName('');
    setDescription('');
    setCategory('Filosofia');
    setDifficulty('Iniciante');
    setEstimatedHours(20);
    setSteps([]);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" id="add-path-modal-wrapper">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
          id="add-path-backdrop"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white border border-stone-200 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden z-10 p-6 md:p-8"
          id="add-path-content"
        >
          {/* Close Button */}
          <button 
            type="button"
            className="absolute right-5 top-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center transition border border-stone-200/60"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight mb-1.5 flex items-center gap-2">
            Desenhar Nova Trilha
          </h2>
          <p className="text-xs text-stone-400 font-sans mb-5">
            Crie um plano de estudo estruturado para dominar um tema iterando por etapas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Steps Section: General info */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1">
                  Nome da Trilha de Aprendizado
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Do Mito de Caverna ao Pós-Modernismo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-1.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 h-10 transition font-sans"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1">
                  Descrição da Trilha
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explique o propósito deste plano, por onde começar e o que se espera aprender ao final."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 transition leading-snug font-sans"
                />
              </div>

              {/* Grid 1: category, difficulty, hours */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-1 text-xs text-stone-800 focus:border-amber-900 h-9 transition font-sans"
                  >
                    <option value="Filosofia">Filosofia</option>
                    <option value="Literatura">Literatura</option>
                    <option value="História">História</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-1 text-xs text-stone-800 focus:border-amber-900 h-9 transition font-sans"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold mb-1">
                    Duração Est. (Horas)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 5)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1 text-xs text-stone-800 focus:border-amber-900 h-9 transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Steps builder drawer */}
            <div className="border border-stone-200/80 bg-stone-50/50 rounded-2xl p-4 space-y-3" id="steps-builder">
              <h3 className="text-xs uppercase font-mono font-bold text-stone-700 tracking-wider">
                Adicionar Etapas ao Cronograma ({steps.length} criadas)
              </h3>

              {/* Sub-inputs */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nome do passo (Ex: Ler introdução de Sêneca)"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-900 h-9"
                />
                <input
                  type="text"
                  placeholder="Instruções breves ou metas (opcional)"
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-900 h-9"
                />
                
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="flex-grow bg-white border border-stone-200 rounded-xl px-2 py-1 text-[11px] text-stone-600 focus:border-amber-900 h-8 font-sans"
                  >
                    <option value="">-- Vincular livro existente (Opcional) --</option>
                    {books.map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={handleAddStepToTempList}
                    className="px-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg h-8 flex items-center justify-center gap-1 text-xs transition font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>

              {/* Steps dynamic list render */}
              {steps.length > 0 && (
                <div className="space-y-1.5 bg-white border border-stone-200/50 p-2.5 rounded-xl max-h-36 overflow-y-auto">
                  {steps.map((st, i) => (
                    <div key={i} className="flex justify-between items-start gap-2 p-1.5 rounded-lg hover:bg-stone-50 border-b border-stone-100 last:border-b-0 text-left">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-800 truncate">
                          #{i+1}. {st.title}
                        </p>
                        {st.description && (
                          <p className="text-[10px] text-stone-400 truncate">{st.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStepFromTempList(i)}
                        className="text-stone-400 hover:text-rose-600 p-0.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-2.5 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition text-sm font-sans font-semibold h-11"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={steps.length === 0}
                className="flex-grow px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition text-sm font-sans font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Trilha
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
