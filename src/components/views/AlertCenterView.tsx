import React, { useState } from 'react';
import { RouteId, LiveAlert, InfrastructureAsset } from '../../types';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Radio,
  Eye,
  Check
} from 'lucide-react';
import { playButtonClickTone, playSuccessChime } from '../../utils/audio';

interface AlertCenterViewProps {
  alerts: LiveAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onNavigate: (route: RouteId) => void;
  onViewOnMap: (lat: number, lng: number, assetId?: string) => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onNavigate,
  onViewOnMap
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#161f30] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              TACTICAL ALERT DISSEMINATION
            </span>
            {unacknowledgedCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {unacknowledgedCount} UNACKNOWLEDGED
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Live Emergency Incident Alerts
          </h1>
          <p className="text-xs text-slate-400">
            Real-time critical bulletins, flood cut-offs, shelter capacity thresholds, and action commands.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => {
                playButtonClickTone();
                setFilterSeverity(sev);
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-4 sm:p-5 rounded-xl border transition-all ${
              alt.acknowledged
                ? 'bg-[#060a12]/80 border-slate-800/80 opacity-75'
                : alt.severity === 'CRITICAL'
                ? 'bg-[#0d101c] border-rose-500/50 shadow-lg shadow-rose-950/30'
                : 'bg-[#080d17] border-amber-500/40 shadow-lg shadow-amber-950/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    alt.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : alt.severity === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  }`}
                >
                  {alt.severity}
                </span>
                <span className="text-sm font-bold text-white">{alt.location}</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">• {alt.district}</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {alt.timestamp}
                </span>
                {alt.acknowledged && (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acknowledged
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 text-xs">
              <div className="md:col-span-8 space-y-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    REASON:
                  </span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed font-sans">{alt.reason}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                    RECOMMENDED ACTION:
                  </span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed font-sans">{alt.recommendedAction}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-4 flex sm:flex-col justify-end items-end gap-2 shrink-0">
                {!alt.acknowledged && (
                  <button
                    onClick={() => {
                      playSuccessChime();
                      onAcknowledgeAlert(alt.id);
                    }}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    playButtonClickTone();
                    onViewOnMap(alt.lat, alt.lng, alt.assetId);
                    onNavigate('map');
                  }}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View on Map</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
