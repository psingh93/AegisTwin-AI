import React, { useState } from 'react';
import { RouteId, CycloneData } from '../../types';
import {
  ShieldAlert,
  Activity,
  Cpu,
  Clock,
  Radio,
  Sliders,
  Sparkles,
  Bot,
  UserCheck,
  Compass,
  Building2,
  Users,
  BellRing,
  FileCheck2,
  Database,
  ExternalLink,
  ChevronDown,
  GitBranch,
  ShieldCheck
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface HeaderProps {
  currentRoute: RouteId;
  onNavigate: (route: RouteId) => void;
  cyclone: CycloneData;
  emergencyMode: boolean;
  onToggleEmergencyMode: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  onToggleCopilot: () => void;
  copilotOpen: boolean;
  onLaunchJudgeTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  cyclone,
  emergencyMode,
  onToggleEmergencyMode,
  demoMode,
  onToggleDemoMode,
  onToggleCopilot,
  copilotOpen,
  onLaunchJudgeTour
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems: { id: RouteId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'track', label: 'Cyclone Track', icon: <Compass className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'map', label: 'Risk Map', icon: <Radio className="w-3.5 h-3.5 text-rose-400" />, badge: 'CORE' },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'cascade', label: 'Cascade Engine', icon: <GitBranch className="w-3.5 h-3.5 text-rose-400" />, badge: 'CASCADE' },
    { id: 'mitigation', label: 'Mitigation Sim', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />, badge: 'OPTIMIZER' },
    { id: 'population', label: 'Population', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'alerts', label: 'Alerts', icon: <BellRing className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'planner', label: 'Emergency Plan', icon: <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Bot className="w-3.5 h-3.5 text-cyan-300" />, badge: 'AI' },
    { id: 'datasources', label: 'Data Sources', icon: <Database className="w-3.5 h-3.5 text-slate-400" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#05070a]/95 backdrop-blur-md border-b border-[#161f30] text-slate-100 select-none">
      {/* Top Operations Telemetry Ribbon */}
      <div className="bg-[#090d16] px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs border-b border-[#161f30] gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM OPERATIONAL</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 font-mono text-[11px] border-l border-slate-800 pl-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Update: <strong>14m ago (08:35 UTC)</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>AI Engine: <strong className="text-cyan-300">Gemini 3.8 Flash</strong></span>
            </span>
            <span>Confidence: <strong className="text-amber-300">{cyclone.confidenceScorePct}% Ensemble</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto font-mono text-xs">
          {/* Emergency Mode Toggle */}
          <button
            onClick={() => {
              playButtonClickTone();
              onToggleEmergencyMode();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
              emergencyMode
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500 ring-1 ring-rose-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Emergency Command Mode"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${emergencyMode ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
            <span>{emergencyMode ? 'EMERGENCY OPS ACTIVE' : 'STANDARD OPS'}</span>
          </button>

          {/* Demo Mode Badge */}
          <button
            onClick={() => {
              playButtonClickTone();
              onToggleDemoMode();
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
              demoMode
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <span>DEMO MODE</span>
          </button>

          {/* 2-Min Judge Tour Launcher */}
          <button
            onClick={() => {
              playButtonClickTone();
              onLaunchJudgeTour();
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-[11px] shadow-sm shadow-cyan-600/30 ring-1 ring-cyan-400/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">2-Min Judge Walkthrough</span>
            <span className="sm:hidden">Judge Tour</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => {
            playButtonClickTone();
            onNavigate('overview');
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded bg-[#0a101d] border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20 group-hover:border-cyan-400 transition-colors">
            <ShieldAlert className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-base sm:text-lg bg-gradient-to-r from-white via-cyan-100 to-slate-200 bg-clip-text text-transparent">
                CYCLONEGUARD
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                AI
              </span>
            </div>
            <p className="text-[8.5px] text-slate-400 tracking-wider uppercase font-mono hidden sm:block">
              SIMULATE THE IMPACT • PREVENT THE CASCADE
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-full">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playButtonClickTone();
                  onNavigate(item.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                    item.badge === 'CORE' ? 'bg-rose-500/80 text-white' : 'bg-cyan-400 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons: Copilot Toggle & User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              playButtonClickTone();
              onToggleCopilot();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono font-medium transition-colors cursor-pointer ${
              copilotOpen
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title="Toggle AI Decision Support Copilot Drawer"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Copilot</span>
          </button>

          {/* User Profile / Admin Button */}
          <div className="relative">
            <button
              onClick={() => {
                playButtonClickTone();
                setProfileOpen(!profileOpen);
              }}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-colors cursor-pointer text-xs"
              title="Disaster Operations Clearance Profile"
            >
              <div className="w-5 h-5 rounded bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono text-[10px] font-bold">
                HQ
              </div>
              <span className="hidden xl:inline text-slate-300 font-mono text-[11px]">Command Ops</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#0a0e17] border border-slate-800 rounded-lg shadow-2xl p-3 z-50 text-xs font-mono space-y-2">
                <div className="border-b border-slate-800 pb-2">
                  <div className="font-bold text-white font-sans">State Emergency Ops Center</div>
                  <div className="text-[10px] text-cyan-400">CLEARANCE: DEFENSE-OPS LEVEL 4</div>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>Role: Incident Commander</div>
                  <div>Jurisdiction: Bay of Bengal Coastal Sector</div>
                  <div>Ensemble Run: 08:30 UTC Active</div>
                </div>
                <div className="pt-1 border-t border-slate-800 flex justify-between">
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setProfileOpen(false);
                    }}
                    className="text-cyan-400 hover:underline cursor-pointer"
                  >
                    Switch Account
                  </button>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
