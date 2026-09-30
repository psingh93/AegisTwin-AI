import React, { useState } from 'react';
import { CycloneData, InfrastructureAsset, RouteId } from '../../types';
import { RealMap, MapActiveLayers } from '../map/RealMap';
import { EVACUATION_ROUTES } from '../../data/mockData';
import {
  Compass,
  Layers,
  Wind,
  Waves,
  Building2,
  Sparkles,
  HeartPulse,
  Zap,
  ArrowRight,
  ShieldAlert,
  GitBranch,
  SlidersHorizontal,
  CloudRain,
  Navigation,
  Eye,
  Users
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface InteractiveMapViewProps {
  cyclone: CycloneData;
  assets: InfrastructureAsset[];
  onSelectAsset: (asset: InfrastructureAsset) => void;
  selectedAsset: InfrastructureAsset | null;
  onOpenAiAnalysisModal: (asset: InfrastructureAsset) => void;
  onNavigate?: (route: RouteId) => void;
  onOpenCopilotWithAsset?: (asset: InfrastructureAsset) => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  cyclone,
  assets,
  onSelectAsset,
  selectedAsset,
  onOpenAiAnalysisModal,
  onNavigate,
  onOpenCopilotWithAsset
}) => {
  const [activeLayers, setActiveLayers] = useState<MapActiveLayers>({
    satellite: false,
    cycloneTrack: true,
    uncertaintyCone: true,
    windRadius: true,
    stormSurge: true,
    rainfall: true,
    infrastructure: true,
    populationExposure: true,
    evacuationRoutes: true
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const toggleLayer = (layerKey: keyof MapActiveLayers) => {
    playButtonClickTone();
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const filteredAssets = assets.filter((asset) => {
    if (selectedCategory === 'ALL') return true;
    return asset.type === selectedCategory;
  });

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Header & Category Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#161f30] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              GEOSPATIAL RISK & DEFENSE MAP
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              REAL GEOGRAPHIC BASEMAP
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SIMULATED HAZARD MODEL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Real Interactive Coastal Risk Map
          </h1>
          <p className="text-xs text-slate-400">
            WGS-84 real geographic coordinates, hydrodynamic surge overtopping, gale wind fields, and 31 lifeline nodes.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          {[
            { id: 'ALL', label: 'All Lifelines' },
            { id: 'Hospital', label: 'Hospitals' },
            { id: 'Power', label: 'Power Grid' },
            { id: 'Bridge', label: 'Bridges' },
            { id: 'Road', label: 'Roads' },
            { id: 'Port', label: 'Ports' },
            { id: 'Shelter', label: 'Shelters' },
            { id: 'Water', label: 'Water' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playButtonClickTone();
                setSelectedCategory(cat.id);
              }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'bg-[#080d17] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Workspace Layout (72% Map / 28% Intelligence & Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dominant Real Geographic Map Canvas (8 of 12 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <RealMap
            cyclone={cyclone}
            assets={filteredAssets}
            evacuationRoutes={EVACUATION_ROUTES}
            selectedAsset={selectedAsset}
            onSelectAsset={onSelectAsset}
            activeLayers={activeLayers}
            onToggleLayer={toggleLayer}
            height="640px"
            onOpenAiAnalysisModal={onOpenAiAnalysisModal}
          />

          {/* Quick Scenario & Cascade Jump Bar */}
          {onNavigate && (
            <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-slate-300">
                  Landfall Target: <strong>{cyclone.targetRegion}</strong> (+{cyclone.stormSurgeExpectedM}m Surge)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('cascade')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 font-bold transition-colors cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Open Cascade Engine</span>
                </button>
                <button
                  onClick={() => onNavigate('mitigation')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-emerald-300 border border-emerald-500/40 font-bold transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Mitigation Simulator</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Compact Intelligence Panel (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Asset Real-Time Vulnerability Profile */}
          {selectedAsset ? (
            <div className="bg-[#080d17] border border-[#1b273d] rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    {selectedAsset.type === 'Hospital' ? (
                      <HeartPulse className="w-4 h-4 text-rose-400" />
                    ) : selectedAsset.type === 'Power' ? (
                      <Zap className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Building2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-300 uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                      {selectedAsset.type} • {selectedAsset.district}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug font-sans">
                      {selectedAsset.name}
                    </h3>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      GPS: {selectedAsset.lat.toFixed(4)}°N, {selectedAsset.lng.toFixed(4)}°E
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    selectedAsset.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : selectedAsset.riskLevel === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  }`}
                >
                  {selectedAsset.riskLevel}
                </span>
              </div>

              {/* Primary KPI Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-400">RISK SCORE</div>
                  <div className="text-lg font-extrabold text-rose-400 mt-0.5">
                    {selectedAsset.riskScore} <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
                <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-400">DISRUPTION</div>
                  <div className="text-xs font-bold text-amber-300 mt-1">
                    {selectedAsset.estimatedDisruptionHrs}
                  </div>
                </div>
                <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-400">FLOOD EXPOSURE</div>
                  <div className="text-xs font-bold text-rose-300 mt-0.5">
                    {selectedAsset.floodExposure}
                  </div>
                </div>
                <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-400">ROAD ACCESS</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {selectedAsset.accessibility}
                  </div>
                </div>
              </div>

              {/* AI Tactical Directive */}
              <div className="space-y-1 bg-[#05080e] p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Tactical Directive</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  "{selectedAsset.aiRecommendation}"
                </p>
              </div>

              {/* Inspection Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    playButtonClickTone();
                    onOpenAiAnalysisModal(selectedAsset);
                  }}
                  className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>View Full AI Risk Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onOpenCopilotWithAsset && (
                  <button
                    onClick={() => {
                      playButtonClickTone();
                      onOpenCopilotWithAsset(selectedAsset);
                    }}
                    className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
                  >
                    Consult Copilot for {selectedAsset.name.split(' ')[0]}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#080d17] border border-[#1b273d] rounded-xl p-5 text-center space-y-2">
              <Building2 className="w-7 h-7 text-slate-500 mx-auto" />
              <div className="text-xs font-bold text-white">Select Any Lifeline Node</div>
              <p className="text-[11px] text-slate-400">
                Click any hospital, power substation, bridge, or shelter on the real map to inspect its real-time vulnerability.
              </p>
            </div>
          )}

          {/* Map Layer Controls Card */}
          <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Working Map Layer Toggles
              </span>
              <span className="text-[10px] text-slate-400">Real-Time</span>
            </div>

            <div className="space-y-2">
              {[
                { key: 'cycloneTrack', label: 'Cyclone Track & Eyewall', icon: <Wind className="w-3.5 h-3.5 text-rose-400" /> },
                { key: 'uncertaintyCone', label: '72h Uncertainty Cone', icon: <Compass className="w-3.5 h-3.5 text-amber-400" /> },
                { key: 'windRadius', label: 'Wind Radii (64kt, 50kt, 34kt)', icon: <Wind className="w-3.5 h-3.5 text-orange-400" /> },
                { key: 'stormSurge', label: 'Hydrodynamic Surge (+4.8m MSL)', icon: <Waves className="w-3.5 h-3.5 text-cyan-400" /> },
                { key: 'rainfall', label: 'Precipitation & Flood Grid', icon: <CloudRain className="w-3.5 h-3.5 text-blue-400" /> },
                { key: 'infrastructure', label: '47 Monitored Lifelines', icon: <Building2 className="w-3.5 h-3.5 text-emerald-400" /> },
                { key: 'populationExposure', label: 'Demographic Exposure Belts', icon: <Users className="w-3.5 h-3.5 text-rose-300" /> },
                { key: 'evacuationRoutes', label: 'Evacuation Corridors & Chokepoints', icon: <Navigation className="w-3.5 h-3.5 text-white" /> }
              ].map((layer) => {
                const isActive = activeLayers[layer.key as keyof MapActiveLayers];
                return (
                  <div
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key as keyof MapActiveLayers)}
                    className={`flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#05080f] border-slate-700 text-slate-100'
                        : 'bg-[#04060a] border-slate-900 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {layer.icon}
                      <span className="text-[11px] font-sans">{layer.label}</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
