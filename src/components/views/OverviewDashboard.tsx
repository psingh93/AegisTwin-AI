import React from 'react';
import { RouteId, CycloneData, InfrastructureAsset, LiveAlert } from '../../types';
import {
  Wind,
  Waves,
  Users,
  Building2,
  HeartPulse,
  Home,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  Compass,
  Radio,
  FileCheck2,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface OverviewDashboardProps {
  onNavigate: (route: RouteId) => void;
  cyclone: CycloneData;
  assets: InfrastructureAsset[];
  alerts: LiveAlert[];
  onSelectAsset: (asset: InfrastructureAsset) => void;
  onOpenAiAnalysisModal: (asset: InfrastructureAsset) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  cyclone,
  assets,
  alerts,
  onSelectAsset,
  onOpenAiAnalysisModal
}) => {
  const criticalAssets = assets.filter((a) => a.riskLevel === 'CRITICAL');
  const highAssets = assets.filter((a) => a.riskLevel === 'HIGH');
  const hospitalsAtRisk = assets.filter((a) => a.type === 'Hospital' && a.riskScore >= 70).length;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-rose-950/70 via-[#0d1322] to-[#0a0f19] border border-rose-500/40 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider font-mono">
                  ACTIVE ADVISORY: {cyclone.name}
                </span>
                <span className="text-[11px] text-rose-300 font-mono">
                  CATEGORY: {cyclone.category}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono">
                  DEMO / SIMULATED DATA
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                Estimated Landfall in {cyclone.hoursToLandfall} Hours • {cyclone.targetRegion}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                playButtonClickTone();
                onNavigate('map');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Geospatial Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playButtonClickTone();
                onNavigate('copilot');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Primary Command Center KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3 font-mono">
        {/* 1. Cyclone Status */}
        <div className="bg-[#080d17] border border-[#161f30] hover:border-rose-500/50 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Cyclone Status</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-rose-400 leading-tight">
              CAT 4
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-slate-400 font-sans">{cyclone.name}</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">SIMULATED</span>
          </div>
        </div>

        {/* 2. Current Risk */}
        <div className="bg-[#080d17] border border-rose-500/40 hover:border-rose-500 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">Current Risk</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-rose-300 leading-tight">
              92<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-rose-400 font-sans font-bold">CRITICAL</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800">AI ANALYSIS</span>
          </div>
        </div>

        {/* 3. People Exposed */}
        <div className="bg-[#080d17] border border-[#161f30] hover:border-blue-500/50 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">People Exposed</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-cyan-300 leading-tight">
              1.24M
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-slate-400 font-sans">390K High Risk</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">SIMULATED</span>
          </div>
        </div>

        {/* 4. Critical Infrastructure */}
        <div className="bg-[#080d17] border border-[#161f30] hover:border-cyan-500/50 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Critical Infra</span>
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-white leading-tight">
              47
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-slate-400 font-sans">12 Severely Exposed</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">MONITORED</span>
          </div>
        </div>

        {/* 5. Hospitals at Risk */}
        <div className="bg-[#080d17] border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">Hospitals at Risk</span>
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-rose-300 leading-tight">
              {hospitalsAtRisk}
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-rose-400 font-sans">3 Direct Surge Cutoff</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800">AI ANALYSIS</span>
          </div>
        </div>

        {/* 6. Roads at Risk */}
        <div className="bg-[#080d17] border border-[#161f30] hover:border-amber-500/50 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Roads at Risk</span>
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-amber-300 leading-tight">
              14
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-amber-400 font-sans">4 Imminent Washouts</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">SIMULATED</span>
          </div>
        </div>

        {/* 7. Shelters */}
        <div className="bg-[#080d17] border border-[#161f30] hover:border-emerald-500/50 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Shelters</span>
              <Home className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-extrabold text-emerald-300 leading-tight">
              42
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-emerald-400 font-sans">68% Capacity (90K)</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">DEMO DATA</span>
          </div>
        </div>

        {/* 8. Next Critical Action */}
        <div className="bg-[#080d17] border border-cyan-500/40 hover:border-cyan-400 rounded-xl p-3 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold">Next Action</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="mt-1.5 text-xs font-bold text-white leading-snug font-sans line-clamp-2">
              Mandatory Evacuation Sector 4
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-cyan-300 font-mono">T-12h Lockdown</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800">AI DIRECTIVE</span>
          </div>
        </div>
      </div>

      {/* Center 2-Column Split: Geospatial Preview & High Risk Lifelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Map Viewport & Track Status (7 cols) */}
        <div className="lg:col-span-7 bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Geospatial Risk Sector Snapshot
              </h3>
              <p className="text-xs text-slate-400">
                Live radar reflectivity and forecast landfall trajectory
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Mini Interactive Map Preview */}
          <div
            onClick={() => onNavigate('map')}
            className="w-full h-56 bg-[#040810] rounded-lg border border-slate-800 overflow-hidden relative cursor-pointer group"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/20 group-hover:bg-cyan-950/30 transition-colors">
              <div className="text-center space-y-1">
                <Compass className="w-8 h-8 text-cyan-400 mx-auto group-hover:scale-110 transition-transform animate-spin" />
                <div className="text-xs font-bold text-white">Click to Open Full Interactive Map</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  16 Critical Lifeline Nodes Monitored
                </div>
              </div>
            </div>
          </div>

          {/* Track Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-[#05080f] border border-slate-800">
              <span className="text-[10px] text-slate-400 block">CURRENT POSITION</span>
              <span className="text-slate-200 font-bold">{cyclone.currentLat}°N, {cyclone.currentLng}°E</span>
            </div>
            <div className="p-2.5 rounded bg-[#05080f] border border-slate-800">
              <span className="text-[10px] text-slate-400 block">HEADING & SPEED</span>
              <span className="text-cyan-300 font-bold">{cyclone.movementDirection} @ {cyclone.movementSpeedKmh} km/h</span>
            </div>
            <div className="p-2.5 rounded bg-[#05080f] border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STORM SURGE</span>
              <span className="text-rose-400 font-bold">+{cyclone.stormSurgeExpectedM}m Crest</span>
            </div>
            <div className="p-2.5 rounded bg-[#05080f] border border-slate-800">
              <span className="text-[10px] text-slate-400 block">RAINFALL 24H</span>
              <span className="text-amber-300 font-bold">{cyclone.rainfall24hMm} mm</span>
            </div>
          </div>
        </div>

        {/* Right: Critical Infrastructure & Live Alerts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Critical Assets List */}
          <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-400" />
                Apex Infrastructure at Critical Risk
              </h3>
              <button
                onClick={() => onNavigate('infrastructure')}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {criticalAssets.slice(0, 4).map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    playButtonClickTone();
                    onSelectAsset(asset);
                    onOpenAiAnalysisModal(asset);
                  }}
                  className="p-3 rounded-lg bg-[#05080f] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {asset.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {asset.type} • {asset.district} District
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Risk {asset.riskScore}/100
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-sans">
                    {asset.aiRecommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Live Alerts */}
          <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Live Incident Bulletins
              </span>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Alert Center
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {alerts.slice(0, 2).map((alt) => (
                <div key={alt.id} className="p-2.5 rounded bg-[#05080f] border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-rose-400 font-bold">{alt.severity}: {alt.location}</span>
                    <span className="text-slate-400">{alt.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {alt.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
