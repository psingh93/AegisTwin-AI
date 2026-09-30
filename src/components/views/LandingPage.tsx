import React from 'react';
import { RouteId, CycloneData } from '../../types';
import {
  ShieldAlert,
  ArrowRight,
  Compass,
  Building2,
  Bot,
  FileCheck2,
  Sparkles,
  Waves,
  Wind,
  Users,
  Radio,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface LandingPageProps {
  onNavigate: (route: RouteId) => void;
  cyclone: CycloneData;
  onLaunchJudgeTour: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  cyclone,
  onLaunchJudgeTour
}) => {
  return (
    <div className="space-y-16 pb-20 select-none">
      {/* Top Advisory Pill */}
      <div className="flex justify-center pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-rose-300 font-bold">ACTIVE SIMULATION:</span>
          <span className="text-slate-200">Cyclone VARUN (148 km/h • Landfall T-12.75h)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
            DEMO
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2 flex-wrap text-[10px] font-mono font-bold">
          <span className="px-2.5 py-1 rounded bg-[#0a0d0f] border border-[#1c242c] text-cyan-400">
            EARTH ENGINE
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0a0d0f] border border-[#1c242c] text-emerald-400">
            GEMINI AI
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0a0d0f] border border-[#1c242c] text-blue-400">
            GEOSPATIAL INTELLIGENCE
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0a0d0f] border border-[#1c242c] text-amber-400">
            PREDICTIVE SIMULATION
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          CYCLONEGUARD AI
        </h1>

        <div className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-tight uppercase">
          SIMULATE THE IMPACT. PREVENT THE CASCADE.
        </div>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An AI-powered disaster digital twin for cyclone impact simulation, infrastructure vulnerability analysis, cascading-failure detection and pre-landfall decision support.
        </p>

        {/* Animated Sequence Ribbon */}
        <div className="flex items-center justify-center gap-2 flex-wrap py-2 text-[11px] font-mono text-slate-300">
          {['CYCLONE', 'RAINFALL', 'FLOOD / SURGE', 'INFRASTRUCTURE FAILURE', 'CASCADING IMPACT', 'AI MITIGATION', 'EARLY WARNING'].map((step, idx) => (
            <React.Fragment key={step}>
              <span className={`px-2 py-0.5 rounded font-bold ${
                idx === 3 || idx === 4
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : idx === 5
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : idx === 6
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#0a0d0f] border border-[#1c242c] text-slate-200'
              }`}>
                {step}
              </span>
              {idx < 6 && <span className="text-cyan-500 font-bold">→</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              playButtonClickTone();
              onNavigate('overview');
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all cursor-pointer ring-1 ring-cyan-400/50"
          >
            <span>LAUNCH DIGITAL TWIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playButtonClickTone();
              onLaunchJudgeTour();
              onNavigate('overview');
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0a0d0f] hover:bg-[#111518] border border-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>RUN DEMO SCENARIO</span>
          </button>
        </div>

        {/* 4 Feature Callouts below Hero */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 text-left font-mono">
          <div
            onClick={() => {
              playButtonClickTone();
              onNavigate('map');
            }}
            className="p-4 rounded-xl bg-[#080d17] border border-[#161f30] hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <Compass className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white font-sans group-hover:text-cyan-300">
              Impact Intelligence
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              Hydrodynamic surge & wind vector modeling
            </div>
          </div>

          <div
            onClick={() => {
              playButtonClickTone();
              onNavigate('infrastructure');
            }}
            className="p-4 rounded-xl bg-[#080d17] border border-[#161f30] hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <Building2 className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white font-sans group-hover:text-rose-300">
              Infrastructure Risk
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              47 lifelines across 8 critical sectors
            </div>
          </div>

          <div
            onClick={() => {
              playButtonClickTone();
              onNavigate('copilot');
            }}
            className="p-4 rounded-xl bg-[#080d17] border border-[#161f30] hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <Bot className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white font-sans group-hover:text-amber-300">
              AI Decision Support
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              Gemini-backed tactical decision assistant
            </div>
          </div>

          <div
            onClick={() => {
              playButtonClickTone();
              onNavigate('planner');
            }}
            className="p-4 rounded-xl bg-[#080d17] border border-[#161f30] hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <FileCheck2 className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white font-sans group-hover:text-emerald-300">
              Emergency Planning
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              SOP order synthesis & printable checklists
            </div>
          </div>
        </div>
      </div>

      {/* Core Workflow Diagram Section */}
      <div className="max-w-4xl mx-auto bg-[#080d17] border border-[#161f30] rounded-xl p-6 space-y-4 shadow-2xl">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
            SYSTEM ARCHITECTURE PIPELINE
          </span>
          <h2 className="text-lg font-bold text-white">
            From Meteorological Ingestion to Coordinated Action Order
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-[#05080f] border border-slate-800 text-center">
            <span className="text-cyan-400 block font-bold text-[11px]">1. CYCLONE</span>
            <span className="text-[10px] text-slate-400 font-sans">148 km/h Eye</span>
          </div>

          <div className="p-2.5 rounded bg-[#05080f] border border-slate-800 text-center">
            <span className="text-blue-400 block font-bold text-[11px]">2. RAINFALL</span>
            <span className="text-[10px] text-slate-400 font-sans">&gt;280mm/24h</span>
          </div>

          <div className="p-2.5 rounded bg-[#05080f] border border-slate-800 text-center">
            <span className="text-amber-400 block font-bold text-[11px]">3. SURGE</span>
            <span className="text-[10px] text-slate-400 font-sans">+4.8m Coastal</span>
          </div>

          <div className="p-2.5 rounded bg-[#05080f] border border-rose-500/30 text-center">
            <span className="text-rose-400 block font-bold text-[11px]">4. INFRA FAILURE</span>
            <span className="text-[10px] text-slate-400 font-sans">Road R-17 Scour</span>
          </div>

          <div className="p-2.5 rounded bg-[#05080f] border border-rose-500/40 text-center">
            <span className="text-rose-300 block font-bold text-[11px]">5. CASCADE</span>
            <span className="text-[10px] text-slate-400 font-sans">Hospital Cut Off</span>
          </div>

          <div className="p-2.5 rounded bg-[#05080f] border border-cyan-500/40 text-center">
            <span className="text-cyan-300 block font-bold text-[11px]">6. MITIGATION</span>
            <span className="text-[10px] text-slate-400 font-sans">Bypass R-22</span>
          </div>

          <div className="p-2.5 rounded bg-[#05080f] border border-emerald-500/40 text-center">
            <span className="text-emerald-400 block font-bold text-[11px]">7. WARNING</span>
            <span className="text-[10px] text-slate-400 font-sans">T-12h Lockdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};
