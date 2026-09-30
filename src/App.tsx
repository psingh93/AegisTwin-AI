/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RouteId, CycloneData, InfrastructureAsset, LiveAlert, EmergencyActionItem } from './types';
import {
  INITIAL_CYCLONE_DATA,
  INFRASTRUCTURE_ASSETS,
  LIVE_ALERTS,
  EMERGENCY_ACTION_PLAN_ITEMS
} from './data/mockData';
import { Header } from './components/layout/Header';
import { CopilotDrawer } from './components/layout/CopilotDrawer';
import { LandingPage } from './components/views/LandingPage';
import { LoginPage } from './components/views/LoginPage';
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { CycloneTrackView } from './components/views/CycloneTrackView';
import { InteractiveMapView } from './components/views/InteractiveMapView';
import { InfrastructureRiskView } from './components/views/InfrastructureRiskView';
import { CascadeEngineView } from './components/views/CascadeEngineView';
import { MitigationView } from './components/views/MitigationView';
import { PopulationExposureView } from './components/views/PopulationExposureView';
import { AlertCenterView } from './components/views/AlertCenterView';
import { EmergencyPlannerView } from './components/views/EmergencyPlannerView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { AiRiskAnalysisModal } from './components/views/AiRiskAnalysisModal';
import { JudgeWalkthroughBar } from './components/views/JudgeWalkthroughBar';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteId>('overview');
  const [cyclone, setCyclone] = useState<CycloneData>(INITIAL_CYCLONE_DATA);
  const [assets, setAssets] = useState<InfrastructureAsset[]>(INFRASTRUCTURE_ASSETS);
  const [alerts, setAlerts] = useState<LiveAlert[]>(LIVE_ALERTS);
  const [actionItems, setActionItems] = useState<EmergencyActionItem[]>(EMERGENCY_ACTION_PLAN_ITEMS);

  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(INFRASTRUCTURE_ASSETS[0]);
  const [aiModalAsset, setAiModalAsset] = useState<InfrastructureAsset | null>(null);

  const [emergencyMode, setEmergencyMode] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [judgeTourOpen, setJudgeTourOpen] = useState(true);

  // Sync hash routing if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as RouteId;
      const valid: RouteId[] = [
        'landing',
        'login',
        'overview',
        'track',
        'map',
        'infrastructure',
        'cascade',
        'mitigation',
        'population',
        'alerts',
        'planner',
        'copilot',
        'datasources'
      ];
      if (valid.includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    if (window.location.hash) {
      handleHash();
    }

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (route: RouteId) => {
    setCurrentRoute(route);
    if (route === 'copilot') {
      setCopilotOpen(true);
    }
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleViewOnMap = (lat: number, lng: number, assetId?: string) => {
    if (assetId) {
      const matched = assets.find((a) => a.id === assetId);
      if (matched) setSelectedAsset(matched);
    }
    handleNavigate('map');
  };

  const handleToggleActionItem = (itemId: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      {currentRoute !== 'landing' && currentRoute !== 'login' && (
        <Header
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          cyclone={cyclone}
          emergencyMode={emergencyMode}
          onToggleEmergencyMode={() => setEmergencyMode(!emergencyMode)}
          demoMode={demoMode}
          onToggleDemoMode={() => setDemoMode(!demoMode)}
          onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
          copilotOpen={copilotOpen}
          onLaunchJudgeTour={() => setJudgeTourOpen(true)}
        />
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5 pb-28">
        {currentRoute === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            cyclone={cyclone}
            onLaunchJudgeTour={() => setJudgeTourOpen(true)}
          />
        )}

        {currentRoute === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'overview' && (
          <OverviewDashboard
            onNavigate={handleNavigate}
            cyclone={cyclone}
            assets={assets}
            alerts={alerts}
            onSelectAsset={setSelectedAsset}
            onOpenAiAnalysisModal={setAiModalAsset}
          />
        )}

        {currentRoute === 'track' && (
          <CycloneTrackView
            cyclone={cyclone}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'map' && (
          <InteractiveMapView
            cyclone={cyclone}
            assets={assets}
            onSelectAsset={setSelectedAsset}
            selectedAsset={selectedAsset}
            onOpenAiAnalysisModal={setAiModalAsset}
          />
        )}

        {currentRoute === 'infrastructure' && (
          <InfrastructureRiskView
            assets={assets}
            onSelectAsset={setSelectedAsset}
            onOpenAiAnalysisModal={setAiModalAsset}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'cascade' && (
          <CascadeEngineView
            onNavigate={handleNavigate}
            onSelectAssetById={(id) => {
              const matched = assets.find((a) => a.id === id);
              if (matched) setSelectedAsset(matched);
            }}
          />
        )}

        {currentRoute === 'mitigation' && (
          <MitigationView
            onNavigate={handleNavigate}
            cyclone={cyclone}
            onOpenCopilot={() => setCopilotOpen(true)}
          />
        )}

        {currentRoute === 'population' && (
          <PopulationExposureView onNavigate={handleNavigate} />
        )}

        {currentRoute === 'alerts' && (
          <AlertCenterView
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onNavigate={handleNavigate}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {currentRoute === 'planner' && (
          <EmergencyPlannerView
            items={actionItems}
            onToggleItem={handleToggleActionItem}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'copilot' && (
          <div className="space-y-6 pb-12 select-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#161f30] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI TACTICAL DECISION ENGINE
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    GEMINI 3.8 FLASH READY
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Emergency Decision Copilot
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time multi-variable strategic advisor for incident commanders, evacuation chiefs, and structural engineers.
                </p>
              </div>

              <button
                onClick={() => setCopilotOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer ring-1 ring-cyan-400/40"
              >
                <span>OPEN INTERACTIVE COPILOT DRAWER</span>
              </button>
            </div>

            {/* AI Engine Status & Scenario Card */}
            <div className="bg-[#080d17] border border-[#161f30] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white font-sans flex items-center gap-2">
                    <span>Active Telemetry Context Ingestion</span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">
                    Copilot is continuously grounded in Cyclone VARUN (148 km/h wind, 4.8m surge), 47 monitored assets, and 4 district populations.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded border border-cyan-500/30 shrink-0">
                  Latency: ~340ms • Ensemble Confidence: 91%
                </div>
              </div>

              {/* 4 Quick Preset Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    title: 'Strategic 6-Hour Prioritization',
                    desc: 'What critical actions should incident commanders execute between T-12h and T-6h before road flooding cuts off coastal corridors?',
                    tag: 'COMMAND & TIMING'
                  },
                  {
                    title: 'Hospital & Healthcare Defense',
                    desc: 'Which regional hospitals face catastrophic access severance or backup generator inundation under a +4.8m surge?',
                    tag: 'LIFELINE ASSETS'
                  },
                  {
                    title: 'Electrical Grid Sectionalization',
                    desc: 'How should transmission engineers sectionalize seaside 132kV feeders at Jagatsinghpur Substation P-17 to prevent flashover?',
                    tag: 'POWER INFRASTRUCTURE'
                  },
                  {
                    title: 'Priority Evacuation Optimization',
                    desc: 'Identify the highest-risk clusters of Kutcha housing settlements within the 3km shoreline boundary needing immediate bus convoy transit.',
                    tag: 'CIVIL PROTECTION'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCopilotOpen(true)}
                    className="p-4 rounded-xl bg-[#05080e] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                          Query Copilot →
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentRoute === 'datasources' && <DataSourcesView />}
      </main>

      {/* Right-Side AI Decision Assistant Drawer */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        cyclone={cyclone}
        selectedAsset={selectedAsset}
      />

      {/* Explainable AI Risk Analysis Modal */}
      <AiRiskAnalysisModal
        asset={aiModalAsset}
        cyclone={cyclone}
        onClose={() => setAiModalAsset(null)}
        onOpenCopilotWithAsset={(asset) => {
          setSelectedAsset(asset);
          setCopilotOpen(true);
        }}
      />

      {/* 2-Minute Judge Demonstration Tour Bar */}
      {judgeTourOpen && (
        <JudgeWalkthroughBar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onSelectHospitalAsset={() => {
            const hosp = assets.find((a) => a.type === 'Hospital') || assets[0];
            setSelectedAsset(hosp);
          }}
          onOpenAiAnalysisModal={() => {
            const hosp = assets.find((a) => a.type === 'Hospital') || assets[0];
            setSelectedAsset(hosp);
            setAiModalAsset(hosp);
          }}
          onOpenCopilot={() => setCopilotOpen(true)}
          onClose={() => setJudgeTourOpen(false)}
        />
      )}
    </div>
  );
}
