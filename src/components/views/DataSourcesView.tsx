import React from 'react';
import { DATA_SOURCES } from '../../data/mockData';
import {
  Database,
  ShieldCheck,
  Cpu,
  Info,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="border-b border-[#161f30] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            TRANSPARENCY & DATA INTEGRITY
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
          Data Sources & Integration Architecture
        </h1>
        <p className="text-xs text-slate-400">
          Strict technical transparency regarding active simulations, connected APIs, and AI-generated analysis layers.
        </p>
      </div>

      {/* Transparency Policy Box */}
      <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-3 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Data Provenance & Disclosure Standard
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
              To preserve scientific and emergency integrity, CycloneGuard AI explicitly classifies all telemetry layers into <strong>DEMO DATASET</strong>, <strong>LIVE DATA</strong>, or <strong>AI ANALYSIS</strong>. We do not invent official meteorological authorizations or claim simulated predictions as live governmental forecasts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
          <div className="p-3 rounded bg-[#05080e] border border-amber-500/30">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 block w-fit mb-1">
              DEMO DATASET
            </span>
            <p className="text-slate-400 text-[11px] font-sans">
              Calibrated numerical models for the Cyclone VARUN scenario, demonstrating hydrodynamic surge and asset vulnerability without fabricating active real-world alerts.
            </p>
          </div>

          <div className="p-3 rounded bg-[#05080e] border border-cyan-500/30">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 block w-fit mb-1">
              AI ANALYSIS
            </span>
            <p className="text-slate-400 text-[11px] font-sans">
              Server-side intelligence synthesis powered by Google Gemini 3.8 Flash, deriving explainable risk scores and tactical SOP directives from telemetry.
            </p>
          </div>

          <div className="p-3 rounded bg-[#05080e] border border-emerald-500/30">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 block w-fit mb-1">
              LIVE DATA READY
            </span>
            <p className="text-slate-400 text-[11px] font-sans">
              Modular service architecture prepared for direct ingestion of live CAP (Common Alerting Protocol) XML feeds and NetCDF atmospheric files.
            </p>
          </div>
        </div>
      </div>

      {/* Catalog of Data Sources */}
      <div className="space-y-3 font-mono text-xs">
        {DATA_SOURCES.map((ds) => (
          <div
            key={ds.id}
            className="p-4 sm:p-5 rounded-xl bg-[#080d17] border border-[#161f30] space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-sm font-sans">{ds.name}</span>
                <span className="text-[11px] text-slate-400">({ds.category})</span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                  ds.sourceType === 'AI ANALYSIS'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {ds.sourceType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-8 space-y-1 font-sans">
                <div className="text-[11px] text-slate-400 font-mono">
                  Provider / Engine: <strong className="text-slate-200">{ds.provider}</strong> • Refresh: {ds.updateFrequency}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed pt-1">
                  {ds.description}
                </p>
              </div>

              <div className="md:col-span-4 bg-[#05080e] p-3 rounded border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase text-slate-400 font-bold">
                  INGESTED TELEMETRY PARAMETERS:
                </div>
                <div className="space-y-0.5 text-[11px] text-cyan-300 font-mono">
                  {ds.parameters.map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
