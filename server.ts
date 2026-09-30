import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.startsWith('MY_'));
let aiClient: GoogleGenAI | null = null;
if (isRealApiKey && apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback high-fidelity responses in case API key is missing or offline
const DOMAIN_KNOWLEDGE = {
  paradip: `[SIMULATED GEMINI AI SYNTHESIS - TACTICAL ADVISORY]
Critical Threat Assessment: Paradip Deepwater Port & Oil Terminal
- Landfall Forecast: T-14h, Category 4 Storm Surge 5.4m above astronomical high tide.
- Critical Vulnerability: Coastal dikes at 4.8m crest height risk overtopping at high tide (04:15 AM). Crude oil unloading arm #2 and ballast water lagoons risk seawater contamination.
Tactical Recommendations:
1. Immediate cessation of crude bunkering; execute dry-break coupling disconnection on berths 1-4.
2. Fill ballast tanks of berthed bulk carriers to max draft or sortie ships 25 nautical miles offshore into deep water.
3. Pre-deploy 4x 5000 GPM high-capacity dewatering pumps at transformer yard #3.
4. Lock gantry cranes to mechanical hurricane storm pins; disengage drive brakes to prevent gear-train stripping.`,

  evacuation: `[SIMULATED GEMINI AI SYNTHESIS - POPULATION DEFENSE]
Evacuation Priority Strategy: Kendrapara & Jagatsinghpur Coastal Corridors
- Total Exposed Inhabitants: 1,420,000 across 4 districts.
- Highest Risk Cluster: 195,000 residents in thatched/kutcha housing within 5km coastal strip (Bhograi, Rajnagar, Ersama).
Execution Directives:
1. Prioritize Sector 4 (Ersama coastal hamlets) for remaining 107,550 target evacuees. Dispatch 80 state transit buses before T-8h road cut-off.
2. Divert Kendrapara Shelter #08 (currently at 96% capacity) to Inland Hub #14 (Pattamundai College, 42% capacity).
3. Pre-position 12 NDRF inflatable Zodiac boats at Hansua river crossing points before surge flood wave arrives.
4. Ensure potable water bladders and chlorine purification tablets are distributed to all 42 active shelters.`,

  grid: `[SIMULATED GEMINI AI SYNTHESIS - POWER INFRASTRUCTURE RESILIENCE]
Electrical Grid Protection Sequence: 400kV Jagatsinghpur Substation & Talcher Transmission
- Maximum Sustained Wind Stress: 185 km/h with gusts exceeding structural design threshold of 200 km/h on Line T-84.
- Inundation Hazard: Substation control room pad at +3.2m MSL susceptible to backwater flooding.
Sectionalization Sequence:
1. At T-6h: Gracefully transfer coastal industrial load to inland Duburi grid tie-in.
2. At T-3h: Trip 132kV seaside feeder lines #1 and #4 to prevent salt-fog flashover and uncontrolled circuit breaker explosion.
3. Elevate mobile DC battery backup banks above 4.5m mark using hydraulic jacks in control block.
4. Isolate SF6 gas-insulated switchgear bays 2 & 3 and engage auxiliary diesel generators on dry mezzanine.`
};

// AI Copilot endpoint
app.post('/api/ai/copilot', async (req: Request, res: Response) => {
  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // If Gemini API is available, invoke model
  if (aiClient && isRealApiKey) {
    try {
      const systemInstruction = `You are AegisTwin AI, a mission-critical tactical disaster digital twin and incident intelligence copilot for disaster authorities, incident commanders, and infrastructure engineers responding to Category 4 Cyclone 'VARUN' (185 km/h winds, 942 hPa, 4.8m storm surge, landfall in Bay of Bengal coast in 12 hours).
Provide crisp, structured, domain-authoritative tactical recommendations.
Always answer:
1. Threat Level & Key Vulnerability
2. Immediate SOP Directives (T-Minus actions)
3. Asset Hardening or Evacuation Specifics
4. Cascade Prevention & Safety Compliance (NDMA / Coastal Disaster Guidelines).
Keep responses authoritative, concise, and operational. Clearly note simulated scenario context.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Context: ${context || 'Active Cyclone VARUN response'}\nUser Query: ${prompt}`,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return res.json({
        reply: response.text || 'Analysis complete with operational recommendations.',
        source: 'gemini-2.5-flash',
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to simulated tactical engine:', err?.message);
    }
  }

  // Graceful domain-specific contextual fallback
  const lowerPrompt = prompt.toLowerCase();
  let fallbackText = DOMAIN_KNOWLEDGE.paradip;
  if (lowerPrompt.includes('evacuat') || lowerPrompt.includes('shelter') || lowerPrompt.includes('people') || lowerPrompt.includes('population')) {
    fallbackText = DOMAIN_KNOWLEDGE.evacuation;
  } else if (lowerPrompt.includes('grid') || lowerPrompt.includes('power') || lowerPrompt.includes('electric') || lowerPrompt.includes('substation')) {
    fallbackText = DOMAIN_KNOWLEDGE.grid;
  } else {
    fallbackText = `[SIMULATED GEMINI AI SYNTHESIS - TACTICAL RESPONSE]
Analysis for: "${prompt}"
- Scenario: Tropical Cyclone VARUN (Category 4, 185 km/h winds, landfall T-14h).
- Threat Evaluation: High risk of combined hydrodynamic surge (5.4m) and gale-force wind shear across the coastal corridor.
Key Operational Directives:
1. Enforce mandatory T-10h lockdown for all open coastal infrastructure.
2. Complete pre-emptive structural hardening and deploy backup power generators.
3. Coordinate multi-agency response teams (NDRF, Port Authority, State Disaster Management Authority).
4. Continuous monitoring of telemetry sensors at coastal automated weather stations.`;
  }

  return res.json({
    reply: fallbackText,
    source: 'tactical-simulation-engine',
  });
});

// AI Emergency Action Plan Generator
app.post('/api/ai/action-plan', async (req: Request, res: Response) => {
  const { phase, sector } = req.body;
  
  if (aiClient && isRealApiKey) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate an Emergency Action Plan (EAP) task checklist for Tropical Cyclone VARUN (Cat 4) focusing on phase: ${phase || 'T-12h to Landfall'} and sector: ${sector || 'General Inter-Agency'}. Include time-stamped operational directives, responsible agency, and success criteria.`,
        config: {
          systemInstruction: 'You are an emergency management SOP expert. Output formatted operational action items.',
          temperature: 0.3,
        },
      });
      return res.json({ plan: response.text, source: 'gemini-2.5-flash' });
    } catch (err: any) {
      console.warn('Gemini action plan error, using fallback:', err?.message);
    }
  }

  return res.json({
    plan: `OPERATIONAL DIRECTIVE EAP-VARUN-04\nPhase: ${phase || 'Pre-Landfall T-12h'}\n1. [06:00 HRS] Complete Phase 3 mandatory evacuation of all coastal settlements within 5km buffer.\n2. [08:30 HRS] De-energize vulnerable 33kV & 11kV overhead lines in flood-prone taluks.\n3. [10:00 HRS] Secure all mobile cranes and container stacks at Paradip and Dhamra ports.\n4. [12:00 HRS] Shelter lock-down; activate satellite HAM radio emergency backup network.`,
    source: 'tactical-simulation-engine'
  });
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CycloneGuard AI server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
