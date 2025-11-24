
import React, { useState } from 'react';
import { ClipboardCheck, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (val: string) => {
    // Remove non-digits
    const digits = val.replace(/\D/g, '');
    // Ensure it starts with 7 or 8 (replace with 7)
    let clean = digits;
    if (digits.length > 0) {
      if (digits[0] === '8') clean = '7' + digits.slice(1);
      else if (digits[0] !== '7') clean = '7' + digits;
    }
    
    // Limit to 11 chars
    clean = clean.slice(0, 11);

    if (clean.length === 0) return '';
    if (clean.length < 2) return '+7';

    // Format: +7 (XXX) XXX-XX-XX
    let formatted = '+7';
    if (clean.length > 1) formatted += ' (' + clean.slice(1, 4);
    if (clean.length >= 5) formatted += ') ' + clean.slice(4, 7);
    if (clean.length >= 8) formatted += '-' + clean.slice(7, 9);
    if (clean.length >= 10) formatted += '-' + clean.slice(9, 11);
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);

    // Ensure API Key is selected for premium models
    try {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }
    } catch (err) {
      console.error("API Key check failed", err);
    }

    setTimeout(() => {
      onLogin(name);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-fade-in-up">
        
        {/* Logo/Icon Area */}
        <div className="flex justify-center mb-6">
           <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
             <ClipboardCheck size={48} className="text-white" />
           </div>
        </div>

        <h1 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">ДаирАвтопроверка</h1>
        <p className="text-center text-slate-500 mb-8 font-medium">Вход в систему эксперта</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">ФИО Эксперта</label>
            <input 
              type="text" 
              required 
              placeholder="Магомедов Магомед" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
              value={name} 
              onChange={e => setName(e.target.value)} 
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Телефон</label>
            <input 
              type="tel" 
              placeholder="+7 (999) 000-00-00" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
              value={phone} 
              onChange={handlePhoneChange} 
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={!name.trim() || loading}
            >
              {loading ? 'Авторизация...' : 'Начать работу'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
           <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
             <ShieldCheck size={14} />
             <span>Защищенное соединение v1.2</span>
           </div>
        </div>

      </div>
    </div>
  );
};
