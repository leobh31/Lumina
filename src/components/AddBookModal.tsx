import React, { useState } from 'react';
import { Book } from '../types';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newBook: Omit<Book, 'id'>) => void;
}

const COVERS = [
  { name: 'Marsala Real', value: 'linear-gradient(135deg, #881337, #3f0712)' }, // deep rose
  { name: 'Âmbar Terroso', value: 'linear-gradient(135deg, #7c2d12, #451a03)' }, // amber
  { name: 'Floresta Antiqua', value: 'linear-gradient(135deg, #064e3b, #022c22)' }, // emerald
  { name: 'Oceano Cósmico', value: 'linear-gradient(135deg, #1e3a8a, #0f172a)' }, // dark blue
  { name: 'Sertão Quente', value: 'linear-gradient(135deg, #78350f, #2d1500)' }, // warm orange/brown
  { name: 'Ébano Nobre', value: 'linear-gradient(135deg, #1c1917, #0c0a09)' } // luxury black
];

export default function AddBookModal({ isOpen, onClose, onAdd }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Filosofia');
  const [totalPages, setTotalPages] = useState<number>(200);
  const [initialStatus, setInitialStatus] = useState<'reading' | 'want-to-read'>('reading');
  const [coverColor, setCoverColor] = useState(COVERS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || totalPages <= 0) return;

    onAdd({
      title: title.trim(),
      author: author.trim(),
      category,
      totalPages,
      currentPage: initialStatus === 'reading' ? 1 : 0,
      coverColor,
      status: initialStatus,
      notes: ''
    });

    // Reset fields
    setTitle('');
    setAuthor('');
    setCategory('Filosofia');
    setTotalPages(200);
    setInitialStatus('reading');
    setCoverColor(COVERS[0].value);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" id="add-book-modal-wrapper">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
          id="add-book-backdrop"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white border border-stone-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden z-10 p-6 md:p-8"
          id="add-book-content"
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
            Adicionar Novo Livro
          </h2>
          <p className="text-xs text-stone-400 font-sans mb-6">
            Insira os dados da obra para integrá-lo a sua estante de leituras e trilhas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1.5">
                Título da Obra
              </label>
              <input
                type="text"
                required
                placeholder="Ex: O Príncipe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 h-10 transition font-sans"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1.5">
                Autor ou Autora
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Nicolau Maquiavel"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 h-10 transition font-sans"
              />
            </div>

            {/* Grid for Pages + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1.5">
                  Total de Páginas
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={totalPages}
                  onChange={(e) => setTotalPages(parseInt(e.target.value) || 1)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 h-10 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1.5">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-850 focus:outline-none focus:ring-1 focus:ring-amber-900 focus:border-amber-900 h-10 transition font-sans"
                >
                  <option value="Filosofia">Filosofia</option>
                  <option value="Literatura">Literatura</option>
                  <option value="História">História</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            {/* Status Options */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1.5">
                Iniciar Como
              </label>
              <div className="flex gap-4 font-sans text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="radio"
                    name="initialStatus"
                    checked={initialStatus === 'reading'}
                    onChange={() => setInitialStatus('reading')}
                    className="accent-stone-800"
                  />
                  <span>Lendo Atualmente (pág 1)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="radio"
                    name="initialStatus"
                    checked={initialStatus === 'want-to-read'}
                    onChange={() => setInitialStatus('want-to-read')}
                    className="accent-stone-800"
                  />
                  <span>Na Lista de Desejos</span>
                </label>
              </div>
            </div>

            {/* Premium Aesthetic Cover Swatches */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-2">
                Paleta da Capa (Encadernação)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {COVERS.map((cover) => (
                  <button
                    key={cover.name}
                    type="button"
                    title={cover.name}
                    onClick={() => setCoverColor(cover.value)}
                    className="w-full aspect-[2/3] rounded-lg border border-stone-200 shadow-sm relative overflow-hidden transition transform hover:scale-105 active:scale-95 flex items-center justify-center text-white"
                    style={{ background: cover.value }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20"></div>
                    {coverColor === cover.value && (
                      <Check className="w-4 h-4 bg-black/30 rounded-full p-0.5" />
                    )}
                  </button>
                ))}
              </div>
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
                className="flex-grow px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition text-sm font-sans font-semibold h-11"
              >
                Adicionar à Estante
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
