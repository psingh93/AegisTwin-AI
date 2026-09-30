import React from 'react';
import { InfrastructureAsset, CycloneData } from '../../types';
import {
  ShieldAlert,
  X,
  Wind,
  Waves,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface AiRiskAnalysisModalProps {
  asset: InfrastructureAsset | null;
  cyclone: CycloneData;
  onClose: () => void;
  onOpenCopilotWithAsset?: (asset: InfrastructureAsset) => void;
}

export const AiRiskAnalysisModal: React.FC<AiRiskAnalysisModalProps> = ({
  asset,
  cyclone,
  onClose,
  onOpenCopilotWithAsset
}) => {
  if (!asset) return null;

  const getFactorBar = (level: string) => {
    switch (level) {
      case 'Critical':
        return { percent: 100, color: 'bg-rose-500', text: 'Critical', blocks: '██████████' };
      case 'High':
        return { percent: 80, color: 'bg-orange-500', text: 'High', blocks: '████████░░' };
      case 'Moderate':
        return { percent: 55, color: 'bg-yellow-500', text: 'Moderate', blocks: '██████░░░░' };
      default:
        return { percent: 25, color: 'bg-emerald-500', text: 'Low', blocks: '███░░░░░░░' };
    }
  };

  const windFactor = getFactorBar(asset.windExposure);
  const floodFactor = getFactorBar(asset.floodExposure);
  const surgeFactor = getFactorBar(asset.stormSurgeExposure);
  const roadFactor = getFactorBar(
    asset.accessibility === 'Good' ? 'Low' : asset.accessibility === 'Moderate' ? 'Moderate' : 'Critical'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-[#080d17] border border-[#1b273d] rounded-xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-[#0e1626] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  {asset.type} • {asset.district} District
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  GPS: {asset.lat}°N, {asset.lng}°E
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {asset.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Risk Score Banner */}
        <div className="bg-[#05080e] p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              AI RISK ASSESSMENT SCORE
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-extrabold font-mono ${
                asset.riskScore >= 80 ? 'text-rose-400' : asset.riskScore >= 60 ? 'text-amber-300' : 'text-emerald-400'
              }`}>
                {asset.riskScore}
              </span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ml-2 ${
                asset.riskLevel === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {asset.riskLevel} RISK
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Population Catchment: <strong className="text-slate-200">{asset.populationServed.toLocaleString()}</strong> citizens
            </div>
          </div>

          <div className="text-xs font-mono space-y-1 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
            <div>Estimated Disruption: <strong className="text-rose-300">{asset.estimatedDisruptionHrs}</strong></div>
            <div>Backup Power: <strong className="text-cyan-300">{asset.backupPower}</strong></div>
            <div>Road Access: <strong className="text-amber-300">{asset.accessibility}</strong></div>
          </div>
        </div>

        {/* Risk Factors Visual Bars */}
        <div className="space-y-3 font-mono text-xs">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Risk Factor Decomposition
          </div>

          <div className="space-y-2">
            {/* Wind Exposure */}
            <div className="flex items-center justify-between gap-3">
              <span className="w-28 text-slate-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Wind Exposure
              </span>
              <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                <div className={`h-full ${windFactor.color}`} style={{ width: `${windFactor.percent}%` }} />
              </div>
              <span className="w-20 text-right font-bold text-slate-200">{windFactor.text}</span>
            </div>

            {/* Flood Exposure */}
            <div className="flex items-center justify-between gap-3">
              <span className="w-28 text-slate-300 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-blue-400" />
                Flood Exposure
              </span>
              <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                <div className={`h-full ${floodFactor.color}`} style={{ width: `${floodFactor.percent}%` }} />
              </div>
              <span className="w-20 text-right font-bold text-slate-200">{floodFactor.text}</span>
            </div>

            {/* Storm Surge */}
            <div className="flex items-center justify-between gap-3">
              <span className="w-28 text-slate-300 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-indigo-400" />
                Storm Surge
              </span>
              <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                <div className={`h-full ${surgeFactor.color}`} style={{ width: `${surgeFactor.percent}%` }} />
              </div>
              <span className="w-20 text-right font-bold text-slate-200">{surgeFactor.text}</span>
            </div>

            {/* Road Access */}
            <div className="flex items-center justify-between gap-3">
              <span className="w-28 text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Road Access
              </span>
              <div className="flex-1 bg-slate-900 h-2.5 rounded overflow-hidden">
                <div className={`h-full ${roadFactor.color}`} style={{ width: `${roadFactor.percent}%` }} />
              </div>
              <span className="w-20 text-right font-bold text-slate-200">{roadFactor.text}</span>
            </div>
          </div>
        </div>

        {/* Explainable Reasoning Section */}
        <div className="space-y-2 bg-[#05080e] p-4 rounded-lg border border-slate-800">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WHY THIS AREA IS AT RISK (Explainable AI Synthesis)</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-200 font-sans leading-relaxed">
            {asset.explainableReasoning.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono shrink-0">0{idx + 1}.</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tactical Recommendation */}
        <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
            RECOMMENDED EMERGENCY DIRECTIVE:
          </div>
          <p className="text-slate-100 font-medium leading-relaxed">
            {asset.aiRecommendation}
          </p>
        </div>

        {/* Action Row */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Close Inspector
          </button>

          {onOpenCopilotWithAsset && (
            <button
              onClick={() => {
                onClose();
                onOpenCopilotWithAsset(asset);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <span>Consult Copilot for {asset.name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
