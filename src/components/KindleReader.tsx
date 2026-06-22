import { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { getBookPassages, PassagePage } from '../data/bookPassages';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Type, 
  BookOpen, 
  AudioLines, 
  Sparkles, 
  History, 
  GraduationCap,
  Play, 
  Pause, 
  Square,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KindleReaderProps {
  book: Book;
  onClose: () => void;
  onPageUpdate: (bookId: string, pageNum: number) => void;
}

type KindleTheme = 'light' | 'sepia' | 'charcoal' | 'mint';
type KindleFont = 'serif' | 'sans' | 'mono' | 'dyslexic';
type KindleMargin = 'narrow' | 'medium' | 'wide';

export default function KindleReader({ book, onClose, onPageUpdate }: KindleReaderProps) {
  // --- Kindle Configuration ---
  const [theme, setTheme] = useState<KindleTheme>('sepia');
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [fontFamily, setFontFamily] = useState<KindleFont>('serif');
  const [marginSize, setMarginSize] = useState<KindleMargin>('medium');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // --- Reading Progression ---
  const passages = getBookPassages(book);
  const [relativePageIndex, setRelativePageIndex] = useState<number>(0);

  // --- AI Explanations Board ---
  const [explanationMode, setExplanationMode] = useState<'meaning' | 'simple' | 'historical' | null>(null);
  const [explanationText, setExplanationText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // --- Custom Reading Selection & Interactive Paste ---
  const [customSelectedText, setCustomSelectedText] = useState<string>('');
  const [isPastingText, setIsPastingText] = useState<boolean>(false);
  const [pasteAreaValue, setPasteAreaValue] = useState<string>('');
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleCaptureSelection = () => {
    const selection = window.getSelection();
    const selectionText = selection?.toString();
    if (selectionText && selectionText.trim()) {
      setCustomSelectedText(selectionText.trim());
      setActiveTab('dossier');
      setShowCompanionOnMobile(true);
      triggerToast("Excelente! Trecho carregado no X-Ray. Escolha uma das ações inteligentes da IA abaixo.");
    } else {
      triggerToast("Por favor, selecione (marque em azul) primeiro um trecho do livro antes de usar este recurso.");
    }
  };

  // --- Mobile responsivity toggle ---
  const [showCompanionOnMobile, setShowCompanionOnMobile] = useState<boolean>(false);

  // --- Conversations Tab ("Conversar com o trecho") ---
  const [activeTab, setActiveTab] = useState<'dossier' | 'chat'>('dossier');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; timestamp: Date }>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // --- TTS Player Control States ---
  const [isPlayingTts, setIsPlayingTts] = useState<boolean>(false);
  const [isPausedTts, setIsPausedTts] = useState<boolean>(false);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // --- Kokoro TTS Player State ---
  const [ttsEngine, setTtsEngine] = useState<'kokoro' | 'native'>('kokoro');
  const [kokoroVoice, setKokoroVoice] = useState<string>('pt_neural');
  const [isTtsLoading, setIsTtsLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.15); // Default to slightly faster 1.15x for perfect understanding

  // Live speed adjustment
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const currentPassage: PassagePage = passages[relativePageIndex] || passages[0];

  // Colors config map corresponding to themes
  const themeClasses = {
    light: {
      bg: 'bg-[#F9F9F9]',
      text: 'text-[#111111]',
      border: 'border-[#E0E0E0]',
      panelBg: 'bg-[#FFFFFF]',
      titleColor: 'text-[#333333]',
      metaColor: 'text-[#666666]',
      buttonBg: 'bg-[#EAEAEA] hover:bg-[#DCDCDC]',
      accentText: 'text-[#5A5A40]',
      activePillBg: 'bg-[#111111] text-[#FFFFFF]',
      badgeBg: 'bg-stone-200 text-stone-800'
    },
    sepia: {
      bg: 'bg-[#F4ECD8]',
      text: 'text-[#3D2E1A]',
      border: 'border-[#E5D7B7]',
      panelBg: 'bg-[#FCF7ED]',
      titleColor: 'text-[#4A3B2C]',
      metaColor: 'text-[#7A6A56]',
      buttonBg: 'bg-[#EBDDBE] hover:bg-[#DBCFB3]',
      accentText: 'text-[#5A5A40]',
      activePillBg: 'bg-[#3D2E1A] text-[#F4ECD8]',
      badgeBg: 'bg-[#EBDDC0] text-[#3D2E1A]'
    },
    charcoal: {
      bg: 'bg-[#1A1A1A]',
      text: 'text-[#E1E1E1]',
      border: 'border-[#2D2D2D]',
      panelBg: 'bg-[#252525]',
      titleColor: 'text-[#FFFFFF]',
      metaColor: 'text-[#A0A0A0]',
      buttonBg: 'bg-[#333333] hover:bg-[#444444]',
      accentText: 'text-[#D0CB9E]',
      activePillBg: 'bg-[#E1E1E1] text-[#1A1A1A]',
      badgeBg: 'bg-stone-800 text-stone-300'
    },
    mint: {
      bg: 'bg-[#E8F3EB]',
      text: 'text-[#1D2E24]',
      border: 'border-[#D2E7D7]',
      panelBg: 'bg-[#F1FAF4]',
      titleColor: 'text-[#1E3F29]',
      metaColor: 'text-[#567562]',
      buttonBg: 'bg-[#DCECE0] hover:bg-[#CCDCCF]',
      accentText: 'text-[#3A5D4D]',
      activePillBg: 'bg-[#1D2E24] text-[#E8F3EB]',
      badgeBg: 'bg-[#D2E6D7] text-[#1D2E24]'
    }
  };

  const getFontFamilyClass = (font: KindleFont) => {
    switch (font) {
      case 'serif': return 'font-serif Georgia, "Times New Roman", serif';
      case 'sans': return 'font-sans "Inter", sans-serif';
      case 'mono': return 'font-mono "JetBrains Mono", monospace';
      case 'dyslexic': return 'font-sans tracking-wide leading-relaxed font-semibold';
    }
  };

  const getMarginClass = (margin: KindleMargin) => {
    switch (margin) {
      case 'narrow': return 'px-4 md:px-6 py-4';
      case 'medium': return 'px-6 md:px-16 py-6';
      case 'wide': return 'px-8 md:px-24 py-8';
    }
  };

  // Sync relative page turns to the global book progression
  // It updates the general reading stats on the client
  useEffect(() => {
    if (relativePageIndex >= 0) {
      // Calculate realistic page number to save
      // For instance: index=0 sets book's currentPage, index=1 adds extra.
      const multiplier = Math.max(1, Math.floor(book.totalPages / passages.length));
      const projectedPage = Math.min(book.totalPages, (relativePageIndex + 1) * multiplier);
      onPageUpdate(book.id, projectedPage);
    }
  }, [relativePageIndex]);

  // Reset or seed conversation when passage index or custom text selection changes
  useEffect(() => {
    setChatMessages([]);
    if (activeTab === 'chat') {
      const textIntro = customSelectedText 
        ? `Olá! Sou o mentor do e-reader Lumina.\n\nIdentifiquei que você selecionou um trecho específico do livro para debater:\n\n*"${customSelectedText}"*\n\nComo esse trecho específico se conecta com sua vida prática, ou qual é a sua dúvida analítica sobre ele? Pergunte-me diretamente abaixo!`
        : `Olá! Sou o mentor de Lumina.\n\nVamos debater de forma ativa este trecho de *"${book.title}"* de *${book.author || "Autor Desconhecido"}* (Página ${currentPassage.pageNumber}).\n\nComo esse pensamento reverbera na sua vida prática ou na modernidade? Você pode perguntar se ele se aplica à ansiedade moderna ou escrever sua dúvida abaixo!`;

      setChatMessages([
        {
          sender: 'assistant',
          text: textIntro,
          timestamp: new Date()
        }
      ]);
    }
  }, [relativePageIndex, customSelectedText, activeTab]);

  // Keep chat scrolled down smoothly
  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isChatLoading]);

  // Clean, dual-engine Kokoro / Native Speech Synthesis
  const executeTtsExplanation = async (textToSpeak: string) => {
    stopTts();

    if (!textToSpeak) return;

    // Strip out markdown syntax before reading for a super clean output sound
    const cleanText = textToSpeak.replace(/[\*\#\`\_\-\>]/g, ' ').trim();

    if (ttsEngine === 'kokoro') {
      setIsTtsLoading(true);
      setIsPlayingTts(false);
      setIsPausedTts(false);

      try {
        const response = await fetch('/api/tts/kokoro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voice: kokoroVoice,
            speed: 1.05
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Erro HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        const newAudio = new Audio(audioUrl);
        // Explicitly force selected playback rate matching user speed preferences
        newAudio.playbackRate = playbackSpeed;
        audioRef.current = newAudio;

        newAudio.onended = () => {
          setIsPlayingTts(false);
          setIsPausedTts(false);
          URL.revokeObjectURL(audioUrl);
        };

        newAudio.onerror = (e) => {
          console.error("Erro ao reproduzir áudio Kokoro:", e);
          setIsPlayingTts(false);
          setIsPausedTts(false);
          // Auto fallback to browser native
          executeNativeTts(cleanText);
        };

        setIsTtsLoading(false);
        setIsPlayingTts(true);
        setIsPausedTts(false);
        await newAudio.play();

      } catch (err: any) {
        console.warn("Kokoro TTS falhou, usando voz nativa como fallback:", err);
        setIsTtsLoading(false);
        executeNativeTts(cleanText);
      }
    } else {
      executeNativeTts(cleanText);
    }
  };

  const executeNativeTts = (cleanText: string) => {
    if (!('speechSynthesis' in window)) {
      alert("A síntese de voz (TTS) não é suportada neste navegador.");
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      // Apply selected native voice rate
      utterance.rate = playbackSpeed;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith('pt'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onend = () => {
        setIsPlayingTts(false);
        setIsPausedTts(false);
      };

      utterance.onerror = () => {
        setIsPlayingTts(false);
        setIsPausedTts(false);
      };

      ttsUtteranceRef.current = utterance;
      setIsPlayingTts(true);
      setIsPausedTts(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
      setIsPlayingTts(false);
      setIsPausedTts(false);
    }
  };

  const togglePauseTts = () => {
    if (ttsEngine === 'kokoro') {
      if (audioRef.current) {
        if (isPausedTts) {
          audioRef.current.play().catch(console.error);
          setIsPausedTts(false);
          setIsPlayingTts(true);
        } else {
          audioRef.current.pause();
          setIsPausedTts(true);
        }
      }
    } else {
      if (isPlayingTts) {
        if (isPausedTts) {
          window.speechSynthesis.resume();
          setIsPausedTts(false);
        } else {
          window.speechSynthesis.pause();
          setIsPausedTts(true);
        }
      }
    }
  };

  const stopTts = () => {
    // Cancel native synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Cancel active Kokoro playback
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (err) {
        console.error(err);
      }
      audioRef.current = null;
    }

    setIsPlayingTts(false);
    setIsPausedTts(false);
    setIsTtsLoading(false);
  };

  // Clean synthesis voices list on start
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      stopTts();
    };
  }, []);

  // Fetch Exegese/Explanations from Gemini API via server routes
  const requestAiAnalysis = async (mode: 'meaning' | 'simple' | 'historical') => {
    // Abort active TTS if active
    stopTts();

    setExplanationMode(mode);
    setExplanationText('');
    setAiError(null);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          passage: customSelectedText || currentPassage.text,
          mode: mode
        })
      });

      if (!response.ok) {
        throw new Error('Falha no processamento. Por favor, verifique sua conexão.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setExplanationText(data.explanation);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Houve um imprevisto ao entrar em contato com o assistente Gemini.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendChatMessage = async (msgText: string) => {
    if (!msgText.trim() || isChatLoading) return;

    // Abort active TTS
    stopTts();

    const userMsg = {
      sender: 'user' as const,
      text: msgText,
      timestamp: new Date()
    };

    // Update state synchronously for better responsiveness
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          passage: customSelectedText || currentPassage.text,
          question: msgText,
          history: chatMessages.slice(-8) // Take last 8 turns of context to stay under prompt limits safely
        })
      });

      if (!response.ok) {
        throw new Error('Falha no processamento. Por favor, verifique sua conexão.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setChatMessages(prev => [...prev, {
        sender: 'assistant' as const,
        text: data.reply,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        sender: 'assistant' as const,
        text: `Sinto muito. Tive um sobressalto ao cruzar pensamentos filosóficos: ${err.message || 'Erro na conexão com IA'}.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const activeStyles = themeClasses[theme];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col md:flex-row ${activeStyles.bg} selection:bg-stone-400/30 overflow-hidden font-serif`} id="kindle-container">
      
      {/* Dynamic interactive Toast alerts */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-neutral-900 text-neutral-100 dark:bg-stone-100 dark:text-stone-900 rounded-sm font-sans text-xs border border-neutral-700/50 dark:border-stone-200 shadow-xl flex items-center gap-2 max-w-[90%] text-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-semibold">{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT AREA: Kindle E-ink Screen Frame */}
      <div className={`flex-grow flex flex-col justify-between h-full border-r ${activeStyles.border} relative`} id="kindle-screen-main">
        
        {/* Kindle Top Status Bar */}
        <header className={`px-6 py-4 flex items-center justify-between border-b ${activeStyles.border} text-xs font-sans tracking-widest uppercase opacity-75`} id="kindle-header">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4" />
            <span className="font-extrabold truncate max-w-[200px] md:max-w-[320px]">{book.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-sm">
              Paperwhite Modo
            </span>
            {/* Companion toggle on mobile status bar */}
            <button 
              type="button" 
              onClick={() => setShowCompanionOnMobile(true)}
              className="md:hidden p-1.5 bg-[#5A5A40]/10 text-[#5A5A40] dark:bg-stone-800 dark:text-stone-300 rounded-full transition cursor-pointer flex items-center gap-1"
              title="Ver Dossiê e IA"
            >
              <Sparkles className="w-4 h-4 text-[#5A5A40] dark:text-stone-300" />
            </button>
            <button 
              type="button" 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
              title="Ajustar Tipografia e Temas"
            >
              <Type className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
              title="Fechar Kindle"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Kindle Typography Settings overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-[52px] left-4 right-4 z-20 ${activeStyles.panelBg} border ${activeStyles.border} shadow-xl p-5 space-y-4`}
              id="kindle-settings-box"
            >
              <div className="flex justify-between items-center pb-2 border-b border-black/5">
                <span className="text-xs uppercase font-sans tracking-wider font-bold">Configurações de Tela</span>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-xs font-sans tracking-wide opacity-50 hover:underline"
                >
                  Fechar [x]
                </button>
              </div>

              {/* FontSize slider */}
              <div className="flex items-center justify-between gap-4 text-xs font-sans">
                <span className="font-bold">Tamanho da Letra:</span>
                <div className="flex items-center gap-3.5">
                  <button 
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className={`px-3 py-1 border ${activeStyles.border} font-bold`}
                  >
                    A-
                  </button>
                  <span className="font-mono text-xs">{fontSize}px</span>
                  <button 
                    onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                    className={`px-3 py-1 border ${activeStyles.border} font-bold`}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Font Family selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-sans">
                {(['serif', 'sans', 'mono', 'dyslexic'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFontFamily(f)}
                    className={`py-1.5 px-2 border rounded-none transition uppercase tracking-wider text-[10px] font-bold ${
                      fontFamily === f 
                        ? activeStyles.activePillBg 
                        : `border-black/10 hover:border-black/30`
                    }`}
                  >
                    {f === 'serif' ? 'Serifa Clássica' : 
                     f === 'sans' ? 'Sem Serifa' : 
                     f === 'mono' ? 'Terminal' : 'Leitura Fluida'}
                  </button>
                ))}
              </div>

              {/* Theme presets */}
              <div className="grid grid-cols-4 gap-2 text-xs font-sans">
                {(['light', 'sepia', 'charcoal', 'mint'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`py-2 px-1 text-center border capitalize font-bold transition rounded-sm ${
                      theme === t 
                        ? `border-[#5A5A40] ring-1 ring-[#5A5A40]` 
                        : `border-black/10`
                    }`}
                  >
                    <span className="text-[11px]">{t}</span>
                  </button>
                ))}
              </div>

              {/* Margin sizes */}
              <div className="flex items-center justify-between gap-4 text-xs font-sans pt-2 border-t border-black/5">
                <span className="font-bold">Margens:</span>
                <div className="flex items-center gap-1.5">
                  {(['narrow', 'medium', 'wide'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarginSize(m)}
                      className={`text-[10px] py-1 px-3 border uppercase tracking-wider font-bold ${
                        marginSize === m 
                          ? activeStyles.activePillBg
                          : `border-black/5`
                      }`}
                    >
                      {m === 'narrow' ? 'Estreita' : m === 'medium' ? 'Normal' : 'Ampla'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voz do Assistente / Audiobook AI */}
              <div className="pt-3.5 border-t border-black/5 space-y-3 font-sans text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-bold flex items-center gap-1 text-stone-700 dark:text-stone-300">
                    <AudioLines className="w-3.5 h-3.5" /> Motor de Voz do Narrador:
                  </span>
                  
                  <div className="flex border border-black/10 dark:border-white/10 rounded-sm overflow-hidden text-[10px]">
                    <button
                      type="button"
                      onClick={() => { stopTts(); setTtsEngine('kokoro'); }}
                      className={`px-2.5 py-1 font-bold cursor-pointer transition ${
                        ttsEngine === 'kokoro' 
                          ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900' 
                          : 'bg-transparent text-stone-500 hover:bg-black/5'
                      }`}
                    >
                      Kokoro AI (Super Real)
                    </button>
                    <button
                      type="button"
                      onClick={() => { stopTts(); setTtsEngine('native'); }}
                      className={`px-2.5 py-1 font-bold cursor-pointer transition ${
                        ttsEngine === 'native' 
                          ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900' 
                          : 'bg-transparent text-stone-500 hover:bg-black/5'
                      }`}
                    >
                      Voz Nativa (Fluido Pt-BR)
                    </button>
                  </div>
                </div>

                {ttsEngine === 'kokoro' ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      Vozes Neurais de Alta Fidelidade (Super Realista):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-[10.5px]">
                      {[
                        { id: 'pt_neural', label: 'Voz Neural 🇧🇷 (Principal)' },
                        { id: 'pt_maria', label: 'Maria 🇧🇷 (Suave)' },
                        { id: 'pt_felipe', label: 'Felipe 🇧🇷 (Masculina)' },
                        { id: 'af_sarah', label: 'Sarah 🇺🇸 (Inglês)' },
                        { id: 'bf_emma', label: 'Emma 🇬🇧 (Britânico)' },
                        { id: 'es_isabella', label: 'Isabella 🇪🇸 (Espanhol)' }
                      ].map((v) => (
                        <button
                          key={v.id}
                          onClick={() => { stopTts(); setKokoroVoice(v.id); }}
                          className={`py-1 px-1.5 border text-left rounded-sm font-medium truncate transition cursor-pointer ${
                            kokoroVoice === v.id
                              ? 'bg-[#5A5A40] text-white border-transparent'
                              : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-normal">
                    Usando o sintetizador nativo do seu dispositivo. Ideal para escutar no idioma nativo <span className="font-bold underline">Português (pt-BR)</span> com pronúncia perfeita do livro.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kindle Inner Paper Content Body */}
        <div className="flex-grow flex flex-col justify-center items-center overflow-y-auto">
          <div className={`max-w-3xl w-full ${getMarginClass(marginSize)} transition-all duration-300`} id="kindle-text-stage">
            
            {/* Chapter Header within Kindle text */}
            <div className={`border-b ${activeStyles.border} pb-2 mb-6 font-sans text-xs tracking-widest uppercase opacity-60 flex justify-between`}>
              <span>{currentPassage.chapterTitle}</span>
              <span className="font-mono">Pág. {currentPassage.pageNumber}</span>
            </div>

            {/* Selection/Cursor Capture Toolbar */}
            <div className={`mb-6 p-3 rounded-sm border border-dashed ${activeStyles.border} bg-black/[0.015] dark:bg-white/[0.015] flex flex-col xs:flex-row items-center justify-between gap-3 text-xs font-sans`}>
              <div className="flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-[#5A5A40] shrink-0" />
                <span className="opacity-95 leading-relaxed text-[11px]">
                  {customSelectedText ? (
                    <span>
                      🎯 Trecho personalizado ativo (<strong className="underline font-bold text-[#5A5A40]">clique em X-Ray</strong> no painel para estudar).
                    </span>
                  ) : (
                    <span>
                      💡 <strong>Estudo Ativo:</strong> Marque qualquer parágrafo do livro com o cursor e clique em <b>Usar Seleção</b>!
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full xs:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCaptureSelection}
                  className="px-3 py-1.5 bg-[#5A5A40] text-white font-bold uppercase tracking-wider rounded-sm text-[10px] hover:bg-[#4A4A33] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Usar o texto selecionado em azul"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Usar Seleção
                </button>
                {customSelectedText && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSelectedText('');
                      triggerToast("Você retornou para o estudo da página inteira.");
                    }}
                    className="p-1 px-2 border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition rounded-sm text-[10px] cursor-pointer"
                    title="Limpar seleção ativa"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Main book text with custom sizes */}
            <p 
              className={`${getFontFamilyClass(fontFamily)} leading-[1.7] tracking-normal break-words whitespace-pre-line text-justify`}
              style={{ fontSize: `${fontSize}px` }} 
              id="kindle-passage-paragraph"
            >
              {currentPassage.text}
            </p>

            {/* Elegant, premium audiobook controller */}
            <div className={`mt-8 p-3 rounded-none border ${activeStyles.border} ${activeStyles.panelBg} flex flex-col sm:flex-row items-center justify-between gap-3 font-sans`} id="main-audiobook-player">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`p-2 rounded-sm border ${activeStyles.border} ${theme === 'charcoal' ? 'bg-stone-800' : 'bg-stone-100'} text-[#5A5A40]`}>
                  <AudioLines className={`w-4 h-4 ${isPlayingTts && !isPausedTts ? 'animate-pulse text-emerald-600 dark:text-emerald-400' : ''}`} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold leading-tight uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    {isTtsLoading ? "Sintetizando Voz..." : isPlayingTts ? (isPausedTts ? "Audiobook Pausado" : "Narrador Ativo") : "Audiobook Player"}
                  </p>
                   <p className="text-[9px] text-stone-500 dark:text-stone-400 mt-0.5 uppercase tracking-wide">
                    {ttsEngine === 'kokoro' ? 'Voz Neural de Alta Fidelidade' : 'Sintetizador do Navegador'}
                  </p>
                </div>
              </div>

              {/* Player controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {/* Speed multipliers */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold opacity-75 mr-1 hidden xs:inline">Velocidade:</span>
                  <div className={`flex border ${activeStyles.border} rounded-sm overflow-hidden text-[9px] font-mono font-bold bg-white dark:bg-stone-900`}>
                    {[1.0, 1.15, 1.3, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        title={`Reproduzir em ${speed}x`}
                        className={`px-1.5 py-1 select-none cursor-pointer transition ${
                          playbackSpeed === speed
                            ? 'bg-[#5A5A40] text-white'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Play/Pause & Stop bundle */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (isTtsLoading) return;
                      if (isPlayingTts) {
                        togglePauseTts();
                      } else {
                        executeTtsExplanation(`Lendo trecho de: ${book.title}. ${currentPassage.text}`);
                      }
                    }}
                    disabled={isTtsLoading}
                    className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-widest font-bold transition select-none cursor-pointer ${
                      isTtsLoading
                        ? 'bg-amber-600 text-white animate-pulse'
                        : isPlayingTts && !isPausedTts
                          ? 'bg-amber-700 hover:bg-amber-800 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                    }`}
                  >
                    {isTtsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isPlayingTts && !isPausedTts ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current animate-pulse" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isPausedTts ? "Retomar" : "Ouvir"}</span>
                      </>
                    )}
                  </button>

                  {/* Stop button to terminate current text stream entirely */}
                  {isPlayingTts && (
                    <button
                      type="button"
                      onClick={stopTts}
                      className="p-1.5 rounded-sm border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition cursor-pointer"
                      title="Parar áudio"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Page turn controls and bottom tracking */}
        <footer className={`px-6 py-4 border-t ${activeStyles.border} flex items-center justify-between font-sans text-xs`} id="kindle-footer">
          <button
            onClick={() => setRelativePageIndex(prev => Math.max(0, prev - 1))}
            disabled={relativePageIndex === 0}
            className={`px-3 py-1.5 border border-black/15 flex items-center gap-1 transition select-none rounded-none cursor-pointer ${
              relativePageIndex === 0 ? 'opacity-30 cursor-not-allowed' : `hover:bg-black/[0.04]`
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {/* Kindle Progress bar footer */}
          <div className="text-center font-mono opacity-80 flex flex-col items-center">
            <span>PÁGINA {relativePageIndex + 1} DE {passages.length}</span>
            <button
              onClick={() => setShowCompanionOnMobile(true)}
              className="md:hidden mt-1 px-3 py-1 bg-[#5A5A40]/10 text-[#5A5A40] hover:bg-[#5A5A40]/20 border border-[#5A5A40]/20 rounded-sm text-[9px] uppercase tracking-wider flex items-center gap-1 font-bold shadow-sm"
            >
              <Sparkles className="w-3 h-3" /> Dossiê e IA
            </button>
            <div className="w-24 bg-black/10 dark:bg-white/10 h-1 mt-1 overflow-hidden rounded-sm hidden xs:block">
              <div 
                className="bg-[#5A5A40] h-full" 
                style={{ width: `${((relativePageIndex + 1) / passages.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => setRelativePageIndex(prev => Math.min(passages.length - 1, prev + 1))}
            disabled={relativePageIndex === passages.length - 1}
            className={`px-3 py-1.5 border border-black/15 flex items-center gap-1 transition select-none rounded-none cursor-pointer ${
              relativePageIndex === passages.length - 1 ? 'opacity-30 cursor-not-allowed' : `hover:bg-black/[0.04]`
            }`}
          >
            Próxima <ChevronRight className="w-4 h-4" />
          </button>
        </footer>

      </div>

      {/* RIGHT AREA: Kindle Smart Companion Panel / Side Panel */}
      <div 
        className={`${
          showCompanionOnMobile 
            ? 'fixed inset-0 z-50 flex flex-col' 
            : 'hidden'
        } md:flex md:relative md:inset-auto md:z-0 md:w-[480px] md:shrink-0 md:h-full md:flex-col md:justify-between ${activeStyles.panelBg} border-t md:border-t-0 md:border-l ${activeStyles.border} overflow-hidden`}
        id="kindle-smart-panel"
      >
        {/* Panel Header */}
        <div className={`p-4 border-b ${activeStyles.border} flex justify-between items-center`} id="smart-panel-header">
          <div className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider font-bold">
            <Sparkles className="w-4 h-4 text-[#5A5A40]" />
            <span>X-Ray & Intelecto Ativo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono opacity-60 uppercase branding-text hidden xs:inline">E-Reader Inteligente</span>
            <button
              onClick={() => setShowCompanionOnMobile(false)}
              className="md:hidden px-3 py-1.5 bg-[#5A5A40] text-white font-sans text-[10px] uppercase font-bold tracking-wider rounded-sm transition cursor-pointer"
              title="Voltar para o livro"
            >
              Voltar ao Livro
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className={`flex border-b ${activeStyles.border} text-[10px] font-sans tracking-wider uppercase font-bold relative z-10 shrink-0`}>
          <button
            onClick={() => {
              setActiveTab('dossier');
              stopTts();
            }}
            className={`flex-1 py-3 text-center transition border-b-2 cursor-pointer ${
              activeTab === 'dossier' 
                ? 'border-[#5A5A40] text-[#5A5A40] font-extrabold' 
                : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            Dossiê Rápido
          </button>
          <button
            onClick={() => {
              setActiveTab('chat');
              stopTts();
              if (chatMessages.length === 0) {
                setChatMessages([
                  {
                    sender: 'assistant',
                    text: `Olá! Sou o mentor de Lumina.\n\nVamos debater de forma ativa este trecho de *"${book.title}"* de *${book.author || "Autor Desconhecido"}* (Página ${currentPassage.pageNumber}).\n\nComo esse pensamento reverbera na sua vida prática ou na modernidade? Você pode perguntar se ele se aplica à ansiedade moderna ou escrever sua dúvida abaixo!`,
                    timestamp: new Date()
                  }
                ]);
              }
            }}
            className={`flex-grow flex items-center justify-center gap-1 py-3 text-center transition border-b-2 cursor-pointer ${
              activeTab === 'chat' 
                ? 'border-[#5A5A40] text-[#5A5A40] font-extrabold' 
                : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
            Conversar com o Trecho
          </button>
        </div>

        {/* Panel Content Area (Assorted view of analysis output or chat output) */}
        <div className="flex-grow p-4 md:p-5 overflow-y-auto space-y-4 flex flex-col justify-between" id="smart-panel-body">
          
          {/* Active selection focus and paste overlay widget */}
          <div className={`p-3 rounded-sm border ${activeStyles.border} ${theme === 'charcoal' ? 'bg-stone-800/60' : 'bg-[#5A5A40]/5'} font-sans text-xs space-y-2 shrink-0`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A5A40] dark:text-[#D0CB9E] flex items-center gap-1.5 font-sans">
                {customSelectedText ? "🎯 Trecho Personalizado Ativo" : "📖 Trecho da Página Inteira"}
              </span>
              <div className="flex items-center gap-2">
                {customSelectedText && (
                  <button
                    onClick={() => {
                      setCustomSelectedText('');
                      triggerToast("Você retornou para o estudo da página inteira.");
                    }}
                    className="text-[9px] text-red-650 dark:text-red-400 uppercase font-extrabold hover:underline transition cursor-pointer"
                  >
                    Anular Trecho
                  </button>
                )}
              </div>
            </div>

            <div className="p-2 border-l-2 border-[#5A5A40] bg-black/[0.015] dark:bg-white/[0.01] max-h-[85px] overflow-y-auto">
              <p className="text-[11px] font-serif italic leading-relaxed opacity-95 text-stone-700 dark:text-stone-300">
                "{customSelectedText || currentPassage.text}"
              </p>
            </div>

            {/* Custom Paste controller */}
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
              {!isPastingText ? (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="opacity-65">Tem outro trecho? Cole e estude:</span>
                  <button
                    onClick={() => {
                      setIsPastingText(true);
                      setPasteAreaValue(customSelectedText || '');
                    }}
                    className="text-[#5A5A40] dark:text-stone-300 font-extrabold uppercase tracking-wide hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    ✍️ Copiar & Colar
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-left">
                  <textarea
                    value={pasteAreaValue}
                    onChange={(e) => setPasteAreaValue(e.target.value)}
                    placeholder="Cole aqui o trecho complicado do livro que deseja estudar por voz e texto..."
                    className="w-full text-[11px] p-2 leading-relaxed border border-black/15 dark:border-white/10 rounded-sm bg-white dark:bg-stone-900 font-serif focus:outline-none focus:border-[#5A5A40] text-stone-800 dark:text-stone-100 h-16 min-h-[50px] resize-none"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setIsPastingText(false);
                        setPasteAreaValue('');
                      }}
                      className="px-2 py-1 text-[9px] uppercase font-bold hover:bg-black/5 text-stone-500 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (pasteAreaValue.trim()) {
                          setCustomSelectedText(pasteAreaValue.trim());
                          setIsPastingText(false);
                          setPasteAreaValue('');
                          setActiveTab('dossier');
                          triggerToast("Sucesso! Trecho customizado definido como escopo do X-Ray.");
                        } else {
                          triggerToast("Insira um texto válido antes de fixar!");
                        }
                      }}
                      className="px-3 py-1 bg-[#5A5A40] text-white text-[9px] uppercase font-bold rounded-sm hover:bg-[#4A4A33] transition cursor-pointer"
                    >
                      Estudar este Trecho
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeTab === 'chat' ? (
            <div className="flex flex-col h-full justify-between gap-4" id="chat-tab-panel">
              {/* Messages viewport */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 max-h-[35vh] md:max-h-[calc(100vh-420px)]" id="chat-messages-scrollarea">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div 
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <span className="text-[9px] font-sans uppercase tracking-widest opacity-60 font-bold px-1 text-stone-500">
                        {isUser ? 'Você' : `Professor Lumina (${book.author || 'Autor'})`}
                      </span>
                      <div className={`p-3 rounded-lg text-xs leading-relaxed max-w-[90%] relative ${
                        isUser 
                          ? 'bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 font-sans' 
                          : `border border-[#5A5A40]/25 font-serif pl-4 relative ${activeStyles.bg}`
                      } ${activeStyles.text}`}>
                        {!isUser && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5A5A40] rounded-l-lg"></div>
                        )}
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {/* Audiobook narration per answer bubble */}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => executeTtsExplanation(msg.text)}
                          className="text-[9px] font-sans font-bold uppercase tracking-wider flex items-center gap-1 opacity-70 hover:opacity-100 mt-1 cursor-pointer hover:text-[#5A5A40] text-stone-500 pl-1"
                        >
                          <AudioLines className="w-3.5 h-3.5" /> Ouvir com Voz
                        </button>
                      )}
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex flex-col items-start space-y-1">
                    <span className="text-[9px] font-sans uppercase tracking-widest opacity-60 font-bold px-1 text-stone-500">
                      Intelecto ativo analisando...
                    </span>
                    <div className={`p-3.5 border border-dashed border-stone-300 dark:border-stone-700 bg-black/[0.015] text-xs font-serif italic text-stone-500 animate-pulse w-[80%] rounded-lg`}>
                      Cruzando a questão com os pilares teóricos da obra...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input section at the bottom */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3 shrink-0">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-sans uppercase tracking-wider opacity-60 font-bold text-stone-500">Sugestões rápidas:</p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      "Isso se aplica à ansiedade moderna?",
                      "Como posso exercitar ou aplicar essa reflexão no dia a dia?",
                      "Quais as contradições ou desafios desse pensamento?"
                    ].map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChatMessage(sug)}
                        disabled={isChatLoading}
                        className="text-[10px] text-left font-sans py-1.5 px-3 border border-black/15 dark:border-white/10 hover:border-[#5A5A40] hover:bg-black/[0.02] active:bg-black/[0.05] transition truncate cursor-pointer rounded-sm text-stone-600 dark:text-stone-300 disabled:opacity-50"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage(chatInput);
                  }}
                  className="flex items-center gap-2 border border-black/15 dark:border-white/15 p-1 bg-white dark:bg-stone-900 shadow-sm"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escreva sua pergunta ou reflexão sobre o trecho..."
                    disabled={isChatLoading}
                    className="flex-grow pl-3 pr-2 py-2 text-xs font-sans bg-transparent focus:outline-none dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="px-4 py-2 bg-[#5A5A40] text-white text-[10px] uppercase tracking-widest font-bold font-sans hover:bg-[#4A4A33] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          ) : (
            explanationMode === null ? (
              /* Introductory empty card placeholder */
              <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-8 flex-grow">
                <div className="p-4 bg-black/5 dark:bg-white/5 rounded-full">
                  <GraduationCap className="w-8 h-8 text-[#5A5A40]" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-sans uppercase tracking-widest font-bold">Análise do Trecho Ativo</h4>
                  <p className="text-xs opacity-75 font-serif italic text-stone-500">
                    Selecione um dos recursos inteligentes abaixo para decifrar as entrelinhas e o contexto literário com IA.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex-grow flex flex-col justify-between">
                <div>
                  {/* Category Subtitle of Active Assistance */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#5A5A40] opacity-85">
                      {explanationMode === 'meaning' && "💡 O que o autor quis dizer?"}
                      {explanationMode === 'simple' && "🌱 Explicação Simplificada"}
                      {explanationMode === 'historical' && "⏳ Contexto Histórico & Época"}
                    </span>
                    
                    {/* Visual loading marker */}
                    {isAiLoading && (
                      <span className="text-[10px] uppercase font-mono tracking-wide opacity-50 flex items-center gap-1 text-stone-500">
                        <Loader2 className="w-3 h-3 animate-spin" /> Processando...
                      </span>
                    )}
                  </div>

                  {/* Output Content Wrapper */}
                  <div className={`p-4 border ${activeStyles.border} bg-black/[0.015] leading-relaxed relative min-h-[140px] rounded-sm`}>
                    {isAiLoading ? (
                      <div className="py-12 text-center text-xs font-serif italic space-y-3 opacity-60">
                        <p className="animate-pulse text-stone-500">
                          {explanationMode === 'meaning' && "Desvendando nuances filosóficas e intenção lírica..."}
                          {explanationMode === 'simple' && "Traduzindo prosa complexa em parábolas cotidianas..."}
                          {explanationMode === 'historical' && "Mapeando o ano de publicação e correntes intelectuais..."}
                        </p>
                      </div>
                    ) : aiError ? (
                      <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-3 italic">
                        <p className="font-bold">Ocorreu um erro:</p>
                        <p>{aiError}</p>
                      </div>
                    ) : (
                      /* Standard Markdown formatting lookalike using rich text or split lines */
                      <div className={`text-xs md:text-sm font-serif space-y-2.5 whitespace-pre-line ${activeStyles.text}`} id="kindle-analysis-output">
                        {explanationText}
                      </div>
                    )}
                  </div>
                </div>

                {/* TTS Voice Player Controls UI */}
                {(explanationText && !isAiLoading) && (
                  <div className={`p-4 border ${activeStyles.border} bg-black/5 dark:bg-white/5 space-y-3 rounded-sm`} id="voice-player-widget">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                        <AudioLines className={`w-3.5 h-3.5 text-[#5A5A40] ${isPlayingTts && !isPausedTts ? 'animate-bounce' : ''}`} />
                        Player de Áudio Explicativo
                      </span>
                      <span className="text-[10px] font-mono text-[#5A5A40] font-bold">PT-BR</span>
                    </div>

                    {/* Player controls */}
                    <div className="flex items-center gap-2">
                      {/* Play/Pause Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isPlayingTts) {
                            togglePauseTts();
                          } else {
                            executeTtsExplanation(explanationText);
                          }
                        }}
                        className={`flex-grow py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider bg-[#5A5A40] hover:bg-[#4A4A33] text-white transition cursor-pointer`}
                      >
                        {isPlayingTts && !isPausedTts ? (
                          <span className="flex items-center gap-1"><Pause className="w-3.5 h-3.5" /> Pausar Voz</span>
                        ) : (
                          <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> Ouvir com Voz</span>
                        )}
                      </button>

                      {/* Stop Button */}
                      {isPlayingTts && (
                        <button
                          type="button"
                          onClick={stopTts}
                          className="p-2 border border-black/10 hover:bg-black/5 text-[#1A1A1A] dark:text-white transition cursor-pointer"
                          title="Ir para o início"
                        >
                          <Square className="w-4 h-4 fill-current animate-pulse" />
                        </button>
                      )}
                    </div>

                    {/* Aesthetic voice lines animation while playing */}
                    {isPlayingTts && !isPausedTts && (
                      <div className="flex justify-center items-center gap-1 py-1.5" id="voice-sound-waves">
                        {[1, 2, 3, 4, 5, 4, 3, 2, 5, 1, 3, 2].map((height, idx) => (
                          <div 
                            key={idx} 
                            className="w-1 bg-[#5A5A40] rounded-full" 
                            style={{ 
                              height: `${height * 3}px`,
                              animationDelay: `${idx * 150}ms`,
                              animationDuration: `${500 + height * 100}ms`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Action Buttons Hub (Bottom panel side area - visible if dossier tab) */}
        {activeTab === 'dossier' && (
          <div className={`p-4 border-t ${activeStyles.border} space-y-2 shrink-0`} id="action-buttons-hub">
            {/* Label indicating interactive study prompt */}
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] opacity-60 text-center font-bold pb-2 text-stone-500">
              Consulte a Obra no E-Reader
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="smart-reader-actions-grid">
              <button
                onClick={() => requestAiAnalysis('meaning')}
                disabled={isAiLoading}
                className={`py-2.5 px-3 text-left border rounded-none text-xs font-sans font-bold tracking-tight transition flex items-center justify-between cursor-pointer ${
                  explanationMode === 'meaning' 
                    ? activeStyles.activePillBg
                    : `border-black/10 dark:border-white/10 hover:border-black/25 ${activeStyles.buttonBg}`
                }`}
              >
                <span>O que o autor quis dizer?</span>
                <Sparkles className="w-3 h-3 text-[#5A5A40] opacity-50 shrink-0 ml-1" />
              </button>

              <button
                onClick={() => requestAiAnalysis('simple')}
                disabled={isAiLoading}
                className={`py-2.5 px-3 text-left border rounded-none text-xs font-sans font-bold tracking-tight transition flex items-center justify-between cursor-pointer ${
                  explanationMode === 'simple' 
                    ? activeStyles.activePillBg
                    : `border-black/10 dark:border-white/10 hover:border-black/25 ${activeStyles.buttonBg}`
                }`}
              >
                <span>Explique de forma simples</span>
                <GRAD_CAP_ICON className="w-3 h-3 text-[#5A5A40] opacity-50 shrink-0 ml-1" />
              </button>

              <button
                onClick={() => requestAiAnalysis('historical')}
                disabled={isAiLoading}
                className={`py-2.5 px-3 text-left border rounded-none text-xs font-sans font-bold tracking-tight transition flex items-center justify-between cursor-pointer ${
                  explanationMode === 'historical' 
                    ? activeStyles.activePillBg
                    : `border-black/10 dark:border-white/10 hover:border-black/25 ${activeStyles.buttonBg}`
                }`}
              >
                <span>Contexto histórico</span>
                <History className="w-3 h-3 text-[#5A5A40] opacity-50 shrink-0 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isTtsLoading) return;
                  if (isPlayingTts) {
                    togglePauseTts();
                  } else {
                    if (explanationText) {
                      executeTtsExplanation(explanationText);
                    } else {
                      executeTtsExplanation(`Lendo trecho de: ${book.title}. ${currentPassage.text}`);
                    }
                  }
                }}
                disabled={isTtsLoading}
                className={`py-2.5 px-3 text-left border rounded-none text-xs font-sans font-bold tracking-tight transition flex items-center justify-between cursor-pointer relative ${
                  isTtsLoading 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                    : isPlayingTts
                      ? isPausedTts
                        ? 'bg-[#5A5A40] hover:bg-[#4A4A33] text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                      : 'bg-[#5A5A40] hover:bg-[#4A4A33] text-white border-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isTtsLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sintetizando Voz...</span>
                    </>
                  ) : isPlayingTts ? (
                    isPausedTts ? (
                      <span>Retomar Narração</span>
                    ) : (
                      <>
                        <span className="flex items-center gap-0.5">
                          <span className="w-1 h-2 bg-white inline-block rounded-sm animate-bounce" />
                          <span className="w-1 h-3 bg-white inline-block rounded-sm animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1 h-1.5 bg-white inline-block rounded-sm animate-bounce [animation-delay:0.4s]" />
                        </span>
                        <span>Pausar Narração</span>
                      </>
                    )
                  ) : (
                    <span>Ouvir com Voz de IA</span>
                  )}
                </span>
                {isPlayingTts ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stopTts();
                    }}
                    className="p-1 hover:bg-black/15 dark:hover:bg-white/10 rounded-sm ml-1 select-none"
                    title="Parar áudio"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <AudioLines className="w-3.5 h-3.5 select-none ml-1 shrink-0" />
                )}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

// Temporary mapping workaround for icons with different capitalization names safely
function GRAD_CAP_ICON({ className }: { className?: string }) {
  return <GraduationCap className={className} />;
}
