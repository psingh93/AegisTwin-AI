import React, { useState } from 'react';
import { RouteId, EmergencyActionItem, RiskLevel } from '../../types';
import { generateEmergencyPlan } from '../../services/aiService';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Sparkles,
  Bot,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Building2,
  Users,
  Compass,
  Zap,
  Anchor
} from 'lucide-react';
import { playButtonClickTone, playSuccessChime } from '../../utils/audio';

interface EmergencyPlannerViewProps {
  items: EmergencyActionItem[];
  onToggleItem: (id: string) => void;
  onNavigate: (route: RouteId) => void;
}

export interface TimelineStage {
  id: string;
  stageName: string;
  hoursLabel: string;
  phaseTitle: string;
  thresholdTrigger: string;
  primaryObjective: string;
  leadAgencies: string[];
  actions: {
    id: string;
    text: string;
    agency: string;
    priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
    completed: boolean;
  }[];
}

const INITIAL_72H_STAGES: TimelineStage[] = [
  {
    id: 't-72',
    stageName: 'T-72h',
    hoursLabel: '72 Hours Before Landfall',
    phaseTitle: 'Regional Early Warning & Maritime Recall',
    thresholdTrigger: 'Central Pressure 975 hPa • Low-pressure depression intensified to Severe Cyclonic Storm in Bay of Bengal',
    primaryObjective: 'Recall 100% of deep-sea fishing trawlers, issue coastal maritime advisories, and verify district diesel and ration stockpiles.',
    leadAgencies: ['Coast Guard', 'Fisheries Dept', 'IMD / INCOIS', 'District Collectors'],
    actions: [
      { id: 'act-72-1', text: 'Transmit emergency VHF broadcast over marine frequencies (Ch 16) recalling all vessels within 200nm of coast.', agency: 'Coast Guard', priority: 'CRITICAL', completed: true },
      { id: 'act-72-2', text: 'Issue State Disaster Warning Bulletin #01 to Puri, Jagatsinghpur, Kendrapara, and Bhadrak administrations.', agency: 'SDMA', priority: 'CRITICAL', completed: true },
      { id: 'act-72-3', text: 'Inventory fuel reserves (high-speed diesel) across 42 multi-purpose cyclone shelters and apex hospitals.', agency: 'Energy Dept', priority: 'HIGH', completed: true },
      { id: 'act-72-4', text: 'Place 12 battalions of NDRF and 18 ODRAF flood-rescue units on 2-hour mobilization readiness.', agency: 'NDRF / ODRAF', priority: 'HIGH', completed: true }
    ]
  },
  {
    id: 't-48',
    stageName: 'T-48h',
    hoursLabel: '48 Hours Before Landfall',
    phaseTitle: 'Inter-Agency Mobilization & Shelter Certification',
    thresholdTrigger: 'Winds 110–130 km/h • Track cone narrows to Devi River / Paradip corridor; high-tide timing calculated',
    primaryObjective: 'Pre-deploy rescue battalions to coastal block headquarters; inspect structural integrity of 42 cyclone shelters; stage tree-clearing backhoes.',
    leadAgencies: ['NDRF', 'Civil Defense', 'PWD Roads', 'Health Dept'],
    actions: [
      { id: 'act-48-1', text: 'Physical structural and roof inspection of all 42 coastal shelters; test emergency hand-pumps and solar lights.', agency: 'PWD', priority: 'HIGH', completed: true },
      { id: 'act-48-2', text: 'Pre-position 80 state transport buses at Ersama, Rajnagar, and Astaranga for village evacuation convoys.', agency: 'Transport Dept', priority: 'CRITICAL', completed: true },
      { id: 'act-48-3', text: 'Supply 14 days of life-saving medicines, IV fluids, anti-venom, and chlorine tablets to coastal CHCs.', agency: 'Health Dept', priority: 'HIGH', completed: false },
      { id: 'act-48-4', text: 'Clear drainage culverts along arterial evacuation highways (SH-12, NH-316) to prevent pre-landfall ponding.', agency: 'PWD Roads', priority: 'MODERATE', completed: false }
    ]
  },
  {
    id: 't-24',
    stageName: 'T-24h',
    hoursLabel: '24 Hours Before Landfall',
    phaseTitle: 'Phase 1 Mandatory Evacuation & Hospital Hardening',
    thresholdTrigger: 'Winds 140–160 km/h • Outer gale bands making contact with coastal radars; surge forecast +3.2m above normal',
    primaryObjective: 'Enforce mandatory evacuation for pregnant women, elderly, children, and thatched kutcha house residents within 3km of high tide line.',
    leadAgencies: ['Police / Revenue', 'Health Dept', 'ODRAF', 'Red Cross'],
    actions: [
      { id: 'act-24-1', text: 'Evacuate 195,000 residents living in vulnerable kutcha housing to designated reinforced concrete shelters.', agency: 'Revenue / Police', priority: 'CRITICAL', completed: false },
      { id: 'act-24-2', text: 'Elevate backup diesel generators at District Hospital Puri and Paradip Trauma Center above +2.5m mark.', agency: 'Health / PWD', priority: 'CRITICAL', completed: false },
      { id: 'act-24-3', text: 'Relocate ICU patients and emergency oxygen cylinders from ground floor wards to upper storeys.', agency: 'Hospital Medical Supt', priority: 'CRITICAL', completed: false },
      { id: 'act-24-4', text: 'Anchor gantry cranes, container stacks, and petroleum offloading arms at Paradip Deepwater Port.', agency: 'Port Authority', priority: 'HIGH', completed: false }
    ]
  },
  {
    id: 't-12',
    stageName: 'T-12h',
    hoursLabel: '12 Hours Before Landfall',
    phaseTitle: 'Phase 2 Route Lockdown & Power Grid Sectionalization',
    thresholdTrigger: 'Winds 165–185 km/h • Approaching eyewall storm surge cresting at +4.8m MSL; torrential rainfall >25mm/hr',
    primaryObjective: 'Close vulnerable coastal causeways (R-17); sectionalize seaside 132kV/33kV power lines to avoid flashovers; lockdown all schools and markets.',
    leadAgencies: ['State Electricity Grid (OPTCL)', 'Traffic Police', 'NDRF', 'Telecom'],
    actions: [
      { id: 'act-12-1', text: 'De-energize coastal 33kV overhead feeder lines #1 and #4 to prevent salt-fog flashover and electrical fire.', agency: 'OPTCL Grid', priority: 'CRITICAL', completed: false },
      { id: 'act-12-2', text: 'Erect barricades closing Coastal Road R-17; divert remaining emergency transit to high-ground Bypass R-22.', agency: 'Traffic Police', priority: 'CRITICAL', completed: false },
      { id: 'act-12-3', text: 'Stage amphibious tracked carriers and motorized Zodiac boats at Nimapara and Pattamundai staging nodes.', agency: 'ODRAF / NDRF', priority: 'HIGH', completed: false },
      { id: 'act-12-4', text: 'Transition all telemetry relay towers to satellite HAM radio and low-frequency emergency transmission.', agency: 'Telecom / SDMA', priority: 'HIGH', completed: false }
    ]
  },
  {
    id: 't-6',
    stageName: 'T-6h',
    hoursLabel: '6 Hours Before Landfall',
    phaseTitle: 'Final Mandatory Civilian Lockdown & Shelter In-Situ Bunker',
    thresholdTrigger: 'Sustained hurricane gales >130 km/h • Seawater overwashing low dunes; zero vehicular transit permissible',
    primaryObjective: 'Complete all transit. Seal cyclone shelter storm shutters. Responders move into reinforced staging hubs until eyewall passes.',
    leadAgencies: ['District Collectors', 'Police', 'Shelter Managers', 'Civil Defense'],
    actions: [
      { id: 'act-6-1', text: 'Total curfew on all civilian outdoor movement; enforce complete vehicular standstill on all district roads.', agency: 'District Police', priority: 'CRITICAL', completed: false },
      { id: 'act-6-2', text: 'Bolt steel hurricane storm shutters and dog-down reinforced entrances on all 42 active shelters.', agency: 'Shelter Wardens', priority: 'CRITICAL', completed: false },
      { id: 'act-6-3', text: 'Final verification of backup generator operation at SCB Medical College and District Hospital Puri.', agency: 'Hospital Ops', priority: 'HIGH', completed: false },
      { id: 'act-6-4', text: 'All response teams assume in-situ bunker posture; emergency calls queued for immediate post-landfall triage.', agency: 'Incident Command', priority: 'HIGH', completed: false }
    ]
  },
  {
    id: 't-0',
    stageName: 'LANDFALL',
    hoursLabel: 'Landfall Window (T-0h)',
    phaseTitle: 'Peak Surge Containment & Post-Eyewall Rescue Dispatch',
    thresholdTrigger: 'Winds 185 km/h (Gusts 205 km/h) • Barometric Eye crossing coastline; peak surge +4.8m; extreme river backflow',
    primaryObjective: 'Continuous tidal gauge monitoring; track eye passage; mobilize search-and-rescue and road-clearing teams the moment winds drop below 60 km/h.',
    leadAgencies: ['Incident Commander', 'NDRF', 'ODRAF', 'Armed Forces Liaison'],
    actions: [
      { id: 'act-0-1', text: 'Monitor real-time hydrodynamic telemetry and satellite microwave sensors for eyewall transit time.', agency: 'EOC Monitoring', priority: 'CRITICAL', completed: false },
      { id: 'act-0-2', text: 'Prepare first-wave chainsaw and JCB backhoe convoys to open SCB Cuttack - Puri medical lifeline.', agency: 'PWD Roads / Army', priority: 'CRITICAL', completed: false },
      { id: 'act-0-3', text: 'Dispatch rapid damage assessment drones immediately upon eyewall clearance to verify flood inundation extent.', agency: 'SDMA Drone Wing', priority: 'HIGH', completed: false },
      { id: 'act-0-4', text: 'Initiate targeted air-drops of dry rations and potable water to isolated coastal pockets if causeways scoured.', agency: 'Indian Air Force / Coast Guard', priority: 'HIGH', completed: false }
    ]
  }
];

export const EmergencyPlannerView: React.FC<EmergencyPlannerViewProps> = ({
  items,
  onToggleItem,
  onNavigate
}) => {
  const [stages, setStages] = useState<TimelineStage[]>(INITIAL_72H_STAGES);
  const [selectedStageId, setSelectedStageId] = useState<string>('t-12');
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'SOP_GENERATOR'>('TIMELINE');

  // SOP Matrix state
  const [district, setDistrict] = useState('Puri');
  const [timeWindow, setTimeWindow] = useState('Next 6 Hours');
  const [riskLevel, setRiskLevel] = useState('CRITICAL');
  const [infraType, setInfraType] = useState('Hospital');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [generatedPlanTitle, setGeneratedPlanTitle] = useState('AI EMERGENCY OPERATIONS DIRECTIVE: VARUN-PHASE-1');

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[3];

  const handleToggleStageAction = (stageId: string, actionId: string) => {
    playButtonClickTone();
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s;
        return {
          ...s,
          actions: s.actions.map((a) => (a.id === actionId ? { ...a, completed: !a.completed } : a))
        };
      })
    );
  };

  const handleGeneratePlan = async () => {
    playButtonClickTone();
    setIsGenerating(true);

    try {
      const plan = await generateEmergencyPlan({
        district,
        timeWindow,
        riskLevel,
        infrastructureType: infraType
      });

      setGeneratedPlanTitle(`AI DIRECTIVE: ${district.toUpperCase()} • ${timeWindow.toUpperCase()}`);
      playSuccessChime();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c242c] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              72-HOUR COMMAND TIMELINE
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              MULTI-AGENCY DIRECTIVES
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
              SOP ALIGNED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            72-Hour Pre-Landfall Command Operations & Timeline
          </h1>
          <p className="text-xs text-slate-400">
            Systematic timeline: T-72h, T-48h, T-24h, T-12h, T-6h, and Landfall. Track inter-agency operational orders and execute emergency directives.
          </p>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0a0d0f] border border-[#1c242c] p-1 rounded-lg flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => {
                playButtonClickTone();
                setActiveTab('TIMELINE');
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'TIMELINE'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              72h Timeline
            </button>
            <button
              onClick={() => {
                playButtonClickTone();
                setActiveTab('SOP_GENERATOR');
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'SOP_GENERATOR'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom SOP Builder
            </button>
          </div>

          <button
            onClick={() => {
              playButtonClickTone();
              setShowPrintModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Directive</span>
          </button>
        </div>
      </div>

      {activeTab === 'TIMELINE' ? (
        <div className="space-y-6">
          {/* Interactive 6-Stage Timeline Navigator Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
            {stages.map((stage) => {
              const isSelected = stage.id === selectedStageId;
              const completedCount = stage.actions.filter((a) => a.completed).length;
              return (
                <div
                  key={stage.id}
                  onClick={() => {
                    playButtonClickTone();
                    setSelectedStageId(stage.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#111518] border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                      : 'bg-[#0a0d0f] border-[#1c242c] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-cyan-500 text-black'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {stage.stageName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {completedCount}/{stage.actions.length}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-bold text-white font-sans truncate">
                    {stage.phaseTitle}
                  </div>

                  <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${(completedCount / stage.actions.length) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Stage Detailed Directive Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stage Directives Checklist (8 cols) */}
            <div className="lg:col-span-8 bg-[#0a0d0f] border border-[#1c242c] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-extrabold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      PHASE {selectedStage.stageName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedStage.hoursLabel}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {selectedStage.phaseTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedStage.leadAgencies.map((agency) => (
                    <span
                      key={agency}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                    >
                      {agency}
                    </span>
                  ))}
                </div>
              </div>

              {/* Threshold & Objective Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#050607] border border-slate-800 font-sans text-xs">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">
                    METEOROLOGICAL TRIGGER THRESHOLD
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedStage.thresholdTrigger}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block mb-1">
                    PRIMARY OPERATIONAL DIRECTIVE
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedStage.primaryObjective}
                  </p>
                </div>
              </div>

              {/* Action Items List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                  Mandatory Execution Checklist (Click to verify)
                </span>

                {selectedStage.actions.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => handleToggleStageAction(selectedStage.id, act.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      act.completed
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                        : 'bg-[#050607] border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {act.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs leading-relaxed font-sans font-medium">
                          {act.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono pt-1">
                        <span className="text-cyan-400 font-bold">
                          Assigned: {act.agency}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span
                          className={`font-bold uppercase ${
                            act.priority === 'CRITICAL'
                              ? 'text-rose-400'
                              : act.priority === 'HIGH'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {act.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Quick Facts & Agency Responsibilities (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#0a0d0f] border border-[#1c242c] rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    State Telemetry Feed
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-2 text-slate-300 font-sans">
                  <div className="flex justify-between p-2 rounded bg-[#050607] border border-slate-800">
                    <span className="text-slate-400">Target Region:</span>
                    <span className="font-bold text-white font-mono">Puri – Paradip Sector</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#050607] border border-slate-800">
                    <span className="text-slate-400">Peak Wind Stress:</span>
                    <span className="font-bold text-rose-400 font-mono">185 km/h</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#050607] border border-slate-800">
                    <span className="text-slate-400">Hydrodynamic Surge:</span>
                    <span className="font-bold text-cyan-300 font-mono">+4.8m MSL</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#050607] border border-slate-800">
                    <span className="text-slate-400">Evacuation Target:</span>
                    <span className="font-bold text-amber-300 font-mono">390,000 Persons</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => onNavigate('mitigation')}
                    className="w-full py-2 rounded bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Run Mitigation Simulator</span>
                  </button>

                  <button
                    onClick={() => onNavigate('cascade')}
                    className="w-full py-2 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Check Cascade Dependencies</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Custom SOP Matrix Builder */
        <div className="space-y-6">
          <div className="bg-[#0a0d0f] border border-[#1c242c] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Operational SOP Parameters
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Incident Command Builder</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">TARGET DISTRICT</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#050607] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="Puri">Puri District</option>
                  <option value="Jagatsinghpur">Jagatsinghpur District</option>
                  <option value="Kendrapara">Kendrapara District</option>
                  <option value="Bhadrak">Bhadrak District</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">TIME WINDOW</label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full bg-[#050607] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="Next 6 Hours">Next 6 Hours (T-12h to T-6h)</option>
                  <option value="T-24h to T-12h">T-24h to T-12h (Phase 1 Evacuation)</option>
                  <option value="Landfall Phase">Landfall Phase (T-0h)</option>
                  <option value="Post-Landfall 24H">Post-Landfall 24H (Recovery)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">RISK LEVEL</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full bg-[#050607] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="CRITICAL">CRITICAL (Direct Surge Hazard)</option>
                  <option value="HIGH">HIGH (Severe Wind & Flood)</option>
                  <option value="MODERATE">MODERATE (Buffer Zone)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">INFRASTRUCTURE SECTOR</label>
                <select
                  value={infraType}
                  onChange={(e) => setInfraType(e.target.value)}
                  className="w-full bg-[#050607] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="Hospital">Hospitals & Healthcare</option>
                  <option value="Bridge">Bridges & Arterial Routes</option>
                  <option value="Power">Power Grid Substations</option>
                  <option value="Water">Tidal Dikes & Dewatering</option>
                  <option value="Shelter">Cyclone Shelters</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full py-2.5 rounded bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'Synthesizing Plan with Gemini AI...' : 'Generate AI Emergency Plan'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Briefing Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0d0f] border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{generatedPlanTitle}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  State Emergency Operations Command • Cyclone VARUN (185 km/h)
                </p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                <strong>OPERATIONAL ORDER DIRECTIVE:</strong> All emergency response agencies, District Collectors, and PWD road engineers in <strong>{district}</strong> are instructed to execute the following immediate actions for phase <strong>{selectedStage.stageName}</strong>:
              </p>

              <div className="bg-[#050607] p-3.5 rounded border border-slate-800 space-y-2 font-mono text-[11px]">
                {selectedStage.actions.map((act) => (
                  <div key={act.id} className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>[{act.priority}] {act.text} (Lead: {act.agency})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
              >
                Confirm & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
