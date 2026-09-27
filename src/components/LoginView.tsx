import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, User, Loader2, LogIn, Lock, CheckCircle2, Building2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('प्रयोगकर्ता नाम र पासवर्ड अनिवार्य छन्।');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'लगइन गर्दा प्राविधिक समस्या उत्पन्न भयो।');
      setIsSubmitting(false);
    }
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f4f6f9] text-slate-900">
      {/* Top Government Ribbon */}
      <div className="bg-[#991b1b] text-white text-[11px] px-4 py-1 flex justify-between items-center font-medium tracking-wide">
        <div className="flex items-center space-x-2">
          <span>नेपाल सरकार (Government of Nepal)</span>
          <span className="opacity-60">|</span>
          <span>राष्ट्रिय सतर्कता केन्द्र</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span>सिंहदरबार, काठमाडौं</span>
        </div>
      </div>

      {/* Main Login Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white rounded border border-slate-200/90 shadow-[0_4px_16px_rgba(15,44,77,0.06)] p-6 sm:p-8">
          {/* Official Emblem & Header */}
          <div className="flex flex-col items-center mb-6 text-center space-y-2">
            <img
              src="/emblem.webp"
              alt="नेपालको निशाना छाप"
              className="w-16 h-16 object-contain drop-shadow-xs"
            />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold tracking-wider text-red-800 uppercase">
                राष्ट्रिय सतर्कता केन्द्र
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#0f2c4d] leading-snug">
                खरिद विधि परिपालना सहयोगी 
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                (Procurement Compliance Assistant)
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-3 border-red-700 text-red-800 text-xs rounded-r flex items-start space-x-2">
              <Shield className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                युजरनेम (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#0f2c4d] focus:border-[#0f2c4d] bg-white transition-colors"
                  placeholder="आफ्नो युजरनेम राख्नुहोस्"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#0f2c4d] focus:border-[#0f2c4d] bg-white transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex justify-center items-center py-2 px-4 rounded shadow-xs text-xs font-bold text-white bg-[#0f2c4d] hover:bg-[#153e6c] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0f2c4d] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting || isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-1.5" />
                  प्रणालीमा प्रवेश गर्नुहोस्
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
              <span>परीक्षण खाताहरू (Quick Login):</span>
              <span className="font-mono text-[10px] text-slate-400">DEMO ROLES</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemo('admin', 'admin123')}
                className="p-1.5 text-left border border-slate-200 hover:border-slate-300 rounded bg-slate-50/70 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Admin (एडमिन)</div>
                <div className="text-[10px] font-mono text-slate-400">admin / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('inspector', 'inspector123')}
                className="p-1.5 text-left border border-slate-200 hover:border-slate-300 rounded bg-slate-50/70 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Inspector (निरीक्षक)</div>
                <div className="text-[10px] font-mono text-slate-400">inspector / inspector123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('reviewer', 'reviewer123')}
                className="p-1.5 text-left border border-slate-200 hover:border-slate-300 rounded bg-slate-50/70 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Reviewer (समीक्षक)</div>
                <div className="text-[10px] font-mono text-slate-400">reviewer / reviewer123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('viewer', 'viewer123')}
                className="p-1.5 text-left border border-slate-200 hover:border-slate-300 rounded bg-slate-50/70 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="font-semibold text-slate-800">Viewer (अवलोकनकर्ता)</div>
                <div className="text-[10px] font-mono text-slate-400">viewer / viewer123</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Footer */}
      <footer className="py-3 px-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} राष्ट्रिय सतर्कता केन्द्र, सिंहदरबार।
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          सार्वजनिक खरिद ऐन, २०६३ तथा भ्रष्टाचार निवारण ऐन, २०५९ बमोजिम सुशासन प्रवर्द्धन प्रणाली
        </p>
      </footer>
    </div>
  );
};
