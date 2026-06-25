import React, { useState } from 'react';
import { Book } from '../types';
import { X, Check, Upload, FileText, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
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

function isTextGarbled(text: string): boolean {
  if (!text || text.length < 10) return false;
  
  let weirdChars = 0;
  let standardLetters = 0;
  
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0xE000 && code <= 0xF8FF) || code === 0xFFFD || code === 0) {
      weirdChars++;
    } else if (/[a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(text[i])) {
      standardLetters++;
    }
  }

  if (weirdChars > 0 && (weirdChars / text.length) > 0.1) {
    return true;
  }

  if (text.length > 80 && (standardLetters / text.length) < 0.3) {
    return true;
  }

  const symbolCount = (text.match(/[!#$%\&'()*+,\-\.\/0-9]/g) || []).length;
  if (text.length > 50 && (symbolCount / text.length) > 0.5) {
    return true;
  }

  return false;
}

const parseTxtToPassages = (rawText: string): { pageNumber: number; chapterTitle: string; text: string }[] => {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = text.split('\n\n').map(p => p.trim()).filter(Boolean);
  
  const passages: { pageNumber: number; chapterTitle: string; text: string }[] = [];
  let currentChapter = "Capítulo I";
  let currentPageText = "";
  let pageNumber = 1;
  const MAX_CHAR_PER_PAGE = 850; // Comfortable readable size

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    
    const isChapterHeader = 
      p.length < 60 && 
      (/^(capítulo|capitulo|chapter|parte|seção|secao|introdução|introducao|livro|prologo|prólogo|epílogo|epilogo)\b/i.test(p) ||
       (/^[IVXLCDM\d\s\.\:\-]+$/i.test(p) && p.length < 30));
      
    if (isChapterHeader) {
      if (currentPageText.trim()) {
        passages.push({
          pageNumber,
          chapterTitle: currentChapter,
          text: currentPageText.trim()
        });
        pageNumber++;
        currentPageText = "";
      }
      currentChapter = p;
      continue;
    }

    if (currentPageText.length + p.length > MAX_CHAR_PER_PAGE && currentPageText.trim()) {
      passages.push({
        pageNumber,
        chapterTitle: currentChapter,
        text: currentPageText.trim()
      });
      pageNumber++;
      currentPageText = p;
    } else {
      currentPageText = currentPageText ? currentPageText + "\n\n" + p : p;
    }
  }

  if (currentPageText.trim()) {
    passages.push({
      pageNumber,
      chapterTitle: currentChapter,
      text: currentPageText.trim()
    });
  }

  if (passages.length === 0) {
    passages.push({
      pageNumber: 1,
      chapterTitle: "Capítulo Único",
      text: text.trim() || "Sem conteúdo."
    });
  }

  return passages;
};

// Lazy load pdf.js from CDN to extract text page-by-page directly in client
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export default function AddBookModal({ isOpen, onClose, onAdd }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Filosofia');
  const [totalPages, setTotalPages] = useState<number>(200);
  const [initialStatus, setInitialStatus] = useState<'reading' | 'want-to-read'>('reading');
  const [coverColor, setCoverColor] = useState(COVERS[0].value);

  // File Upload states
  const [uploadedPassages, setUploadedPassages] = useState<{ pageNumber: number; chapterTitle: string; text: string }[] | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const [hasEncodingIssue, setHasEncodingIssue] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setUploadError('');
    setIsProcessing(true);
    setProcessingProgress('Lendo arquivo...');

    const isTxt = file.name.endsWith('.txt') || file.type === 'text/plain';
    const isPdf = file.name.endsWith('.pdf') || file.type === 'application/pdf';

    if (isTxt) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            setUploadError('O arquivo de texto está vazio.');
            setIsProcessing(false);
            return;
          }

          const passages = parseTxtToPassages(text);
          if (passages.length === 0) {
            setUploadError('Não foi possível extrair páginas do arquivo de texto.');
            setIsProcessing(false);
            return;
          }

          setUploadedPassages(passages);
          setUploadedFileName(file.name);
          setHasEncodingIssue(false);
          
          if (!title) {
            const cleanName = file.name
              .replace(/\.txt$/i, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase());
            setTitle(cleanName);
          }
          
          setTotalPages(passages.length);
        } catch (err: any) {
          setUploadError(`Erro ao ler arquivo TXT: ${err.message || err}`);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Erro ao abrir o arquivo de texto.');
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } else if (isPdf) {
      try {
        setProcessingProgress('Carregando leitor de PDF...');
        const pdfjsLib = await loadPdfJs();
        
        setProcessingProgress('Lendo estrutura do arquivo PDF...');
        const arrayBuffer = await file.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPdfPages = pdf.numPages;
        
        if (totalPdfPages === 0) {
          throw new Error('O arquivo PDF não possui páginas válidas.');
        }

        const passages: { pageNumber: number; chapterTitle: string; text: string }[] = [];
        let currentChapter = "Capítulo I";

        for (let i = 1; i <= totalPdfPages; i++) {
          setProcessingProgress(`Extraindo texto: página ${i} de ${totalPdfPages}...`);
          
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const textItems = textContent.items as any[];
          let lastY = -1;
          let pageText = "";
          
          for (const item of textItems) {
            const currentY = item.transform ? item.transform[5] : -1;
            
            if (lastY !== -1 && currentY !== -1 && Math.abs(currentY - lastY) > 8) {
              pageText += "\n";
            } else if (pageText.length > 0 && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
              pageText += " ";
            }
            pageText += item.str;
            if (currentY !== -1) {
              lastY = currentY;
            }
          }

          const trimmedText = pageText.trim();
          if (trimmedText) {
            // Chapter header detection inside the first 3 lines of the page
            const lines = trimmedText.split('\n').map(l => l.trim()).filter(Boolean);
            for (let j = 0; j < Math.min(3, lines.length); j++) {
              const line = lines[j];
              const isHeader = 
                line.length < 60 && 
                (/^(capítulo|capitulo|chapter|parte|seção|secao|introdução|introducao|livro|prologo|prólogo|epílogo|epilogo)\b/i.test(line) ||
                 (/^[IVXLCDM\d\s\.\:\-]+$/i.test(line) && line.length < 30));
              if (isHeader) {
                currentChapter = line;
                break;
              }
            }

            passages.push({
              pageNumber: i,
              chapterTitle: currentChapter,
              text: trimmedText
            });
          }
        }

        if (passages.length === 0) {
          throw new Error('Nenhum texto pôde ser extraído deste arquivo PDF. Ele pode ser composto apenas por imagens digitalizadas (scans).');
        }

        // Adjust page numbers to make sure they are sequentially continuous
        const processedPassages = passages.map((p, idx) => ({
          ...p,
          pageNumber: idx + 1
        }));

        setUploadedPassages(processedPassages);
        setUploadedFileName(file.name);
        
        // Detect encoding / scanner issue
        let encodingWarning = false;
        const testPages = processedPassages.slice(0, Math.min(3, processedPassages.length));
        for (const testP of testPages) {
          if (isTextGarbled(testP.text)) {
            encodingWarning = true;
            break;
          }
        }
        setHasEncodingIssue(encodingWarning);
        
        if (!title) {
          const cleanName = file.name
            .replace(/\.pdf$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
          setTitle(cleanName);
        }
        
        setTotalPages(processedPassages.length);
      } catch (err: any) {
        console.error("Erro no processamento do PDF:", err);
        setUploadError(err.message || 'Ocorreu um erro ao processar o arquivo PDF. Verifique se ele não está corrompido ou protegido por senha.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setUploadError('Por favor, envie um arquivo de texto (.txt) ou documento (.pdf).');
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedPassages(undefined);
    setUploadedFileName('');
    setUploadError('');
    setHasEncodingIssue(false);
  };

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
      notes: '',
      uploadedPassages
    });

    // Reset fields
    setTitle('');
    setAuthor('');
    setCategory('Filosofia');
    setTotalPages(200);
    setInitialStatus('reading');
    setCoverColor(COVERS[0].value);
    setUploadedPassages(undefined);
    setUploadedFileName('');
    setUploadError('');
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
            {/* File Upload Area */}
            <div className="bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 p-4 transition-all duration-200 hover:bg-stone-50">
              <label className="block text-xs uppercase font-mono tracking-wider text-stone-500 font-bold mb-1.5">
                Carregar Arquivo TXT ou PDF (Opcional)
              </label>
              
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-6 px-2 rounded-xl border border-stone-100 bg-amber-50/20 text-center animate-pulse">
                  <div className="w-6 h-6 border-2 border-amber-900 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs font-sans font-semibold text-stone-800">
                    {processingProgress}
                  </span>
                  <span className="text-[10px] text-stone-400 font-sans mt-0.5">
                    Isso pode levar alguns segundos dependendo do tamanho da obra.
                  </span>
                </div>
              ) : !uploadedFileName ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border border-stone-100 transition cursor-pointer text-center ${
                    dragActive ? 'bg-amber-50/40 border-amber-300' : 'bg-white'
                  }`}
                  onClick={() => document.getElementById('txt-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="txt-file-input"
                    accept=".txt,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-stone-400 mb-1.5" />
                  <span className="text-xs font-sans font-semibold text-stone-700">
                    Arraste ou clique para selecionar (.txt, .pdf)
                  </span>
                  <span className="text-[10px] text-stone-400 font-sans mt-0.5">
                    O aplicativo dividirá sua obra em páginas de leitura fluida.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-left overflow-hidden w-full">
                      <p className="text-xs font-sans font-bold text-stone-800 truncate m-0">
                        {uploadedFileName}
                      </p>
                      <p className="text-[10px] font-sans text-emerald-700 m-0">
                        Sucesso! {uploadedPassages?.length} páginas geradas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 hover:bg-emerald-100/50 rounded-lg text-emerald-600 transition shrink-0"
                    title="Excluir arquivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {hasEncodingIssue && (
                <div className="mt-2.5 p-3 bg-amber-500/5 border border-amber-600/30 rounded-xl flex gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 font-sans">
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 leading-tight">
                      Aviso de Codificação (PDF Protegido / Imagem)
                    </p>
                    <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Este PDF parece usar fontes criptografadas ou páginas escaneadas como imagem. A extração de texto resultou em símbolos ou quadrados. Você poderá ler normalmente e <strong>corrigir as páginas manualmente</strong> dentro do leitor, ou substituir o livro por uma versão em arquivo <strong>.TXT limpo</strong> a qualquer momento!
                    </p>
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="text-[10.5px] font-medium text-red-600 mt-1.5 font-sans">
                  {uploadError}
                </p>
              )}
            </div>

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
