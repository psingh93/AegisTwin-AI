import React, { useState } from 'react';
import { RouteId } from '../../types';
import {
  ShieldAlert,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { playButtonClickTone, playSuccessChime } from '../../utils/audio';

interface LoginPageProps {
  onNavigate: (route: RouteId) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('commander@aegistwin.org');
  const [password, setPassword] = useState('••••••••••••');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClickTone();
    setAuthNotice('Verifying command clearance...');
    setTimeout(() => {
      playSuccessChime();
      onNavigate('overview');
    }, 350);
  };

  const handleDemoAccess = () => {
    playButtonClickTone();
    playSuccessChime();
    onNavigate('overview');
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6 select-none animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded bg-[#0a101d] border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          CYCLONEGUARD AI
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          DISASTER DIGITAL TWIN • Incident Command Clearances
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-6 shadow-2xl space-y-4">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1.5 font-bold">
              Command Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#05080f] border border-slate-850 focus:border-cyan-500 rounded px-3 py-2 pl-9 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1.5 font-bold">
              Security Clearance Token / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#05080f] border border-slate-850 focus:border-cyan-500 rounded px-3 py-2 pl-9 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>
          </div>

          {authNotice && (
            <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              {authNotice}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            Sign In to Command Center
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center space-y-2">
          <div className="text-[11px] text-slate-400 font-mono">
            HACKATHON EVALUATION / JUDGE ACCESS:
          </div>

          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full py-2.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>1-Click DEMO ACCESS (Clearance Level 4)</span>
          </button>
        </div>
      </div>

      {/* Non-Production Disclaimer */}
      <div className="p-3 rounded bg-[#05080e] border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Demo Access grants full benchmark evaluation rights without server registration.</span>
      </div>
    </div>
  );
};
