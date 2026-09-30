import React, { useState } from 'react';
import { RouteId } from '../../types';
import { POPULATION_EXPOSURE_DATA } from '../../data/mockData';
import {
  Users,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface PopulationExposureViewProps {
  onNavigate: (route: RouteId) => void;
}

export const PopulationExposureView: React.FC<PopulationExposureViewProps> = ({
  onNavigate
}) => {
  const [hoveredBar, setHoveredBar] = useState<{ district: string; label: string; value: number } | null>(null);
  const [hoveredDonut, setHoveredDonut] = useState<{ label: string; value: number; percent: number } | null>(null);

  const totalExposed = POPULATION_EXPOSURE_DATA.reduce((acc, d) => acc + d.exposedPopulation, 0);
  const totalHighRisk = POPULATION_EXPOSURE_DATA.reduce((acc, d) => acc + d.highRiskPopulation, 0);
  const totalVulnerable = POPULATION_EXPOSURE_DATA.reduce((acc, d) => acc + d.vulnerablePopulation, 0);
  const totalPriority = POPULATION_EXPOSURE_DATA.reduce((acc, d) => acc + d.evacuationPriorityPopulation, 0);

  const donutSegments = [
    { label: 'Priority Evac (0–3km)', value: totalPriority, color: '#ef4444' },
    { label: 'High Risk (Kutcha Homes)', value: totalHighRisk - totalPriority, color: '#f97316' },
    { label: 'Vulnerable (Elderly/Child)', value: totalVulnerable, color: '#eab308' },
    { label: 'General Impact Buffer', value: Math.max(0, totalExposed - totalHighRisk - totalVulnerable), color: '#0ea5e9' }
  ];

  const donutTotal = donutSegments.reduce((acc, s) => acc + s.value, 0);

  // Calculate SVG donut stroke-dasharray
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const maxValForBar = 500; // 500k scale

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#161f30] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              POPULATION IMPACT MODELING
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO / SIMULATED DATA
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Estimated Population Exposure & Vulnerability
          </h1>
          <p className="text-xs text-slate-400">
            Demographic exposure aggregation, thatched housing mortality risks, and shelter capacity matching.
          </p>
        </div>

        <button
          onClick={() => {
            playButtonClickTone();
            onNavigate('alerts');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>Step: Alert Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Main Population Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Exposed</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300">
            {(totalExposed / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Within 25km radius of storm center
          </div>
        </div>

        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>High Risk Population</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
            {(totalHighRisk / 1000).toFixed(0)}K
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Kutcha housing & tidal surge zone
          </div>
        </div>

        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Children & Elderly</span>
            <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
            {(totalVulnerable / 1000).toFixed(0)}K
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Requiring medical & mobility assistance
          </div>
        </div>

        <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Evacuation Priority</span>
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
            {(totalPriority / 1000).toFixed(0)}K
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Within 3km shoreline buffer
          </div>
        </div>
      </div>

      {/* Bespoke Responsive SVG Visualizations Grid (Bar & Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Comparison Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              District Population Exposure Breakdown (in Thousands)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              {hoveredBar ? `${hoveredBar.district} • ${hoveredBar.label}: ${hoveredBar.value}k` : 'Hover bars for details'}
            </span>
          </div>

          {/* SVG Grouped Bar Chart */}
          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 540 220" className="w-full h-56 font-mono text-[10px]">
              {/* Grid Lines */}
              {[0, 100, 200, 300, 400, 500].map((val) => {
                const y = 180 - (val / maxValForBar) * 150;
                return (
                  <g key={val}>
                    <line x1="45" y1={y} x2="525" y2={y} stroke="#172233" strokeDasharray="3 3" />
                    <text x="35" y={y + 3} textAnchor="end" fill="#64748b">{val}k</text>
                  </g>
                );
              })}

              {/* Bars per district */}
              {POPULATION_EXPOSURE_DATA.map((dist, idx) => {
                const groupX = 70 + idx * 115;
                const exposedK = Math.round(dist.exposedPopulation / 1000);
                const highRiskK = Math.round(dist.highRiskPopulation / 1000);
                const priorityK = Math.round(dist.evacuationPriorityPopulation / 1000);

                const h1 = (exposedK / maxValForBar) * 150;
                const h2 = (highRiskK / maxValForBar) * 150;
                const h3 = (priorityK / maxValForBar) * 150;

                return (
                  <g key={dist.district}>
                    {/* Bar 1: Exposed */}
                    <rect
                      x={groupX}
                      y={180 - h1}
                      width="18"
                      height={h1}
                      rx="3"
                      fill="#0ea5e9"
                      className="transition-all hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ district: dist.district, label: 'Exposed', value: exposedK })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Bar 2: High Risk */}
                    <rect
                      x={groupX + 22}
                      y={180 - h2}
                      width="18"
                      height={h2}
                      rx="3"
                      fill="#f97316"
                      className="transition-all hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ district: dist.district, label: 'High Risk', value: highRiskK })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Bar 3: Priority */}
                    <rect
                      x={groupX + 44}
                      y={180 - h3}
                      width="18"
                      height={h3}
                      rx="3"
                      fill="#ef4444"
                      className="transition-all hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ district: dist.district, label: 'Priority Evacuation', value: priorityK })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* District X-Axis Label */}
                    <text
                      x={groupX + 31}
                      y="198"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontWeight="bold"
                    >
                      {dist.district}
                    </text>
                  </g>
                );
              })}

              {/* Bottom Baseline */}
              <line x1="45" y1="180" x2="525" y2="180" stroke="#334155" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Bar Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-mono pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#0ea5e9]" />
              <span className="text-slate-300">Exposed Population</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#f97316]" />
              <span className="text-slate-300">High Risk (Coastal/Kutcha)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#ef4444]" />
              <span className="text-slate-300">Priority Evacuation</span>
            </div>
          </div>
        </div>

        {/* Donut Chart: Vulnerability Composition (5 cols) */}
        <div className="lg:col-span-5 bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Vulnerability Segmentation
            </h3>
            <span className="text-[10px] font-mono text-cyan-300">Total: 1.24M</span>
          </div>

          <div className="h-56 flex items-center justify-center relative">
            <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
              {donutSegments.map((seg, idx) => {
                const percent = (seg.value / donutTotal);
                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += percent;

                return (
                  <circle
                    key={idx}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="24"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all hover:opacity-80 cursor-pointer"
                    onMouseEnter={() => setHoveredDonut({ label: seg.label, value: seg.value, percent: Math.round(percent * 100) })}
                    onMouseLeave={() => setHoveredDonut(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {hoveredDonut ? (
                <>
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[120px]">{hoveredDonut.label}</span>
                  <span className="text-lg font-black font-mono text-white mt-0.5">{hoveredDonut.percent}%</span>
                  <span className="text-[10px] font-mono text-amber-300">{Math.round(hoveredDonut.value / 1000)}k</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Impact Zone</span>
                  <span className="text-xl font-black font-mono text-white">1.24M</span>
                  <span className="text-[10px] font-mono text-cyan-400">Total People</span>
                </>
              )}
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
            {donutSegments.map((seg, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="truncate">{seg.label}</span>
                </div>
                <span className="font-bold text-white shrink-0 ml-2">
                  {Math.round(seg.value / 1000)}k ({Math.round((seg.value / donutTotal) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Comparison Table */}
      <div className="bg-[#080d17] border border-[#161f30] rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#161f30] flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            District Exposure & Shelter Capacity Matching
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Census & Shelter Logistics Integration
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#05080f] text-slate-400 text-[10px] uppercase border-b border-[#161f30]">
              <tr>
                <th className="py-2.5 px-4">District</th>
                <th className="py-2.5 px-3">Total Pop</th>
                <th className="py-2.5 px-3">Exposed Pop</th>
                <th className="py-2.5 px-3">Kutcha Houses</th>
                <th className="py-2.5 px-3">Priority Evac</th>
                <th className="py-2.5 px-3">Active Shelters</th>
                <th className="py-2.5 px-4 text-right">Capacity vs Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121a29]">
              {POPULATION_EXPOSURE_DATA.map((dist) => {
                const occupancyRate = Math.round((dist.shelterOccupancy / dist.shelterCapacityTotal) * 100);
                return (
                  <tr key={dist.district} className="hover:bg-[#0c1322] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">{dist.district}</td>
                    <td className="py-3 px-3 text-slate-300">{dist.totalPopulation.toLocaleString()}</td>
                    <td className="py-3 px-3 text-cyan-300 font-bold">{dist.exposedPopulation.toLocaleString()}</td>
                    <td className="py-3 px-3 text-rose-400">{dist.kutchaHousingUnits.toLocaleString()}</td>
                    <td className="py-3 px-3 text-amber-300 font-bold">{dist.evacuationPriorityPopulation.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300">{dist.sheltersActive} Units</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${occupancyRate >= 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {dist.shelterOccupancy.toLocaleString()} / {dist.shelterCapacityTotal.toLocaleString()} ({occupancyRate}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
