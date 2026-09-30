export type RouteId =
  | 'landing'
  | 'login'
  | 'overview'
  | 'track'
  | 'map'
  | 'infrastructure'
  | 'cascade'
  | 'scenarios'
  | 'mitigation'
  | 'evidence'
  | 'population'
  | 'alerts'
  | 'planner'
  | 'copilot'
  | 'datasources';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type InfrastructureCategory =
  | 'Hospital'
  | 'School'
  | 'Bridge'
  | 'Road'
  | 'Power'
  | 'Port'
  | 'Shelter'
  | 'Water'
  | 'Telecom';

export interface CycloneTrackPoint {
  timeStep: string;
  time: string;
  label: string;
  status: string;
  hoursFromLandfall: number;
  lat: number;
  lng: number;
  windKmh: number;
  pressureHpa: number;
  category: string;
  surgeM: number;
  uncertaintyRadiusKm: number;
}

export interface CycloneData {
  id: string;
  name: string;
  category: string;
  currentWindKmh: number;
  gustWindKmh: number;
  maxWindKmh: number;
  stormSurgeExpectedM: number;
  centralPressureHpa: number;
  forwardSpeedKmh: number;
  movementSpeedKmh: number;
  trackDirection: string;
  movementDirection: string;
  rainfall24hMm: number;
  hoursToLandfall: number;
  landfallEta: string;
  targetRegion: string;
  confidenceScorePct: number;
  isSimulated: boolean;
  currentLat: number;
  currentLng: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  trackPoints: CycloneTrackPoint[];
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: InfrastructureCategory | string;
  district: string;
  lat: number;
  lng: number;
  riskScore: number;
  riskLevel: RiskLevel;
  windExposure: string;
  floodExposure: string;
  stormSurgeExposure: string;
  accessibility: string;
  backupPower: string;
  estimatedDisruptionHrs: string;
  populationServed: number;
  structuralVulnerability: string;
  keyVulnerabilityDetails: string;
  primaryRecommendation: string;
  secondaryRecommendations?: string[];
  explainableReasoning: string[];
  aiRecommendation: string;
  status?: 'OPERATIONAL' | 'ALERT' | 'IMPAIRED' | 'FAILED';
  dependencies?: string[];
  cascadeRisk?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface EvacuationRoute {
  id: string;
  name: string;
  type: 'PRIMARY' | 'ALTERNATE' | 'CAUTION' | 'BLOCKED';
  from: string;
  to: string;
  distanceKm: number;
  status: 'RECOMMENDED' | 'CLEAR' | 'IMPAIRED' | 'BLOCKED';
  color: string;
  path: { lat: number; lng: number }[];
  currentSpeedKmh: number;
  evacuationCapacityPerHour: number;
  riskNotes: string;
}

export interface CascadeNode {
  id: string;
  assetId?: string;
  name: string;
  type: InfrastructureCategory | 'HAZARD' | 'LOGISTICS' | 'POPULATION';
  district?: string;
  failureStage: 'TRIGGER' | 'FIRST TO FAIL' | 'SECONDARY CASCADE' | 'DOWNSTREAM IMPACT';
  status: 'FAILED' | 'CRITICAL' | 'AT_RISK' | 'OPERATIONAL' | 'MITIGATED';
  impactDescription: string;
  populationAffected: number;
  timeToFailureHrs: number;
  mitigationAvailable: string;
  lat?: number;
  lng?: number;
}

export interface CascadeEdge {
  id: string;
  from: string;
  to: string;
  mechanism: string;
  lagHours: number;
  severity: RiskLevel;
}

export interface CounterfactualMitigation {
  id: string;
  title: string;
  category: string;
  targetAssetId: string;
  targetAssetName: string;
  description: string;
  applied: boolean;
  costEstimate: string;
  implementationTime: string;
  baseline: {
    riskScore: number;
    isolatedPopulation: number;
    financialExposureM: number;
    hospitalAccess: string;
  };
  withMitigation: {
    riskScore: number;
    isolatedPopulation: number;
    financialExposureM: number;
    hospitalAccess: string;
  };
}

export interface MultimodalEvidenceAnalysis {
  id: string;
  title: string;
  sampleKey?: string;
  imageUrl?: string;
  imageDescription: string;
  location: string;
  district: string;
  lat: number;
  lng: number;
  observedCondition: string;
  potentialRisk: string;
  infrastructureImpact: string;
  recommendedAction: string;
  confidencePct: number;
  source: string;
  timestamp: string;
}

export interface ScenarioParameters {
  windSpeedKmh: number;
  rainfallMm: number;
  stormSurgeM: number;
  forwardSpeedKmh: number;
  landfallSector: 'Puri Sector' | 'Paradip Sector' | 'Dhamra Sector' | 'Chandbali Sector';
}

export interface LiveAlert {
  id: string;
  severity: RiskLevel;
  location: string;
  district: string;
  timestamp: string;
  reason: string;
  recommendedAction: string;
  acknowledged: boolean;
  lat: number;
  lng: number;
  assetId?: string;
}

export interface EmergencyActionItem {
  id: string;
  label: string;
  checked: boolean;
  priority?: RiskLevel;
  phase?: string;
  department?: string;
}

export interface PopulationExposureData {
  district: string;
  totalPopulation: number;
  exposedPopulation: number;
  highRiskPopulation: number;
  vulnerablePopulation: number;
  evacuationPriorityPopulation: number;
  kutchaHousingUnits: number;
  sheltersActive: number;
  shelterCapacityTotal: number;
  shelterOccupancy: number;
  evacuationProgressPct: number;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  structuredResponse?: {
    observation?: string;
    risk?: string;
    recommendedAction?: string;
    priority?: RiskLevel | string;
    actionList?: string[];
  };
}

export interface DataSourceItem {
  id: string;
  name: string;
  category: string;
  sourceType: string;
  provider: string;
  type?: string;
  status?: string;
  updateFrequency: string;
  description: string;
  parameters: string[];
  isSimulated: boolean;
}

export interface CategoryStatistic {
  type: string;
  label: string;
  count: number;
  total: number;
  atRisk: number;
  high: number;
  criticalCount: number;
  critical: number;
  avgRisk: number;
}
