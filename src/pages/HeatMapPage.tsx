import { useState } from 'react';
import { Flame, ShieldAlert, Layers, MapPin, Sparkles, AlertTriangle } from 'lucide-react';
import NwpHeatMap from '../components/NwpHeatMap';
import { REGIONS, type Region } from '../data/forecasts';

export default function HeatMapPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region>('Kerala');
  const [leadDay, setLeadDay] = useState(3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-accent-400" />
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              NWP Bust-Risk Geospatial Heat Map Intelligence
            </h1>
          </div>
          <p className="text-xs text-text-muted">
            Continuous spatial density of forecast error risk, ensemble divergence, and convective charge across the Indian subcontinent & oceanic gateways
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-nerv-900/80 px-3 py-1.5 rounded-lg border border-nerv-700/30">
            <label className="text-xs text-text-muted font-medium">Lead Day:</label>
            <select
              className="bg-transparent text-xs font-bold text-accent-400 outline-none cursor-pointer"
              value={leadDay}
              onChange={(e) => setLeadDay(Number(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="bg-nerv-900 text-text-primary">
                  Day {d} (+{d * 24}h)
                </option>
              ))}
            </select>
          </div>
          <span className="badge badge-demo text-[0.65rem] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent-400" />
            Geospatial Heatmap Engine
          </span>
        </div>
      </header>

      {/* Synoptic Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-risk-critical" />
            High Bust Nodes
          </div>
          <p className="text-2xl font-bold text-text-primary">3 Sub-Divisions</p>
          <span className="text-[0.65rem] text-risk-critical font-medium">Western Ghats & Odisha</span>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <Layers className="w-4 h-4 text-accent-400" />
            Max Ensemble Spread
          </div>
          <p className="text-2xl font-bold text-accent-400">54.2 mm</p>
          <span className="text-[0.65rem] text-text-muted">High model divergence</span>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            Peak Regional CAPE
          </div>
          <p className="text-2xl font-bold text-text-primary">3,420 J/kg</p>
          <span className="text-[0.65rem] text-amber-400/90 font-medium">Pre-monsoon Kalbaishakhi</span>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <MapPin className="w-4 h-4 text-text-secondary" />
            Selected Target
          </div>
          <p className="text-xl font-bold text-text-primary truncate">{selectedRegion}</p>
          <span className="text-[0.65rem] text-accent-400">Lead Day {leadDay} Focus</span>
        </div>
      </div>

      {/* Main Interactive Mapbox Heat Map Component */}
      <NwpHeatMap
        selectedRegion={selectedRegion}
        leadDay={leadDay}
        onSelectRegion={(reg) => setSelectedRegion(reg)}
        className="w-full"
      />

      {/* Regional Quick Selectors & Scientific Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent-400" />
            IMD Meteorological Sub-Divisions Overview
          </h3>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Click any sub-division below to center the geospatial heat map and inspect local forecast reliability dynamics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {REGIONS.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRegion === reg
                    ? 'border-accent-500 bg-accent-500/15 shadow-sm'
                    : 'border-nerv-700/30 bg-nerv-900/40 hover:border-nerv-700/60 hover:bg-nerv-850/60'
                }`}
              >
                <div className="text-xs font-bold text-text-primary truncate">{reg}</div>
                <div className="text-[0.65rem] text-accent-400 mt-1 flex items-center justify-between">
                  <span>Day {leadDay} Telemetry</span>
                  <span className="text-text-muted">Inspect →</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 !bg-amber-900/10 !border-amber-500/20">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-200">Scientific Interpretation Guardrail</h4>
                <p className="text-[0.7rem] text-amber-200/80 mt-1 leading-relaxed">
                  Heat map density illustrates relative risk concentration derived from diagnostic ensemble divergence and thermodynamic proxies. It does not replace operational radar or satellite nowcasting.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h4 className="text-xs font-bold text-text-primary mb-2">Palette Integration</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              The heat map uses the calibrated NERV risk palette: transitioning from low risk emerald (<code className="text-emerald-500">#22c55e</code>) through amber (<code className="text-amber-500">#eab308</code>) and orange (<code className="text-orange-500">#f97316</code>), culminating in saturated crimson (<code className="text-accent-400">#EA3852</code>) and glowing white-hot cores at critical bust probability nodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
