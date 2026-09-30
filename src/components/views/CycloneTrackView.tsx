import React, { useState } from 'react';
import { RouteId, CycloneData, CycloneTrackPoint } from '../../types';
import {
  Compass,
  Wind,
  Gauge,
  Navigation,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface CycloneTrackViewProps {
  cyclone: CycloneData;
  onNavigate: (route: RouteId) => void;
}

export const CycloneTrackView: React.FC<CycloneTrackViewProps> = ({
  cyclone,
  onNavigate
}) => {
  const [selectedPoint, setSelectedPoint] = useState<CycloneTrackPoint>(cyclone.trackPoints[0]);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#161f30] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              METEOROLOGICAL TRAJECTORY ENGINE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO / SIMULATED DATA
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Cyclone Track & Meteorological Analysis
          </h1>
          <p className="text-xs text-slate-400">
            Multi-model ensemble trajectory, barometric pressure progression, and uncertainty cone.
          </p>
        </div>

        <button
          onClick={() => {
            playButtonClickTone();
            onNavigate('map');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>Plot on Geospatial Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Primary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            CURRENT POSITION
          </div>
          <div className="text-base sm:text-lg font-bold text-white">
            {cyclone.currentLat}°N, {cyclone.currentLng}°E
          </div>
          <div className="text-[10px] text-slate-500">Bay of Bengal Basin</div>
        </div>

        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-amber-400" />
            WIND SPEED
          </div>
          <div className="text-base sm:text-lg font-bold text-amber-300">
            {cyclone.currentWindKmh} km/h
          </div>
          <div className="text-[10px] text-slate-500">Gusts to {cyclone.gustWindKmh} km/h</div>
        </div>

        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-rose-400" />
            CENTRAL PRESSURE
          </div>
          <div className="text-base sm:text-lg font-bold text-rose-300">
            {cyclone.centralPressureHpa} hPa
          </div>
          <div className="text-[10px] text-slate-500">Severe Barometric Drop</div>
        </div>

        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-400" />
            MOVEMENT DIRECTION
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-300">
            {cyclone.movementDirection}
          </div>
          <div className="text-[10px] text-slate-500">Steered by Subtropical Ridge</div>
        </div>

        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            MOVEMENT SPEED
          </div>
          <div className="text-base sm:text-lg font-bold text-blue-300">
            {cyclone.movementSpeedKmh} km/h
          </div>
          <div className="text-[10px] text-slate-500">Forward Velocity</div>
        </div>
      </div>

      {/* Timeline Controls (T+0, T+6H, T+12H, T+24H, T+48H) */}
      <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Projected Track Timeline & Uncertainty Cone
            </h3>
            <p className="text-xs text-slate-400">
              Select a forecast time step to view positional confidence and wind shear estimates
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/40">
            Ensemble Confidence: {cyclone.confidenceScorePct}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {cyclone.trackPoints.map((pt) => {
            const isSelected = selectedPoint.timeStep === pt.timeStep;
            return (
              <button
                key={pt.timeStep}
                onClick={() => {
                  playButtonClickTone();
                  setSelectedPoint(pt);
                }}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500'
                    : 'bg-[#05080f] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {pt.timeStep}
                  </span>
                  <span className="text-[10px] text-slate-400">{pt.status}</span>
                </div>
                <div className="text-xs font-bold text-slate-100">{pt.label.split('(')[0]}</div>
                <div className="text-[11px] font-mono text-amber-300 mt-1">
                  {pt.windKmh} km/h • {pt.pressureHpa} hPa
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Cone Radius: ±{pt.uncertaintyRadiusKm} km
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Track Point Inspector */}
        <div className="p-4 rounded-lg bg-[#05080e] border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-cyan-400 font-bold uppercase">
              SELECTED WAYPOINT: {selectedPoint.label} ({selectedPoint.timeStep})
            </span>
            <span className="text-slate-400">STATUS: {selectedPoint.status.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
            <div>Coordinates: <strong className="text-white">{selectedPoint.lat}°N, {selectedPoint.lng}°E</strong></div>
            <div>Max Eyewall Winds: <strong className="text-amber-300">{selectedPoint.windKmh} km/h</strong></div>
            <div>Central Pressure: <strong className="text-rose-300">{selectedPoint.pressureHpa} hPa</strong></div>
            <div>Positional Error: <strong className="text-cyan-300">±{selectedPoint.uncertaintyRadiusKm} km</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
