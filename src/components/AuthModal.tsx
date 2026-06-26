import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, Shield, X, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  message?: string | null;
}

const DEFAULT_ADMIN: User = {
  id: 'admin_default',
  email: 'admin@lumina.com',
  name: 'Administrador Lumina',
  isAdmin: true,
};

export default function AuthModal({ isOpen, onClose, onLoginSuccess, message = null }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Check against default admin
    if (email.toLowerCase() === DEFAULT_ADMIN.email && password === 'admin') {
      setSuccess('Login efetuado com sucesso!');
      setTimeout(() => {
        onLoginSuccess(DEFAULT_ADMIN);
        onClose();
        resetForm();
      }, 1000);
      return;
    }

    // Check in local users
    const usersStr = localStorage.getItem('lumina_registered_users');
    const users: (User & { password?: string })[] = usersStr ? JSON.parse(usersStr) : [];
    
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (matchedUser) {
      const { password: _, ...cleanUser } = matchedUser;
      setSuccess(`Bem-vindo(a), ${cleanUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(cleanUser);
        onClose();
        resetForm();
      }, 1000);
    } else {
      setError('Credenciais incorretas ou usuário não encontrado. Tente admin@lumina.com com a senha "admin" para testes.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Simple email validation
    if (!email.includes('@')) {
      setError('Insira um e-mail válido.');
      return;
    }

    // Check if email already exists
    const usersStr = localStorage.getItem('lumina_registered_users');
    const users: (User & { password?: string })[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase()) || email.toLowerCase() === DEFAULT_ADMIN.email) {
      setError('Este e-mail já está cadastrado.');
      return;
    }

    // Validate admin secret (optional)
    const wantsToBeAdmin = adminSecret.trim() !== '';
    if (wantsToBeAdmin && adminSecret.trim().toLowerCase() !== 'lumina') {
      setError('Chave de Administrador inválida. Deixe em branco para leitor comum ou use "lumina".');
      return;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      isAdmin: wantsToBeAdmin,
      password,
    };

    // Save user
    users.push(newUser);
    localStorage.setItem('lumina_registered_users', JSON.stringify(users));

    setSuccess('Cadastro realizado com sucesso!');
    setTimeout(() => {
      const { password: _, ...cleanUser } = newUser;
      onLoginSuccess(cleanUser);
      onClose();
      resetForm();
    }, 1200);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setAdminSecret('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[999]" id="auth-modal-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#FBF9F6] border border-black/10 shadow-2xl rounded-sm w-full max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden relative font-sans text-stone-800"
        id="auth-modal-content"
      >
        {/* Decorative Editorial Bar */}
        <div className="h-1 bg-[#5A5A40] w-full shrink-0" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer z-10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="p-4 sm:p-5 pb-3 sm:pb-3.5 text-center border-b border-stone-200/50 shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#5A5A40] font-bold">
            Portal do Leitor & Administração
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900 mt-1">
            Lumina <span className="font-light italic text-[#5A5A40]">Auth</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
            Faça login para gerenciar privilégios, personalizar leituras ou excluir obras.
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-stone-200/50 shrink-0" id="auth-tabs">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2.5 text-xs uppercase font-bold tracking-wider transition ${
              activeTab === 'login'
                ? 'border-b-2 border-[#5A5A40] text-stone-900 bg-white/40'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50/50'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2.5 text-xs uppercase font-bold tracking-wider transition ${
              activeTab === 'register'
                ? 'border-b-2 border-[#5A5A40] text-stone-900 bg-white/40'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50/50'
            }`}
          >
            Cadastrar-se
          </button>
        </div>

        {/* Form area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-4">
          {message && !success && (
            <div className="p-3 bg-amber-50/70 border border-amber-900/15 text-amber-900 text-xs rounded-md flex items-start gap-2.5 leading-relaxed">
              <Shield className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md leading-relaxed">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5" id="login-form">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-mono">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@lumina.com"
                    className="w-full pl-10 pr-4 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-mono">
                  Sua Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              {/* Default login tips */}
              <div className="bg-stone-50 border border-stone-200/50 p-2.5 rounded-md text-[10px] sm:text-[11px] text-stone-500 space-y-0.5">
                <p className="font-bold text-[#5A5A40] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Modo de Demonstração Rápido:
                </p>
                <p>E-mail: <code className="bg-stone-200/60 px-1 rounded font-mono select-all text-stone-700">admin@lumina.com</code></p>
                <p>Senha: <code className="bg-stone-200/60 px-1 rounded font-mono select-all text-stone-700">admin</code></p>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#5A5A40] hover:bg-[#4A4A33] text-white rounded-md text-xs uppercase font-bold tracking-widest transition shadow-sm hover:shadow cursor-pointer"
              >
                Entrar na Conta
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5" id="register-form">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-mono">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Machado de Assis"
                    className="w-full pl-10 pr-4 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-mono">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@lumina.com"
                    className="w-full pl-10 pr-4 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-mono">
                  Escolha uma Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-10 pr-4 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-stone-500" /> Chave Secreta de Admin
                  </label>
                  <span className="text-[10px] text-stone-400 font-sans italic">Opcional</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Chave secreta de administrador"
                    className="w-full pl-10 pr-4 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40] text-xs sm:text-sm bg-white placeholder-stone-400"
                  />
                </div>
                <p className="text-[10px] text-stone-500 leading-snug">
                  Necessária para habilitar exclusão de livros e gerenciamento completo do acervo.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#5A5A40] hover:bg-[#4A4A33] text-white rounded-md text-xs uppercase font-bold tracking-widest transition shadow-sm hover:shadow cursor-pointer"
              >
                Registrar e Acessar
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
