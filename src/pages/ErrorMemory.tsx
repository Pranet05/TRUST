import { useState, useMemo } from 'react';
import {
  Filter, CloudRain, Target,
  ArrowRight, Layers, Droplets, Wind, Zap,
} from 'lucide-react';
import {
  REGIONS, SEASONS, generateHistoricalCases,
  type Region, type Season,
} from '../data/forecasts';

export default function ErrorMemory() {
  const [region, setRegion] = useState<Region>('Kerala');
  const [season, setSeason] = useState<Season>('Monsoon');
  const [leadDay, setLeadDay] = useState(3);
  const [bustOnly, setBustOnly] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const cases = useMemo(() => {
    const all = generateHistoricalCases(region, season, leadDay, '2024-08-15');
    return bustOnly ? all.filter(c => c.bustLabel) : all;
  }, [region, season, leadDay, bustOnly]);

  const selected = cases.find(c => c.id === selectedCase);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Historical Error Memory
          </h1>
          <span className="badge badge-demo text-[0.6rem]">Prototype • Demo Data</span>
        </div>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          Find past forecast situations that resemble the current forecast. 
          Each analog case shows what the model predicted, what actually happened, and the resulting error.
        </p>
      </header>

      {/* Current Case Banner */}
      <div className="glass-card gradient-border p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">Current Case</p>
            <p className="text-base font-semibold text-text-primary">
              {region} • {season} • Day {leadDay}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Region</label>
            <select
              className="form-select"
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Season</label>
            <select
              className="form-select"
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
            >
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Lead Day</label>
            <select
              className="form-select !min-w-[100px]"
              value={leadDay}
              onChange={(e) => setLeadDay(Number(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Day {d}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <input
              type="checkbox"
              id="bust-only"
              checked={bustOnly}
              onChange={(e) => setBustOnly(e.target.checked)}
              className="w-4 h-4 rounded border-nerv-600 bg-nerv-850 accent-accent-500"
            />
            <label htmlFor="bust-only" className="text-xs text-text-secondary cursor-pointer">
              Bust Only
            </label>
          </div>
        </div>
      </section>

      {/* Cases Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Case list */}
        <div className={`${selectedCase ? 'col-span-7' : 'col-span-12'} transition-all duration-300`}>
          <div className="space-y-4">
            {cases.map((c, idx) => (
              <div
                key={c.id}
                className={`glass-card card-glow p-5 cursor-pointer transition-all duration-200 ${
                  selectedCase === c.id ? '!border-accent-500/30' : ''
                } stagger-${idx + 1} animate-fade-in`}
                onClick={() => setSelectedCase(selectedCase === c.id ? null : c.id)}
              >
                <div className="flex items-start justify-between">
                  {/* Left: Case info */}
                  <div className="flex items-start gap-4">
                    {/* Similarity score */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-2xl font-bold text-accent-400">{c.similarity}%</p>
                      <p className="text-[0.6rem] text-text-muted">Similarity</p>
                    </div>

                    {/* Similarity bar */}
                    <div className="w-px h-14 bg-nerv-700/30 mx-1" />

                    {/* Case details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-text-primary">{c.region}</p>
                        {c.bustLabel && <span className="badge badge-critical text-[0.55rem] !px-2 !py-0.5">BUST</span>}
                        {c.eventBust && !c.bustLabel && (
                          <span className="badge badge-high text-[0.55rem] !px-2 !py-0.5">EVENT BUST</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{c.date} • {c.season} • Day {c.leadDay}</p>
                    </div>
                  </div>

                  {/* Right: Rainfall comparison */}
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-text-muted">Forecast</p>
                      <p className="text-base font-bold text-text-primary">{c.forecastRainfall} mm</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Actual</p>
                      <p className="text-base font-bold text-text-primary">{c.actualRainfall} mm</p>
                    </div>
                    <div className="pl-3 border-l border-nerv-700/20">
                      <p className="text-xs text-text-muted">Error</p>
                      <p className="text-base font-bold" style={{
                        color: c.absoluteError > 80 ? '#f87171' : c.absoluteError > 40 ? '#fb923c' : '#4ade80',
                      }}>
                        {c.absoluteError} mm
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[0.55rem] text-text-muted mt-3 text-right">Prototype Data</p>
              </div>
            ))}
          </div>

          {cases.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-text-muted text-sm">No matching cases found with current filters.</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedCase && selected && (
          <div className="col-span-5 animate-fade-in">
            <div className="glass-card card-glow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Case Detail</h3>
                <button
                  className="text-xs text-text-muted hover:text-text-secondary cursor-pointer"
                  onClick={() => setSelectedCase(null)}
                >
                  Close ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="glass-card p-4 !bg-nerv-850/30">
                  <p className="text-base font-semibold text-text-primary mb-1">{selected.region}</p>
                  <p className="text-xs text-text-muted">{selected.date} • {selected.season} • Day {selected.leadDay}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-accent-400">{selected.similarity}%</span>
                    <span className="text-xs text-text-muted">similarity score</span>
                  </div>
                </div>

                {/* Rainfall comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4 !bg-nerv-850/30 text-center">
                    <CloudRain className="w-5 h-5 text-accent-400 mx-auto mb-2" />
                    <p className="text-xs text-text-muted">Forecast</p>
                    <p className="text-xl font-bold text-text-primary">{selected.forecastRainfall} mm</p>
                  </div>
                  <div className="glass-card p-4 !bg-nerv-850/30 text-center">
                    <CloudRain className="w-5 h-5 text-risk-critical mx-auto mb-2" />
                    <p className="text-xs text-text-muted">Actual</p>
                    <p className="text-xl font-bold text-text-primary">{selected.actualRainfall} mm</p>
                  </div>
                </div>

                <div className="glass-card p-4 !bg-nerv-850/30 text-center">
                  <p className="text-xs text-text-muted">Absolute Error</p>
                  <p className="text-2xl font-bold" style={{
                    color: selected.absoluteError > 80 ? '#f87171' : selected.absoluteError > 40 ? '#fb923c' : '#4ade80',
                  }}>
                    {selected.absoluteError} mm
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {selected.bustLabel && <span className="badge badge-critical text-[0.55rem]">PERCENTILE BUST</span>}
                    {selected.eventBust && <span className="badge badge-high text-[0.55rem]">EVENT BUST</span>}
                    {!selected.bustLabel && !selected.eventBust && <span className="badge badge-low text-[0.55rem]">NO BUST</span>}
                  </div>
                </div>

                {/* Risk drivers */}
                <div>
                  <p className="text-xs text-text-muted mb-3">Risk Drivers (Demo Attribution)</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Ensemble Disagreement', val: selected.riskDrivers.ensembleDisagreement, color: '#f97316', icon: Layers },
                      { label: 'Moisture', val: selected.riskDrivers.moisture, color: '#22d3ee', icon: Droplets },
                      { label: 'Dynamics', val: selected.riskDrivers.dynamics, color: '#a78bfa', icon: Wind },
                      { label: 'Instability', val: selected.riskDrivers.instability, color: '#facc15', icon: Zap },
                    ].sort((a, b) => b.val - a.val).map(d => (
                      <div key={d.label} className="flex items-center gap-2">
                        <d.icon className="w-3 h-3" style={{ color: d.color }} />
                        <span className="text-[0.65rem] text-text-muted w-32 truncate">{d.label}</span>
                        <div className="flex-1 h-1.5 bg-nerv-850 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.val}%`,
                              background: `linear-gradient(90deg, ${d.color}88, ${d.color})`,
                            }}
                          />
                        </div>
                        <span className="text-[0.65rem] text-text-secondary w-8 text-right">{d.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[0.55rem] text-text-muted mt-4 text-right">Prototype Data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
