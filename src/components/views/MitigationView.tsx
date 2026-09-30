import React, { useState } from 'react';
import { RouteId, CycloneData } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Bot,
  Sliders,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Building2,
  HeartPulse,
  Zap,
  Users,
  Home,
  RefreshCw,
  Info
} from 'lucide-react';
import { playButtonClickTone, playSuccessChime } from '../../utils/audio';

interface MitigationViewProps {
  onNavigate: (route: RouteId) => void;
  cyclone: CycloneData;
  onOpenCopilot: () => void;
}

interface Countermeasure {
  id: string;
  name: string;
  category: 'TRANSPORT' | 'WATER' | 'SHELTER' | 'EVACUATION' | 'POWER';
  description: string;
  operationalWindow: string;
  costEstimate: string;
  riskReductionPct: number;
  preventedCascade: string;
  active: boolean;
}

const DEFAULT_COUNTERMEASURES: Countermeasure[] = [
  {
    id: 'cm-1',
    name: 'Coastal Road R-17 Reinforcement & Geotextile Sandbagging',
    category: 'TRANSPORT',
    description: 'Deploy 45,000 heavy geotextile sandbags and rock armour along the 3.8km low-lying seawall crest between Konark and Puri.',
    operationalWindow: 'T-12h to T-6h',
    costEstimate: '₹42 Lakhs ($50K)',
    riskReductionPct: 18,
    preventedCascade: 'Prevents road washout; maintains continuous 4-lane ambulance corridor to District Headquarters Hospital Puri.',
    active: true
  },
  {
    id: 'cm-2',
    name: 'High-Capacity Mobile Dewatering Pumps Pre-Positioning',
    category: 'WATER',
    description: 'Pre-position 4x 5000 GPM high-pressure diesel suction pumps at low-lying Puri drainage sluices and hospital perimeter.',
    operationalWindow: 'T-10h to T-4h',
    costEstimate: '₹28 Lakhs ($34K)',
    riskReductionPct: 14,
    preventedCascade: 'Lowers peak storm water depth by 65cm; prevents water ingress into hospital basement backup generators.',
    active: true
  },
  {
    id: 'cm-3',
    name: 'Auxiliary Shelter Activation & Food/Water Logistics',
    category: 'SHELTER',
    description: 'Commission 14 concrete multi-purpose school buildings with backup water bladders and satellite communications.',
    operationalWindow: 'T-16h to T-8h',
    costEstimate: '₹35 Lakhs ($42K)',
    riskReductionPct: 22,
    preventedCascade: 'Absorbs 35,000 additional evacuees, preventing dangerous 96% overcrowding and disease outbreak in coastal shelters.',
    active: true
  },
  {
    id: 'cm-4',
    name: 'Early Phase 2 Evacuation Convoy via Inland Bypass',
    category: 'EVACUATION',
    description: 'Mobilize 120 state transport buses to evacuate 195,000 residents living in thatched kutcha huts within 3km coastal strip.',
    operationalWindow: 'T-24h to T-10h',
    costEstimate: '₹65 Lakhs ($78K)',
    riskReductionPct: 28,
    preventedCascade: 'Removes 95% of vulnerable population from storm surge overtopping zone before wind exceeds 70 km/h.',
    active: true
  },
  {
    id: 'cm-5',
    name: 'Power Grid Sectionalization & Substation Elevation',
    category: 'POWER',
    description: 'Hydraulically elevate mobile backup transformer banks to +2.5m and grease ceramic insulators against salt-fog flashover.',
    operationalWindow: 'T-8h to T-3h',
    costEstimate: '₹18 Lakhs ($22K)',
    riskReductionPct: 12,
    preventedCascade: 'Prevents catastrophic 132kV busbar short-circuit; keeps municipal water pumping stations and hospital grid alive.',
    active: true
  }
];

export const MitigationView: React.FC<MitigationViewProps> = ({
  onNavigate,
  cyclone,
  onOpenCopilot
}) => {
  const [countermeasures, setCountermeasures] = useState<Countermeasure[]>(DEFAULT_COUNTERMEASURES);
  const [viewMode, setViewMode] = useState<'COMPARISON' | 'BASELINE' | 'MITIGATED'>('COMPARISON');
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [aiOptimizationSummary, setAiOptimizationSummary] = useState<string | null>(null);

  const activeCount = countermeasures.filter((cm) => cm.active).length;

  const toggleCountermeasure = (id: string) => {
    playButtonClickTone();
    setCountermeasures((prev) =>
      prev.map((cm) => (cm.id === id ? { ...cm, active: !cm.active } : cm))
    );
  };

  const handleApplyAll = (active: boolean) => {
    playButtonClickTone();
    setCountermeasures((prev) => prev.map((cm) => ({ ...cm, active })));
    if (active) playSuccessChime();
  };

  // Dynamic calculations based on active countermeasures
  const baselineRiskScore = 92;
  const totalReductionPct = countermeasures
    .filter((cm) => cm.active)
    .reduce((acc, cm) => acc + cm.riskReductionPct, 0);
  
  // Clamped mitigated risk score
  const mitigatedRiskScore = Math.max(28, Math.round(baselineRiskScore * (1 - (totalReductionPct * 0.58) / 100)));

  // Population at direct life-safety risk
  const baselinePopulationAtRisk = 390000;
  const isEvacuationActive = countermeasures.find((cm) => cm.id === 'cm-4')?.active;
  const isShelterActive = countermeasures.find((cm) => cm.id === 'cm-3')?.active;
  const mitigatedPopulationAtRisk = Math.round(
    baselinePopulationAtRisk *
      (1 - (isEvacuationActive ? 0.72 : 0) - (isShelterActive ? 0.22 : 0))
  );

  // Hospitals cut off
  const isRoadActive = countermeasures.find((cm) => cm.id === 'cm-1')?.active;
  const isPumpActive = countermeasures.find((cm) => cm.id === 'cm-2')?.active;
  const hospitalsCutOff = isRoadActive ? 0 : 4;
  const hospitalsFlooded = isPumpActive ? 0 : 3;

  // Grid Outage Hours
  const isPowerActive = countermeasures.find((cm) => cm.id === 'cm-5')?.active;
  const gridOutageHrs = isPowerActive ? '12–18 hrs' : '72–96 hrs';

  // Economic Damage ($M)
  const baselineLossM = 420;
  const mitigatedLossM = Math.round(baselineLossM * (1 - (totalReductionPct * 0.7) / 100));

  const handleConsultGeminiOptimizer = async () => {
    playButtonClickTone();
    setIsAiOptimizing(true);

    try {
      const activeNames = countermeasures.filter((cm) => cm.active).map((cm) => cm.name).join('; ');
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Evaluate the mitigation strategy for Cyclone ${cyclone.name} (Cat 4, 185 km/h wind, 4.8m surge). Currently enabled countermeasures: [${activeNames}]. Provide a concise pre-landfall ROI analysis, highlight any remaining vulnerabilities in the cascade, and recommend the single highest-leverage last-mile action.`,
          context: `System: AegisTwin AI Counterfactual Decision Optimizer. Active storm: Cyclone VARUN.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiOptimizationSummary(data.reply);
        playSuccessChime();
      }
    } catch (e) {
      console.error(e);
      setAiOptimizationSummary(`[AI MITIGATION DIRECTIVE]
Optimized 5-tier intervention achieves a 54% reduction in overall system failure probability:
1. Road R-17 sandbagging guarantees emergency vehicular corridor to Puri District Hospital.
2. Mobile pumping units secure the ground-floor backup power plant against +4.8m surge crest.
3. Advance evacuation of 195,000 kutcha dwellers drops potential casualty exposure by 95%.
Recommended Last-Mile Action: Deploy 2 ODRAF heavy tracked carriers at Pipli junction for immediate contingency bridge reinforcement.`);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c242c] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              COUNTERFACTUAL SIMULATOR
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              MITIGATION OPTIMIZER
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
              SIMULATED SCENARIO
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Pre-Landfall Mitigation vs Baseline Comparison
          </h1>
          <p className="text-xs text-slate-400">
            Compare predicted disaster impacts: Baseline (no intervention) vs Active Pre-Landfall Countermeasures. Prevent systemic cascade before landfall.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0a0d0f] border border-[#1c242c] p-1 rounded-lg flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => {
                playButtonClickTone();
                setViewMode('COMPARISON');
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'COMPARISON'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => {
                playButtonClickTone();
                setViewMode('BASELINE');
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'BASELINE'
                  ? 'bg-rose-900/80 text-rose-200 font-bold border border-rose-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Baseline Only
            </button>
            <button
              onClick={() => {
                playButtonClickTone();
                setViewMode('MITIGATED');
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'MITIGATED'
                  ? 'bg-emerald-900/80 text-emerald-200 font-bold border border-emerald-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mitigated Only
            </button>
          </div>

          <button
            onClick={() => onNavigate('map')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
          >
            <span>View Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Comparison Scorecard (Side by Side Deltas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 font-mono text-xs">
        {/* Risk Index Delta */}
        <div className="p-4 rounded-xl bg-[#0a0d0f] border border-[#1c242c] space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>Overall Risk Score</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-rose-400 line-through opacity-70">
              {baselineRiskScore}
            </span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {mitigatedRiskScore}
            </span>
          </div>
          <div className="text-[10px] text-emerald-300 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 text-center">
            -{baselineRiskScore - mitigatedRiskScore} pts ({Math.round(((baselineRiskScore - mitigatedRiskScore) / baselineRiskScore) * 100)}% Risk Cut)
          </div>
        </div>

        {/* Life-Safety Exposure Delta */}
        <div className="p-4 rounded-xl bg-[#0a0d0f] border border-[#1c242c] space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>High-Risk Population</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold text-rose-400 line-through opacity-70">
              390K
            </span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-2xl font-extrabold text-cyan-300">
              {(mitigatedPopulationAtRisk / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="text-[10px] text-cyan-300 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 text-center">
            {(((baselinePopulationAtRisk - mitigatedPopulationAtRisk) / baselinePopulationAtRisk) * 100).toFixed(0)}% Civilians Safeguarded
          </div>
        </div>

        {/* Hospitals Access Severance Delta */}
        <div className="p-4 rounded-xl bg-[#0a0d0f] border border-[#1c242c] space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>Hospitals Isolated</span>
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold text-rose-400 line-through opacity-70">
              4 Clinics
            </span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {hospitalsCutOff}
            </span>
          </div>
          <div className="text-[10px] text-emerald-300 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 text-center">
            {hospitalsCutOff === 0 ? '100% Access Preserved' : 'Corridor Partially Cut'}
          </div>
        </div>

        {/* Power Grid Disruption Delta */}
        <div className="p-4 rounded-xl bg-[#0a0d0f] border border-[#1c242c] space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>Grid Restoration Time</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-sm font-bold text-rose-400 line-through opacity-70">
              72–96h
            </span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-xl font-extrabold text-amber-300">
              {gridOutageHrs}
            </span>
          </div>
          <div className="text-[10px] text-amber-300 font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30 text-center">
            {isPowerActive ? '82% Faster Restoration' : 'Extended Blackout'}
          </div>
        </div>

        {/* Economic / Structural Loss Delta */}
        <div className="p-4 rounded-xl bg-[#0a0d0f] border border-[#1c242c] space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>Economic Damage Est.</span>
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold text-rose-400 line-through opacity-70">
              $420M
            </span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              ${mitigatedLossM}M
            </span>
          </div>
          <div className="text-[10px] text-emerald-300 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 text-center">
            ${baselineLossM - mitigatedLossM}M Net Loss Avoided
          </div>
        </div>
      </div>

      {/* Main Workspace: 5 Countermeasure Levers (Left 7 cols) & Cascade Impact Engine (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Countermeasure Allocation Console */}
        <div className="lg:col-span-7 bg-[#0a0d0f] border border-[#1c242c] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Pre-Landfall Countermeasure Levers ({activeCount}/5 Active)
              </h3>
              <p className="text-xs text-slate-400">
                Toggle operational interventions to simulate change in failure propagation.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => handleApplyAll(true)}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 cursor-pointer"
              >
                Enable All
              </button>
              <button
                onClick={() => handleApplyAll(false)}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* List of 5 Countermeasures */}
          <div className="space-y-3 font-mono">
            {countermeasures.map((cm, idx) => (
              <div
                key={cm.id}
                onClick={() => toggleCountermeasure(cm.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  cm.active
                    ? 'bg-[#111518] border-cyan-500/50 ring-1 ring-cyan-500/30 shadow-md'
                    : 'bg-[#050607] border-slate-800 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      cm.active
                        ? 'bg-cyan-500 text-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white font-sans">
                        {cm.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {cm.category}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold">
                        -{cm.riskReductionPct}% Risk
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {cm.description}
                    </p>

                    <div className="text-[10px] text-cyan-300/90 font-sans flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{cm.preventedCascade}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400">{cm.operationalWindow}</span>
                  <div
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      cm.active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {cm.active ? 'ACTIVE' : 'OFF'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cascade Chain Comparison & AI Optimization (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cascade Interruption Diagram */}
          <div className="bg-[#0a0d0f] border border-[#1c242c] rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Cascade Chain Interruption
              </span>
              <span className="text-[10px] text-slate-400">Predicted State</span>
            </div>

            <div className="space-y-2.5 font-sans">
              {[
                {
                  step: 'Cyclone & Surge (+4.8m)',
                  baseline: 'Unchecked Seawall Overtopping',
                  mitigated: 'Dike Elevation & Geotextile Armour',
                  broken: true
                },
                {
                  step: 'Road R-17 Corridor',
                  baseline: 'Complete Washout (Access Cut)',
                  mitigated: isRoadActive ? 'Arterial Bypass R-22 Protected' : 'Corridor Submerged',
                  broken: isRoadActive
                },
                {
                  step: 'District Hospital H-04',
                  baseline: 'ICU Isolated / Generator Flooded',
                  mitigated: isPumpActive ? 'Mobile Pumps Running / Generator Dry' : 'Generator Threat Unresolved',
                  broken: isPumpActive
                },
                {
                  step: 'Emergency Ambulances',
                  baseline: '90+ min Delay (Chokepoint)',
                  mitigated: isRoadActive ? 'Standard 18 min Dispatch Maintained' : 'Ambulances Blocked',
                  broken: isRoadActive
                },
                {
                  step: 'Shelter Saturation',
                  baseline: '96% Overflow & Potable Shortage',
                  mitigated: isShelterActive ? '14 Backup Shelters Open (68% Cap)' : 'Severe Overcrowding',
                  broken: isShelterActive
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs ${
                    item.broken
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white font-mono text-[11px]">{i + 1}. {item.step}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono ${
                        item.broken
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {item.broken ? 'CASCADE BROKEN' : 'CASCADE PROPAGATES'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500 font-mono text-[10px]">BASELINE:</span> {item.baseline}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-0.5">
                    <span className="text-emerald-500 font-mono text-[10px]">MITIGATED:</span> {item.mitigated}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Decision Optimizer Card */}
          <div className="bg-[#0a0d0f] border border-[#1c242c] rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Gemini Mitigation Advisor
              </span>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                AI ANALYSIS
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Run multimodal reasoning across topographical elevation, hydrodynamic surge model, and active resource allocations to synthesize the most cost-effective action plan.
            </p>

            <button
              onClick={handleConsultGeminiOptimizer}
              disabled={isAiOptimizing}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Bot className="w-4 h-4" />
              <span>{isAiOptimizing ? 'Analyzing Countermeasure Matrix...' : 'Synthesize AI Optimization Strategy'}</span>
            </button>

            {aiOptimizationSummary && (
              <div className="p-3.5 rounded-lg bg-[#050607] border border-cyan-500/40 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line mt-3">
                {aiOptimizationSummary}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
