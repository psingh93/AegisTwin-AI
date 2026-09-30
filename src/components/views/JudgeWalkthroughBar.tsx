import React, { useState, useEffect } from 'react';
import { RouteId, InfrastructureAsset } from '../../types';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  Maximize2,
  Minimize2,
  CheckCircle2
} from 'lucide-react';
import { playButtonClickTone, playSuccessChime } from '../../utils/audio';

export interface JudgeStep {
  step: number;
  route: RouteId;
  title: string;
  instruction: string;
  action?: 'select-hospital' | 'open-ai-modal' | 'open-copilot' | 'generate-plan';
}

export const JUDGE_STEPS: JudgeStep[] = [
  {
    step: 1,
    route: 'landing',
    title: '1. Landing Page',
    instruction: 'Review mission statement, active simulation advisory pill, and core architecture.'
  },
  {
    step: 2,
    route: 'login',
    title: '2. Command Login',
    instruction: 'Demonstrate 1-Click Demo Access for emergency operations clearance.'
  },
  {
    step: 3,
    route: 'overview',
    title: '3. Command Center',
    instruction: 'Inspect 6 KPI cards (148 km/h wind, 1.24M pop, 47 assets, 8 hospitals).'
  },
  {
    step: 4,
    route: 'map',
    title: '4. Risk Map',
    instruction: 'Explore interactive GIS canvas, storm surge layer, and coastal lifeline nodes.'
  },
  {
    step: 5,
    route: 'infrastructure',
    title: '5. Infrastructure',
    instruction: 'Filter 47 assets across 8 categories (Hospitals, Bridges, Power, Shelters).'
  },
  {
    step: 6,
    route: 'cascade',
    title: '6. Cascade Engine',
    instruction: 'Reason through multi-tier dependency chains: Road R-17 cut -> Hospital access lost -> Ambulance delay -> Shelter stress.'
  },
  {
    step: 7,
    route: 'mitigation',
    title: '7. Mitigation Simulator',
    instruction: 'Compare Baseline vs Mitigated counterfactual outcomes (-52% risk reduction, 375,000 citizens protected).'
  },
  {
    step: 8,
    route: 'map',
    title: '8. Asset Risk Analysis',
    instruction: 'Review explainable AI risk score (87/100) and why District Hospital Puri is at risk.',
    action: 'open-ai-modal'
  },
  {
    step: 9,
    route: 'copilot',
    title: '9. AI Copilot',
    instruction: 'Ask Copilot: "What should authorities prioritize in next 6 hours?"',
    action: 'open-copilot'
  },
  {
    step: 10,
    route: 'planner',
    title: '10. 72-Hour Timeline & EAP',
    instruction: 'Review T-72h to Landfall inter-agency operational orders and interactive SOP checklists.',
    action: 'generate-plan'
  },
  {
    step: 11,
    route: 'alerts',
    title: '11. Alerts',
    instruction: 'Acknowledge live critical alerts and jump to affected infrastructure nodes on the map.'
  },
  {
    step: 12,
    route: 'population',
    title: '12. Population Exposure',
    instruction: 'Analyze demographic exposure, kutcha housing mortality risks, and shelter matching.'
  }
];

interface JudgeWalkthroughBarProps {
  currentRoute: RouteId;
  onNavigate: (route: RouteId) => void;
  onSelectHospitalAsset: () => void;
  onOpenAiAnalysisModal: () => void;
  onOpenCopilot: () => void;
  onClose: () => void;
}

export const JudgeWalkthroughBar: React.FC<JudgeWalkthroughBarProps> = ({
  currentRoute,
  onNavigate,
  onSelectHospitalAsset,
  onOpenAiAnalysisModal,
  onOpenCopilot,
  onClose
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentStep = JUDGE_STEPS[currentStepIndex];

  // Execute step-specific triggers
  const executeStep = (stepIdx: number) => {
    const target = JUDGE_STEPS[stepIdx];
    setCurrentStepIndex(stepIdx);
    onNavigate(target.route);

    if (target.action === 'select-hospital') {
      setTimeout(onSelectHospitalAsset, 150);
    } else if (target.action === 'open-ai-modal') {
      setTimeout(() => {
        onSelectHospitalAsset();
        onOpenAiAnalysisModal();
      }, 200);
    } else if (target.action === 'open-copilot') {
      setTimeout(onOpenCopilot, 150);
    }
  };

  const handleNext = () => {
    playButtonClickTone();
    const nextIdx = (currentStepIndex + 1) % JUDGE_STEPS.length;
    executeStep(nextIdx);
  };

  const handlePrev = () => {
    playButtonClickTone();
    const prevIdx = (currentStepIndex - 1 + JUDGE_STEPS.length) % JUDGE_STEPS.length;
    executeStep(prevIdx);
  };

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      const nextIdx = (currentStepIndex + 1) % JUDGE_STEPS.length;
      executeStep(nextIdx);
      playSuccessChime();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoPlay, currentStepIndex]);

  if (minimized) {
    return (
      <div className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => {
            playButtonClickTone();
            setMinimized(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/40 ring-1 ring-cyan-400 cursor-pointer animate-bounce"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Judge Walkthrough ({currentStepIndex + 1}/{JUDGE_STEPS.length})</span>
          <Maximize2 className="w-3 h-3 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="2-Minute Judge Walkthrough Navigator"
      className="fixed bottom-2 left-2 right-2 sm:left-4 sm:right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-50 select-none"
    >
      <div className="bg-[#080d17]/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-3 sm:p-4 shadow-2xl text-slate-100 ring-1 ring-cyan-500/30 space-y-2">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold font-mono">
              <Sparkles className="w-3 h-3 text-amber-300" />
              2-MINUTE JUDGE DEMONSTRATION TOUR
            </span>
            <span className="text-xs font-mono text-slate-400">
              Step <strong className="text-white">{currentStepIndex + 1}</strong> of {JUDGE_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                autoPlay
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
              title="Auto-advance through all steps every 12s"
            >
              {autoPlay ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3" />}
              <span className="hidden sm:inline">{autoPlay ? 'Auto-Advance ON' : 'Auto-Play'}</span>
            </button>

            <button
              onClick={() => setMinimized(true)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Info & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-cyan-300 text-sm">{currentStep.title}</div>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed font-sans">
              {currentStep.instruction}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer ring-1 ring-cyan-400/50 flex items-center gap-1"
            >
              <span>Next: {JUDGE_STEPS[(currentStepIndex + 1) % JUDGE_STEPS.length].title.split('.')[1]}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 12 Step Navigation Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1 border-t border-slate-800/80">
          {JUDGE_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => {
                playButtonClickTone();
                executeStep(idx);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap cursor-pointer transition-all ${
                idx === currentStepIndex
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : idx < currentStepIndex
                  ? 'bg-slate-850 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-950 text-slate-500 hover:text-slate-300'
              }`}
            >
              {s.step}. {s.title.split('.')[1]?.trim().split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
