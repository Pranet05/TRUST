/**
 * NERV-TRUST Demo Forecast Data
 * ================================
 * PROTOTYPE / DEMO DATA — Not real IMD measurements.
 * Deterministic mock data for demonstration purposes.
 */

export interface ForecastCase {
  region: string;
  date: string;
  season: string;
  leadDay: number;
  forecastRainfall: number;
  actualRainfall: number;
  ensembleMean: number;
  ensembleSpread: number;
  precipitableWater: number;
  cape: number;
  cin: number;
  windShear: number;
  vorticity: number;
  bsisoPhase: number;
  relativeHumidity: number;
}

export interface BustProbabilityResult {
  leadDay: number;
  bustProbability: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
}

export interface RiskDrivers {
  ensembleDisagreement: number;
  moisture: number;
  dynamics: number;
  instability: number;
}

export interface EvidenceItem {
  id: string;
  category: string;
  label: string;
  currentValue: number;
  unit: string;
  referenceThreshold: number;
  status: 'Normal' | 'Elevated' | 'Critical';
}

export interface HistoricalCase {
  id: string;
  region: string;
  date: string;
  season: string;
  leadDay: number;
  similarity: number;
  forecastRainfall: number;
  actualRainfall: number;
  absoluteError: number;
  bustLabel: boolean;
  eventBust: boolean;
  riskDrivers: RiskDrivers;
}

export const REGIONS = [
  'Kerala',
  'Konkan & Goa',
  'Madhya Maharashtra',
  'Assam & Meghalaya',
  'Odisha',
  'West Madhya Pradesh',
] as const;

export const SEASONS = [
  'Monsoon',
  'Winter',
  'Pre-Monsoon',
  'Post-Monsoon',
] as const;

export type Region = typeof REGIONS[number];
export type Season = typeof SEASONS[number];

export const REGION_COORDINATES: Record<string, { lng: number; lat: number; name: string; isGateway?: boolean }> = {
  'Kerala': { lng: 76.27, lat: 10.85, name: 'Kerala' },
  'Konkan & Goa': { lng: 73.82, lat: 15.30, name: 'Konkan & Goa' },
  'Coastal Karnataka': { lng: 74.86, lat: 13.34, name: 'Coastal Karnataka' },
  'Madhya Maharashtra': { lng: 74.12, lat: 18.52, name: 'Madhya Maharashtra' },
  'Gujarat Region': { lng: 71.19, lat: 22.26, name: 'Gujarat Region' },
  'East Rajasthan': { lng: 75.79, lat: 26.91, name: 'East Rajasthan' },
  'West Madhya Pradesh': { lng: 76.85, lat: 23.25, name: 'West Madhya Pradesh' },
  'Odisha': { lng: 85.82, lat: 20.95, name: 'Odisha' },
  'Gangetic West Bengal': { lng: 88.36, lat: 22.57, name: 'Gangetic West Bengal' },
  'Assam & Meghalaya': { lng: 91.74, lat: 25.58, name: 'Assam & Meghalaya' },
  'Western Himalayas': { lng: 78.03, lat: 30.32, name: 'Western Himalayas' },
  'Vidarbha': { lng: 79.09, lat: 21.15, name: 'Vidarbha' },
  'Arabian Sea Convective Node': { lng: 69.2, lat: 14.8, name: 'Arabian Sea Convective Node', isGateway: true },
  'Bay of Bengal Depression Track': { lng: 88.5, lat: 17.2, name: 'Bay of Bengal Depression Track', isGateway: true },
  'Andaman Marine Trough': { lng: 93.2, lat: 11.5, name: 'Andaman Marine Trough', isGateway: true },
  'Equatorial Moisture Inflow': { lng: 76.5, lat: 4.5, name: 'Equatorial Moisture Inflow', isGateway: true },
};

// Deterministic seed-based pseudo-random for consistent demo results
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Region-specific base characteristics
const REGION_PROFILES: Record<string, {
  baseRainfall: number;
  volatility: number;
  bustBias: number;
  spreadMultiplier: number;
}> = {
  'Kerala': { baseRainfall: 85, volatility: 1.4, bustBias: 0.15, spreadMultiplier: 1.3 },
  'Konkan & Goa': { baseRainfall: 78, volatility: 1.3, bustBias: 0.12, spreadMultiplier: 1.2 },
  'Madhya Maharashtra': { baseRainfall: 45, volatility: 1.0, bustBias: 0.08, spreadMultiplier: 0.9 },
  'Assam & Meghalaya': { baseRainfall: 92, volatility: 1.5, bustBias: 0.18, spreadMultiplier: 1.4 },
  'Odisha': { baseRainfall: 62, volatility: 1.2, bustBias: 0.10, spreadMultiplier: 1.1 },
  'West Madhya Pradesh': { baseRainfall: 38, volatility: 0.9, bustBias: 0.07, spreadMultiplier: 0.8 },
};

const SEASON_MODIFIERS: Record<string, { rainfallMod: number; bustMod: number }> = {
  'Monsoon': { rainfallMod: 1.8, bustMod: 1.3 },
  'Winter': { rainfallMod: 0.3, bustMod: 0.6 },
  'Pre-Monsoon': { rainfallMod: 0.7, bustMod: 0.9 },
  'Post-Monsoon': { rainfallMod: 1.1, bustMod: 1.1 },
};

/**
 * Generate bust probability curve for Day 1-10.
 * Deterministic: same inputs always produce same outputs.
 */
export function generateBustProbabilities(
  region: Region,
  season: Season,
  dateStr: string
): BustProbabilityResult[] {
  const profile = REGION_PROFILES[region];
  const seasonMod = SEASON_MODIFIERS[season];
  const dateSeed = hashString(`${region}-${season}-${dateStr}`);

  const results: BustProbabilityResult[] = [];

  for (let day = 1; day <= 10; day++) {
    const seed = dateSeed + day * 137;
    const noise = seededRandom(seed) * 0.15 - 0.075;

    // Base probability increases with lead day (forecasts degrade over time)
    const baseProbability = 0.08 + (day - 1) * 0.075;

    // Apply region and season modifiers
    let probability = baseProbability
      * (1 + profile.bustBias * 3)
      * seasonMod.bustMod
      + noise;

    // Add some non-linearity — steeper jump around day 3-4
    if (day >= 3) {
      probability += 0.08 * profile.volatility;
    }
    if (day >= 6) {
      probability += 0.05;
    }

    // Clamp between 0.05 and 0.95
    probability = Math.max(0.05, Math.min(0.95, probability));

    const riskLevel = probability < 0.3 ? 'LOW'
      : probability < 0.5 ? 'MODERATE'
      : probability < 0.75 ? 'HIGH'
      : 'VERY HIGH';

    results.push({
      leadDay: day,
      bustProbability: Math.round(probability * 100) / 100,
      riskLevel,
    });
  }

  return results;
}

/**
 * Calculate Trust Horizon — first lead day where bust probability >= threshold
 */
export function calculateTrustHorizon(
  probabilities: BustProbabilityResult[],
  threshold: number = 0.70
): number | null {
  for (const p of probabilities) {
    if (p.bustProbability >= threshold) {
      return p.leadDay;
    }
  }
  return null; // Never crosses threshold
}

/**
 * Generate forecast case data for a specific region, season, and lead day.
 */
export function generateForecastCase(
  region: Region,
  season: Season,
  leadDay: number,
  dateStr: string
): ForecastCase {
  const profile = REGION_PROFILES[region];
  const seasonMod = SEASON_MODIFIERS[season];
  const seed = hashString(`${region}-${season}-${dateStr}-${leadDay}`);

  const forecastRainfall = Math.round(
    profile.baseRainfall * seasonMod.rainfallMod * (0.8 + seededRandom(seed) * 0.8)
  );

  const ensembleSpread = Math.round(
    15 + leadDay * 4 * profile.spreadMultiplier + seededRandom(seed + 1) * 15
  );

  const ensembleMean = Math.round(forecastRainfall * (0.9 + seededRandom(seed + 2) * 0.2));

  const actualRainfall = Math.round(
    forecastRainfall * (0.6 + seededRandom(seed + 3) * 1.2 * profile.volatility)
  );

  return {
    region,
    date: dateStr,
    season,
    leadDay,
    forecastRainfall,
    actualRainfall,
    ensembleMean,
    ensembleSpread,
    precipitableWater: Math.round(35 + seededRandom(seed + 4) * 30),
    cape: Math.round(800 + seededRandom(seed + 5) * 2200),
    cin: Math.round(-20 - seededRandom(seed + 6) * 180),
    windShear: Math.round(5 + seededRandom(seed + 7) * 25),
    vorticity: Math.round((seededRandom(seed + 8) * 12 - 2) * 10) / 10,
    bsisoPhase: Math.floor(seededRandom(seed + 9) * 8) + 1,
    relativeHumidity: Math.round(50 + seededRandom(seed + 10) * 45),
  };
}

/**
 * Generate SHAP-style risk driver contributions.
 * Deterministic: same inputs produce same outputs.
 */
export function generateRiskDrivers(
  region: Region,
  season: Season,
  leadDay: number,
  dateStr: string
): RiskDrivers {
  const seed = hashString(`drivers-${region}-${season}-${dateStr}-${leadDay}`);

  // Generate raw contributions
  let ens = 25 + seededRandom(seed) * 20;
  let moisture = 20 + seededRandom(seed + 1) * 18;
  let dynamics = 10 + seededRandom(seed + 2) * 15;
  let instability = 8 + seededRandom(seed + 3) * 12;

  // Normalize to 100%
  const total = ens + moisture + dynamics + instability;
  ens = Math.round(ens / total * 100);
  moisture = Math.round(moisture / total * 100);
  dynamics = Math.round(dynamics / total * 100);
  instability = 100 - ens - moisture - dynamics;

  return {
    ensembleDisagreement: ens,
    moisture,
    dynamics,
    instability,
  };
}

/**
 * Generate evidence items based on forecast case and risk drivers.
 */
export function generateEvidence(
  forecastCase: ForecastCase,
  _riskDrivers?: RiskDrivers
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  // Ensemble evidence
  const ensThreshold = 31;
  evidence.push({
    id: `ENS_SPREAD_${String(forecastCase.leadDay).padStart(2, '0')}`,
    category: 'Ensemble Disagreement',
    label: 'Ensemble Spread',
    currentValue: forecastCase.ensembleSpread,
    unit: 'mm',
    referenceThreshold: ensThreshold,
    status: forecastCase.ensembleSpread > ensThreshold * 1.5 ? 'Critical'
      : forecastCase.ensembleSpread > ensThreshold ? 'Elevated' : 'Normal',
  });

  // Moisture evidence
  const pwThreshold = 51;
  evidence.push({
    id: `MOISTURE_${String(forecastCase.leadDay).padStart(2, '0')}`,
    category: 'Moisture',
    label: 'Precipitable Water',
    currentValue: forecastCase.precipitableWater,
    unit: 'mm',
    referenceThreshold: pwThreshold,
    status: forecastCase.precipitableWater > pwThreshold * 1.2 ? 'Critical'
      : forecastCase.precipitableWater > pwThreshold ? 'Elevated' : 'Normal',
  });

  // Moisture — Relative Humidity
  evidence.push({
    id: `RH_${String(forecastCase.leadDay).padStart(2, '0')}`,
    category: 'Moisture',
    label: 'Relative Humidity',
    currentValue: forecastCase.relativeHumidity,
    unit: '%',
    referenceThreshold: 75,
    status: forecastCase.relativeHumidity > 85 ? 'Critical'
      : forecastCase.relativeHumidity > 75 ? 'Elevated' : 'Normal',
  });

  // Instability — CAPE
  evidence.push({
    id: `CAPE_${String(forecastCase.leadDay).padStart(2, '0')}`,
    category: 'Instability',
    label: 'CAPE',
    currentValue: forecastCase.cape,
    unit: 'J/kg',
    referenceThreshold: 1500,
    status: forecastCase.cape > 2500 ? 'Critical'
      : forecastCase.cape > 1500 ? 'Elevated' : 'Normal',
  });

  // Instability — CIN
  evidence.push({
    id: `CIN_${String(forecastCase.leadDay).padStart(2, '0')}`,
    category: 'Instability',
    label: 'CIN',
    currentValue: Math.abs(forecastCase.cin),
    unit: 'J/kg',
    referenceThreshold: 50,
    status: Math.abs(forecastCase.cin) > 100 ? 'Critical'
      : Math.abs(forecastCase.cin) > 50 ? 'Elevated' : 'Normal',
  });

  // Dynamics — Wind Shear
  evidence.push({
    id: `SHEAR_${String(forecastCase.leadDay).padStart(2, '0')}`,
    category: 'Dynamics',
    label: 'Wind Shear (0–6 km)',
    currentValue: forecastCase.windShear,
    unit: 'm/s',
    referenceThreshold: 15,
    status: forecastCase.windShear > 22 ? 'Critical'
      : forecastCase.windShear > 15 ? 'Elevated' : 'Normal',
  });

  // Dynamics — Vorticity
  evidence.push({
    id: `VORT_${String(forecastCase.leadDay).padStart(2, '0')}`,
    category: 'Dynamics',
    label: 'Low-level Vorticity',
    currentValue: forecastCase.vorticity,
    unit: '×10⁻⁵ s⁻¹',
    referenceThreshold: 4,
    status: forecastCase.vorticity > 7 ? 'Critical'
      : forecastCase.vorticity > 4 ? 'Elevated' : 'Normal',
  });

  return evidence;
}

/**
 * Generate historical analog cases.
 */
export function generateHistoricalCases(
  region: Region,
  season: Season,
  leadDay: number,
  dateStr: string
): HistoricalCase[] {
  const seed = hashString(`analogs-${region}-${season}-${dateStr}-${leadDay}`);
  const profile = REGION_PROFILES[region];
  const seasonMod = SEASON_MODIFIERS[season];

  const historicalDates = [
    '16 Aug 2018', '22 Jul 2019', '03 Sep 2020',
    '11 Aug 2017', '28 Jun 2021', '15 Jul 2022',
    '09 Aug 2023', '01 Sep 2019',
  ];

  const cases: HistoricalCase[] = [];

  for (let i = 0; i < 5; i++) {
    const caseSeed = seed + i * 271;
    const similarity = Math.round((92 - i * 6 + seededRandom(caseSeed) * 4) * 10) / 10;
    const fr = Math.round(profile.baseRainfall * seasonMod.rainfallMod * (0.6 + seededRandom(caseSeed + 1) * 0.8));
    const ar = Math.round(fr * (0.5 + seededRandom(caseSeed + 2) * 2.0));
    const error = Math.abs(ar - fr);
    const isBust = error > fr * 0.5 || error > 50;

    // Generate risk drivers for each case
    let ens = 20 + seededRandom(caseSeed + 10) * 25;
    let moist = 18 + seededRandom(caseSeed + 11) * 20;
    let dyn = 10 + seededRandom(caseSeed + 12) * 15;
    let inst = 8 + seededRandom(caseSeed + 13) * 12;
    const total = ens + moist + dyn + inst;

    cases.push({
      id: `CASE_${String(i + 1).padStart(3, '0')}`,
      region: i === 0 ? region : REGIONS[Math.floor(seededRandom(caseSeed + 3) * REGIONS.length)],
      date: historicalDates[i % historicalDates.length],
      season,
      leadDay: leadDay + Math.floor(seededRandom(caseSeed + 4) * 3) - 1,
      similarity,
      forecastRainfall: fr,
      actualRainfall: ar,
      absoluteError: error,
      bustLabel: isBust,
      eventBust: ar >= 64.5 && !isBust ? seededRandom(caseSeed + 5) > 0.5 : isBust,
      riskDrivers: {
        ensembleDisagreement: Math.round(ens / total * 100),
        moisture: Math.round(moist / total * 100),
        dynamics: Math.round(dyn / total * 100),
        instability: Math.round(inst / total * 100),
      },
    });
  }

  return cases.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Kerala 2018 Replay Lab case
 */
export const KERALA_2018_CASE = {
  title: 'Kerala Heavy Rainfall — August 2018',
  description: 'Extreme rainfall event leading to severe flooding in Kerala. This case demonstrates the NERV-TRUST workflow for a historically significant forecast bust.',
  isDemo: true,
  forecast: {
    rainfall: 82,
    bustProbability: 0.78,
    riskLevel: 'HIGH' as const,
    ensembleMean: 89,
    ensembleSpread: 52,
  },
  actual: {
    rainfall: 214,
    observedError: 132,
    bustLabel: true,
    eventBust: true,
  },
  timeline: [
    { day: 1, risk: 'LOW' as const, probability: 0.15, label: 'Low Risk' },
    { day: 2, risk: 'MODERATE' as const, probability: 0.38, label: 'Moderate Risk' },
    { day: 3, risk: 'HIGH' as const, probability: 0.72, label: 'High Risk' },
    { day: 4, risk: 'HIGH' as const, probability: 0.78, label: 'High Risk' },
    { day: 5, risk: 'VERY HIGH' as const, probability: 0.84, label: 'Very High Risk' },
  ],
  riskDrivers: {
    ensembleDisagreement: { contribution: 35, status: 'Elevated' as const },
    moisture: { contribution: 32, status: 'Elevated' as const },
    instability: { contribution: 20, status: 'Elevated' as const },
    dynamics: { contribution: 13, status: 'Normal' as const },
  },
  diagnostics: {
    ensembleSpread: { value: 52, unit: 'mm', threshold: 31, status: 'Elevated' as const },
    precipitableWater: { value: 62, unit: 'mm', threshold: 51, status: 'Elevated' as const },
    cape: { value: 2100, unit: 'J/kg', threshold: 1500, status: 'Elevated' as const },
    windShear: { value: 18, unit: 'm/s', threshold: 15, status: 'Elevated' as const },
    relativeHumidity: { value: 88, unit: '%', threshold: 75, status: 'Elevated' as const },
    vorticity: { value: 5.2, unit: '×10⁻⁵ s⁻¹', threshold: 4, status: 'Elevated' as const },
  },
  forecasterInsights: [
    { signal: 'Ensemble Disagreement', status: 'Elevated', detail: 'Ensemble spread 52 mm exceeded historical 90th percentile (31 mm) for Kerala monsoon Day 3 forecasts.' },
    { signal: 'Moisture Diagnostic', status: 'Elevated', detail: 'Precipitable water 62 mm exceeded reference threshold (51 mm), indicating anomalous moisture loading.' },
    { signal: 'Instability Diagnostic', status: 'Elevated', detail: 'CAPE 2100 J/kg exceeded climatological threshold (1500 J/kg) for the region and season.' },
    { signal: 'Historical Analogs', status: 'Warning', detail: 'Three of five most similar historical cases resulted in forecast busts with comparable error magnitudes.' },
  ],
};

/**
 * Generate interpretation text based on risk drivers and evidence.
 * Uses only computed diagnostics — never invents meteorological facts.
 */
export function generateInterpretation(
  riskDrivers: RiskDrivers,
  evidence: EvidenceItem[],
  bustProbability: number
): string {
  const elevated = evidence.filter(e => e.status !== 'Normal');
  const riskText = bustProbability >= 0.75 ? 'elevated' 
    : bustProbability >= 0.5 ? 'moderate'
    : 'low';
  
  // Build sorted driver list
  const drivers = [
    { name: 'ensemble disagreement', value: riskDrivers.ensembleDisagreement },
    { name: 'moisture diagnostics', value: riskDrivers.moisture },
    { name: 'dynamic indicators', value: riskDrivers.dynamics },
    { name: 'instability measures', value: riskDrivers.instability },
  ].sort((a, b) => b.value - a.value);

  let text = `The model attributes ${riskText} bust risk primarily to ${drivers[0].name} (${drivers[0].value}%)`;
  
  if (drivers[1].value > 20) {
    text += ` and ${drivers[1].name} (${drivers[1].value}%)`;
  }
  text += '.';

  if (elevated.length > 0) {
    text += ` ${elevated.length} of ${evidence.length} diagnostic values exceed their reference thresholds.`;
  }

  return text;
}

/**
 * Validation metrics — demo placeholders clearly labeled.
 */
export const VALIDATION_METRICS = {
  bustCounts: {
    percentile: { busts: null as number | null, total: null as number | null },
    event: { busts: null as number | null, total: null as number | null },
  },
  metrics: [
    { name: 'Brier Score', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'Brier Skill Score', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'ROC-AUC', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'PR-AUC', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'POD', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'FAR', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'CSI', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'HSS', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'ETS', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'MAE', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'RMSE', value: null as number | null, status: 'Pending temporal validation' },
    { name: 'Bias', value: null as number | null, status: 'Pending temporal validation' },
  ],
  reliabilityDiagram: {
    isDemo: true,
    points: [
      { predicted: 0.1, observed: 0.08 },
      { predicted: 0.2, observed: 0.18 },
      { predicted: 0.3, observed: 0.27 },
      { predicted: 0.4, observed: 0.38 },
      { predicted: 0.5, observed: 0.52 },
      { predicted: 0.6, observed: 0.55 },
      { predicted: 0.7, observed: 0.68 },
      { predicted: 0.8, observed: 0.76 },
      { predicted: 0.9, observed: 0.85 },
    ],
  },
  modelLadder: [
    { name: 'Raw NWP', status: 'baseline' as const },
    { name: 'Spread-only Baseline', status: 'core' as const },
    { name: 'Logistic Regression', status: 'core' as const },
    { name: 'Random Forest', status: 'core' as const },
    { name: 'Calibrated XGBoost', status: 'core' as const },
    { name: 'EMOS / Quantile Regression', status: 'experimental' as const },
    { name: 'Stage 2 Correction Network', status: 'experimental' as const },
  ],
};
