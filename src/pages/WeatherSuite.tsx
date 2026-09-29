import { useState } from 'react';
import {
  SunIcon,
  RainIcon,
  HeavyRainIcon,
  ThunderIcon,
  WindIcon,
  FogIcon,
  ALL_ICONS,
} from '@/components/ui/animated-weather-icons';
import { CloudSun, Layers, Sparkles, Activity, ShieldCheck, Thermometer } from 'lucide-react';

const SYNOPTIC_REGIMES = [
  {
    id: 'heavy-monsoon',
    name: 'Monsoon Cloudburst / Tropical Depression',
    icon: HeavyRainIcon,
    category: 'Severe Precipitation',
    accentColor: '#3B82F6',
    riskLevel: 'HIGH',
    rainfall: '142 mm/24h',
    cape: '2100 J/kg',
    wind: '34 kt',
    description: 'Intense orographic lifting coupled with low-level jet moisture convergence. High bust probability due to microphysics saturation threshold.',
  },
  {
    id: 'severe-thunderstorm',
    name: 'Pre-Monsoon Nor\'wester (Kalbaishakhi)',
    icon: ThunderIcon,
    category: 'Severe Convective Instability',
    accentColor: '#F59E0B',
    riskLevel: 'CRITICAL',
    rainfall: '68 mm/24h',
    cape: '3450 J/kg',
    wind: '48 kt gusts',
    description: 'High surface enthalpy, extreme CAPE with sharp boundary layer trigger. Rapid cell initiation prone to spatial phase errors in NWP.',
  },
  {
    id: 'cyclonic-gale',
    name: 'Bay of Bengal Cyclonic Circulation',
    icon: WindIcon,
    category: 'Dynamical Shear & Kinematics',
    accentColor: '#94A3B8',
    riskLevel: 'HIGH',
    rainfall: '95 mm/24h',
    cape: '1600 J/kg',
    wind: '55 kt sustained',
    description: 'Strong deep-layer vertical wind shear and tight baroclinic vorticity gradient causing rapid track uncertainty beyond Day 3.',
  },
  {
    id: 'winter-fog',
    name: 'Indo-Gangetic Dense Radiation Fog',
    icon: FogIcon,
    category: 'Boundary Layer Inversion',
    accentColor: '#CBD5E1',
    riskLevel: 'MODERATE',
    rainfall: '0.0 mm/24h',
    cape: '80 J/kg',
    wind: '3 kt calm',
    description: 'Strong nocturnal radiational cooling under calm conditions. NWP models often under-resolve shallow nocturnal boundary layer inversions.',
  },
  {
    id: 'scat-monsoon',
    name: 'Western Ghats Orographic Rain Bands',
    icon: RainIcon,
    category: 'Stratiform / Convective Mix',
    accentColor: '#60A5FA',
    riskLevel: 'MODERATE',
    rainfall: '45 mm/24h',
    cape: '1200 J/kg',
    wind: '22 kt',
    description: 'Persistent onshore westerlies yielding steady precipitation. Ensemble spread remains moderate across high-resolution grids.',
  },
  {
    id: 'clear-sky',
    name: 'Central India Post-Monsoon Dry Slot',
    icon: SunIcon,
    category: 'Anticyclonic Subsidence',
    accentColor: '#FBBF24',
    riskLevel: 'LOW',
    rainfall: '0.0 mm/24h',
    cape: '250 J/kg',
    wind: '8 kt',
    description: 'Dominant mid-tropospheric anticyclonic ridge with strong subsidence. High model confidence and low bust risk through Day 7.',
  },
];

export default function WeatherSuite() {
  const [selectedRegime, setSelectedRegime] = useState(SYNOPTIC_REGIMES[0]);

  const SelectedIcon = selectedRegime.icon;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CloudSun className="w-5 h-5 text-accent-400" />
            <h2 className="text-xl font-bold text-text-primary tracking-tight">
              Atmospheric Motion & Weather Intelligence Suite
            </h2>
          </div>
          <p className="text-xs text-text-muted">
            Living SVG vector micro-scenes engineered with Framer Motion for forecaster decision support
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-core text-[0.65rem] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent-400" />
            Framer Motion • 60 FPS
          </span>
          <span className="badge badge-demo text-[0.65rem]">Vector Micro-Scenes</span>
        </div>
      </div>

      {/* Interactive Synoptic Regime Sandbox */}
      <div className="glass-card card-glow p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Synoptic Atmospheric Regime Telemetry
            </h3>
          </div>
          <span className="text-xs text-text-muted">Interactive Sandbox</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Active Living Icon Micro-Scene */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-2xl bg-nerv-900/60 border border-nerv-700/30 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none blur-3xl rounded-full"
              style={{ background: selectedRegime.accentColor }}
            />
            <div className="relative z-10 flex items-center justify-center size-32 rounded-3xl bg-nerv-950/80 border border-nerv-700/40 shadow-2xl mb-4">
              <SelectedIcon size={76} />
            </div>
            <div className="text-center relative z-10">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border border-nerv-700/40 bg-nerv-900/80 text-text-primary">
                {selectedRegime.category}
              </span>
              <p className="text-xs text-text-muted mt-2 font-mono">
                Real-time SVG kinematic rendering
              </p>
            </div>
          </div>

          {/* Regime Telemetry Details */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`badge ${
                  selectedRegime.riskLevel === 'CRITICAL' ? 'badge-critical' :
                  selectedRegime.riskLevel === 'HIGH' ? 'badge-high' :
                  selectedRegime.riskLevel === 'MODERATE' ? 'badge-moderate' : 'badge-low'
                }`}>
                  {selectedRegime.riskLevel} BUST RISK
                </span>
                <span className="text-xs font-mono text-accent-400 font-semibold">
                  {selectedRegime.id.toUpperCase()}
                </span>
              </div>
              <h4 className="text-lg font-bold text-text-primary">
                {selectedRegime.name}
              </h4>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                {selectedRegime.description}
              </p>
            </div>

            {/* Telemetry Chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-3 !bg-nerv-850/40">
                <span className="text-[0.65rem] text-text-muted block">Expected Precip</span>
                <span className="text-sm font-bold text-text-primary">{selectedRegime.rainfall}</span>
              </div>
              <div className="glass-card p-3 !bg-nerv-850/40">
                <span className="text-[0.65rem] text-text-muted block">CAPE (Instability)</span>
                <span className="text-sm font-bold text-text-primary">{selectedRegime.cape}</span>
              </div>
              <div className="glass-card p-3 !bg-nerv-850/40">
                <span className="text-[0.65rem] text-text-muted block">Kinematic Flow</span>
                <span className="text-sm font-bold text-text-primary">{selectedRegime.wind}</span>
              </div>
            </div>

            {/* Select Regime Buttons */}
            <div>
              <p className="text-xs text-text-muted mb-2 font-medium">Select Synoptic Pattern:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYNOPTIC_REGIMES.map((regime) => (
                  <button
                    key={regime.id}
                    onClick={() => setSelectedRegime(regime)}
                    className={`px-3 py-2 rounded-lg text-left text-xs font-medium border transition-all ${
                      selectedRegime.id === regime.id
                        ? 'border-accent-500 bg-accent-500/10 text-accent-300 font-semibold shadow-sm'
                        : 'border-nerv-700/30 bg-nerv-900/40 text-text-muted hover:text-text-primary hover:border-nerv-700/60'
                    }`}
                  >
                    <div className="truncate">{regime.name.split('/')[0]}</div>
                    <span className="text-[0.6rem] text-text-muted">{regime.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete All-Icons Living Gallery */}
      <div className="glass-card card-glow p-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 badge badge-demo text-[0.65rem] mb-3">
            <Thermometer className="w-3 h-3 text-accent-400" />
            Autonomous Micro-Animations
          </div>
          <h3 className="text-xl font-bold tracking-tight text-text-primary mb-2">
            Living Atmospheric Icon Gallery
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Each icon is an autonomous, lightweight SVG micro-scene. Raindrops cycle with gravity acceleration, lightning discharges intermittently, solar rays rotate, and snowfall sways with lateral drift.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
          {ALL_ICONS.map(({ name, Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-3 w-full p-4 rounded-xl border border-nerv-700/30 bg-nerv-900/40 hover:border-accent-500/40 hover:bg-nerv-850/60 transition-all group"
            >
              <div className="flex items-center justify-center size-20 rounded-2xl border border-nerv-700/50 bg-nerv-950/80 shadow-md group-hover:scale-105 transition-transform">
                <Icon size={46} />
              </div>
              <span className="text-xs font-medium text-text-secondary tracking-wide text-center leading-tight">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Spec & Integration Guardrails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2 text-text-primary text-sm font-semibold">
            <Layers className="w-4 h-4 text-accent-400" />
            Zero-Asset SVG Vector Architecture
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Unlike heavy raster GIFs or video loops, these animated icons are pure vector SVGs controlled by Framer Motion math calculations. They scale crisply to any DPI without blurring and carry negligible runtime payload.
          </p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2 text-text-primary text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-accent-400" />
            Decision-Support Context
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            These dynamic indicators represent NWP forecast regime states across the dashboard, giving duty meteorologists an immediate instinctive visual cue of moisture, cloud, and kinematic severity before inspecting raw numerical fields.
          </p>
        </div>
      </div>
    </div>
  );
}
