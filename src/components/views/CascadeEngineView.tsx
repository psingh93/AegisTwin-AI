import React, { useState } from 'react';
import { RouteId, InfrastructureAsset, CascadeNode } from '../../types';
import { CASCADE_NODES, CASCADE_EDGES } from '../../data/mockData';
import { analyzeCascade } from '../../services/aiService';
import {
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Bot,
  AlertTriangle,
  Clock,
  Users,
  Compass,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';
import { playButtonClickTone, playSuccessChime } from '../../utils/audio';

interface CascadeEngineViewProps {
  onNavigate: (route: RouteId) => void;
  onSelectAssetById: (assetId: string) => void;
}

export const CascadeEngineView: React.FC<CascadeEngineViewProps> = ({
  onNavigate,
  onSelectAssetById
}) => {
  const [selectedNode, setSelectedNode] = useState<CascadeNode>(CASCADE_NODES[1]);
  const [isQueryingAi, setIsQueryingAi] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleAskGemini = async () => {
    playButtonClickTone();
    setIsQueryingAi(true);
    try {
      const res = await analyzeCascade(selectedNode.name, selectedNode.impactDescription);
      setAiInsight(res);
      playSuccessChime();
    } catch (err) {
      console.error(err);
    } finally {
      setIsQueryingAi(false);
    }
  };

  const handleFocusOnMap = (assetId?: string) => {
    playButtonClickTone();
    if (assetId) {
      onSelectAssetById(assetId);
    }
    onNavigate('map');
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#161f30] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              CASCADE ENGINE
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              INTER-DEPENDENCY REASONING
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Systemic Failure & Cascade Propagation Graph
          </h1>
          <p className="text-xs text-slate-400">
            Simulate the impact. Prevent the cascade. Model how initial storm overtopping triggers secondary power, water, and healthcare failure chains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playButtonClickTone();
              onNavigate('map');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>View Affected Nodes on Map</span>
          </button>
        </div>
      </div>

      {/* 4 Core Cascade Questions Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#080d17] border border-rose-500/40 space-y-1 shadow-lg">
          <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            01. WHAT FAILS FIRST?
          </div>
          <div className="text-white font-bold font-sans text-sm">Road R-17 Scoured</div>
          <p className="text-[10px] text-slate-400 font-sans">Surge overwash blocks coastal corridor at T-4h</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#080d17] border border-amber-500/40 space-y-1 shadow-lg">
          <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            02. WHAT FAILS NEXT?
          </div>
          <div className="text-white font-bold font-sans text-sm">Hospital H-04 Isolated</div>
          <p className="text-[10px] text-slate-400 font-sans">Ambulance transit choked; ICU DG flooded</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#080d17] border border-cyan-500/40 space-y-1 shadow-lg">
          <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            03. WHO IS AFFECTED?
          </div>
          <div className="text-white font-bold font-sans text-sm">280,000 Citizens</div>
          <p className="text-[10px] text-slate-400 font-sans">Trauma patients & 14 overcrowded shelters</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#080d17] border border-emerald-500/40 space-y-1 shadow-lg">
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            04. WHAT TO DO NOW?
          </div>
          <div className="text-white font-bold font-sans text-sm">Reroute via Bypass R-22</div>
          <p className="text-[10px] text-slate-400 font-sans">Deploy ODRAF amphibious boats + elevate DG</p>
        </div>
      </div>

      {/* Main Cascade Workspace: Visual Graph & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Cascade Graph Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              Dynamic Failure Propagation Chain
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Click node to inspect</span>
          </div>

          {/* Interactive SVG Cascade Diagram */}
          <div className="space-y-3 font-mono">
            {CASCADE_NODES.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <div key={node.id} className="relative">
                  <div
                    onClick={() => {
                      playButtonClickTone();
                      setSelectedNode(node);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                        : 'bg-[#05080f] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          node.failureStage === 'TRIGGER'
                            ? 'bg-rose-500 text-white'
                            : node.failureStage === 'FIRST TO FAIL'
                            ? 'bg-amber-500 text-black'
                            : node.failureStage === 'SECONDARY CASCADE'
                            ? 'bg-orange-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-xs font-sans">
                            {node.name}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                              node.status === 'CRITICAL' || node.status === 'FAILED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {node.failureStage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                          {node.impactDescription}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-xs text-slate-400 font-mono">
                      <div>T+{node.timeToFailureHrs}h Failure</div>
                      <div className="text-cyan-300 text-[11px] font-bold">
                        {(node.populationAffected / 1000).toFixed(0)}k Persons
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow between consecutive nodes */}
                  {index < CASCADE_NODES.length - 1 && (
                    <div className="flex justify-center my-1 text-slate-600">
                      <span className="text-xs">↓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Inspector & Gemini Reasoning Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Node Detail Card */}
          <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-cyan-300 uppercase px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  {selectedNode.type} • {selectedNode.failureStage}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedNode.name}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                {selectedNode.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="bg-[#05080e] p-3 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">
                  FAILURE MECHANISM & IMPACT:
                </span>
                <p className="font-sans text-slate-200 leading-relaxed">
                  {selectedNode.impactDescription}
                </p>
              </div>

              <div className="bg-[#05080e] p-3 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase block font-bold">
                  PRE-LANDFALL MITIGATION INTERVENTION:
                </span>
                <p className="font-sans text-emerald-200 leading-relaxed">
                  {selectedNode.mitigationAvailable}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleAskGemini}
                disabled={isQueryingAi}
                className="w-full py-2.5 rounded bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Bot className="w-4 h-4 text-amber-300" />
                <span>
                  {isQueryingAi ? 'Gemini Analyzing Cascades...' : 'Ask Gemini: What Fails Next?'}
                </span>
              </button>

              {selectedNode.assetId && (
                <button
                  onClick={() => handleFocusOnMap(selectedNode.assetId)}
                  className="w-full py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Highlight on Real Geographic Map</span>
                </button>
              )}
            </div>

            {/* AI Cascade Analysis Output */}
            {aiInsight && (
              <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs space-y-1.5 font-sans animate-fadeIn">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>GEMINI MULTI-VARIABLE CASCADE REASONING</span>
                </div>
                <div className="text-slate-200 leading-relaxed whitespace-pre-line text-[11px]">
                  {aiInsight}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
