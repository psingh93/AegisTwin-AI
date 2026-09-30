import React, { useState } from 'react';
import { RouteId, InfrastructureAsset, InfrastructureCategory, RiskLevel } from '../../types';
import { CATEGORY_STATISTICS } from '../../data/mockData';
import {
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HeartPulse,
  School,
  Train,
  Zap,
  Waves,
  Radio,
  Home
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

interface InfrastructureRiskViewProps {
  assets: InfrastructureAsset[];
  onSelectAsset: (asset: InfrastructureAsset) => void;
  onOpenAiAnalysisModal: (asset: InfrastructureAsset) => void;
  onNavigate: (route: RouteId) => void;
}

export const InfrastructureRiskView: React.FC<InfrastructureRiskViewProps> = ({
  assets,
  onSelectAsset,
  onOpenAiAnalysisModal,
  onNavigate
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'riskScore' | 'name' | 'district'>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'Hospital': return <HeartPulse className="w-3.5 h-3.5 text-rose-400" />;
      case 'School': return <School className="w-3.5 h-3.5 text-amber-400" />;
      case 'Bridge': return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'Road': return <Train className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Power': return <Zap className="w-3.5 h-3.5 text-amber-300" />;
      case 'Water': return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Telecom': return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      case 'Shelter': return <Home className="w-3.5 h-3.5 text-emerald-300" />;
      default: return <Building2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const handleSort = (field: 'riskScore' | 'name' | 'district') => {
    playButtonClickTone();
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAssets = assets
    .filter((a) => {
      const matchType = selectedType === 'ALL' || a.type === selectedType;
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      if (sortField === 'riskScore') {
        return sortAsc ? a.riskScore - b.riskScore : b.riskScore - a.riskScore;
      }
      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return sortAsc ? a.district.localeCompare(b.district) : b.district.localeCompare(a.district);
    });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#161f30] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              INFRASTRUCTURE VULNERABILITY ENGINE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Critical Infrastructure Risk Portfolio
          </h1>
          <p className="text-xs text-slate-400">
            Sector-wide vulnerability aggregation, flood/wind exposure ratings, and explainable AI risk assessments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('map')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>View on Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 8 Category Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono text-xs">
        {CATEGORY_STATISTICS.map((cat) => {
          const isSelected = selectedType === cat.type;
          return (
            <button
              key={cat.type}
              onClick={() => {
                playButtonClickTone();
                setSelectedType(selectedType === cat.type ? 'ALL' : cat.type);
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-500 ring-1 ring-cyan-500 shadow-lg'
                  : 'bg-[#080d17] border-[#161f30] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                {getCategoryIcon(cat.type)}
                <span className="text-[10px] text-slate-400">Tot: {cat.total}</span>
              </div>
              <div className="font-bold text-white text-xs truncate font-sans">{cat.label}</div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-rose-400 font-bold">{cat.critical} Crit</span>
                <span className="text-amber-400">{cat.high} High</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Table Filter Controls */}
      <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">Filter by Category:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#05080f] border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Categories (47 Assets)</option>
            <option value="Hospital">Hospitals</option>
            <option value="School">Schools & Relief Centers</option>
            <option value="Bridge">Bridges & Causeways</option>
            <option value="Road">Arterial Roads</option>
            <option value="Power">Power & Transmission</option>
            <option value="Water">Water & Sea Dikes</option>
            <option value="Telecom">Telecom & Communications</option>
            <option value="Shelter">Cyclone Shelters</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search asset, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#05080f] border border-slate-800 focus:border-cyan-500 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* Sortable Table */}
      <div className="bg-[#080d17] border border-[#161f30] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#05080f] border-b border-[#161f30] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asset</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Type</th>
                <th
                  onClick={() => handleSort('district')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>District</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('riskScore')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Wind Exposure</th>
                <th className="py-3 px-3">Flood Exposure</th>
                <th className="py-3 px-3">Accessibility</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121a29] font-mono text-[11px]">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => {
                    playButtonClickTone();
                    onSelectAsset(asset);
                    onOpenAiAnalysisModal(asset);
                  }}
                  className="hover:bg-[#0c1322] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-sans font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {asset.name}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-sans flex items-center gap-1.5 pt-3.5">
                    {getCategoryIcon(asset.type)}
                    <span>{asset.type}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">
                    {asset.district}
                  </td>
                  <td className="py-3 px-3 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        asset.riskScore >= 80
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : asset.riskScore >= 65
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {asset.riskScore} / 100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className={asset.windExposure === 'Critical' ? 'text-rose-400 font-bold' : ''}>
                      {asset.windExposure}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className={asset.floodExposure === 'Critical' ? 'text-rose-400 font-bold' : ''}>
                      {asset.floodExposure}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {asset.accessibility}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        asset.riskLevel === 'CRITICAL' || asset.status === 'FAILED'
                          ? 'text-rose-300 bg-rose-950/60 border border-rose-800'
                          : asset.riskLevel === 'HIGH' || asset.status === 'ALERT' || asset.status === 'IMPAIRED'
                          ? 'text-amber-300 bg-amber-950/60 border border-amber-800'
                          : 'text-emerald-300 bg-emerald-950/60 border border-emerald-800'
                      }`}
                    >
                      {asset.status || (asset.riskLevel === 'CRITICAL' ? 'ALERT' : 'OPERATIONAL')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playButtonClickTone();
                        onSelectAsset(asset);
                        onOpenAiAnalysisModal(asset);
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
