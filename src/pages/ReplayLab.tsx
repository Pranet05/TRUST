import { useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  FlaskConical, CloudRain, AlertTriangle, Clock,
  Shield, Eye, ChevronDown, ChevronUp, BarChart3,
} from 'lucide-react';
import { KERALA_2018_CASE } from '../data/forecasts';
import { RainIcon, HeavyRainIcon } from '@/components/ui/animated-weather-icons';

function StatusDot({ status }: { status: string }) {
  const cls = status === 'Normal' ? 'normal' : status === 'Elevated' ? 'elevated' : 'critical';
  return <span className={`status-dot ${cls}`} />;
}

const RISK_COLORS: Record<string, string> = {
  'LOW': '#22c55e',
  'MODERATE': '#eab308',
  'HIGH': '#f97316',
  'VERY HIGH': '#ef4444',
};

export default function ReplayLab() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const kase = KERALA_2018_CASE;

  const timelineData = kase.timeline.map(t => ({
    day: `Day ${t.day}`,
    probability: t.probability,
    risk: t.risk,
  }));

  const riskDriverData = [
    { name: 'Ensemble\nDisagreement', value: kase.riskDrivers.ensembleDisagreement.contribution, color: '#f97316' },
    { name: 'Moisture', value: kase.riskDrivers.moisture.contribution, color: '#22d3ee' },
    { name: 'Instability', value: kase.riskDrivers.instability.contribution, color: '#facc15' },
    { name: 'Dynamics', value: kase.riskDrivers.dynamics.contribution, color: '#a78bfa' },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Replay Lab
          </h1>
          <span className="badge badge-demo text-[0.6rem]">Prototype Case / Demo Data</span>
        </div>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          Revisit a historical forecast and compare what was predicted with what actually happened.
          Understand why the system would have flagged this case.
        </p>
      </header>

      {/* Case Banner */}
      <div className="glass-card gradient-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{kase.title}</h2>
            <p className="text-sm text-text-secondary mt-1">{kase.description}</p>
          </div>
        </div>
      </div>

      {/* Forecast vs Actual — Large comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FORECAST */}
        <div className="glass-card card-glow p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <div className="w-full h-full" style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.5), transparent 70%)',
            }} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-accent-400" />
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
                Forecast (NWP)
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-nerv-900/80 border border-nerv-700/40 flex items-center justify-center shadow-md">
              <RainIcon size={30} />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs text-text-muted mb-1">Predicted Rainfall</p>
              <p className="text-4xl font-bold text-text-primary">{kase.forecast.rainfall} <span className="text-lg text-text-muted">mm</span></p>
            </div>

            <div className="divider !my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Bust Probability</p>
                <p className="text-2xl font-bold text-risk-high">{Math.round(kase.forecast.bustProbability * 100)}%</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Risk Level</p>
                <span className="badge badge-high">{kase.forecast.riskLevel}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Ensemble Mean</p>
                <p className="text-lg font-semibold text-text-primary">{kase.forecast.ensembleMean} mm</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Ensemble Spread</p>
                <p className="text-lg font-semibold text-text-primary">{kase.forecast.ensembleSpread} mm</p>
              </div>
            </div>
          </div>

          <p className="text-[0.55rem] text-text-muted mt-4">Prototype Data</p>
        </div>

        {/* ACTUAL */}
        <div className="glass-card card-glow p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <div className="w-full h-full" style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.5), transparent 70%)',
            }} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-risk-critical" />
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
                Actual Outcome
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-nerv-900/80 border border-risk-critical/30 flex items-center justify-center shadow-md">
              <HeavyRainIcon size={30} />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs text-text-muted mb-1">Observed Rainfall</p>
              <p className="text-4xl font-bold text-text-primary">{kase.actual.rainfall} <span className="text-lg text-text-muted">mm</span></p>
            </div>

            <div className="divider !my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Forecast Error</p>
                <p className="text-2xl font-bold text-risk-critical">{kase.actual.observedError} mm</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Bust Classification</p>
                <span className="badge badge-critical">BUST — CONFIRMED</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Percentile Bust</p>
                <p className="text-sm font-semibold text-risk-critical flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Yes
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Event Bust</p>
                <p className="text-sm font-semibold text-risk-critical flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Yes (≥ 64.5 mm/day)
                </p>
              </div>
            </div>
          </div>

          <p className="text-[0.55rem] text-text-muted mt-4">Prototype Data</p>
        </div>
      </div>

      {/* Risk Evolution Timeline */}
      <section className="glass-card card-glow p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-400" />
          Risk Evolution Timeline
        </h3>

        {/* Visual timeline */}
        <div className="flex items-center gap-0 mb-6">
          {kase.timeline.map((t, i) => (
            <div key={t.day} className="flex-1 flex items-center">
              <div className="flex flex-col items-center w-full">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
                  style={{
                    backgroundColor: `${RISK_COLORS[t.risk]}18`,
                    borderColor: RISK_COLORS[t.risk],
                    color: RISK_COLORS[t.risk],
                  }}
                >
                  D{t.day}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold" style={{ color: RISK_COLORS[t.risk] }}>
                    {t.label}
                  </p>
                  <p className="text-[0.6rem] text-text-muted mt-0.5">
                    {Math.round(t.probability * 100)}%
                  </p>
                </div>
              </div>
              {i < kase.timeline.length - 1 && (
                <div className="w-full h-0.5 -mt-6" style={{
                  background: `linear-gradient(90deg, ${RISK_COLORS[t.risk]}, ${RISK_COLORS[kase.timeline[i + 1].risk]})`,
                  opacity: 0.3,
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Probability chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,138,184,0.08)" />
              <XAxis dataKey="day" tick={{ fill: '#4a6e8f', fontSize: 11 }} stroke="rgba(90,138,184,0.3)" />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                tick={{ fill: '#4a6e8f', fontSize: 11 }}
                stroke="rgba(90,138,184,0.3)"
              />
              <Tooltip
                formatter={(value: any) => [`${Math.round(Number(value) * 100)}%`, 'Bust Probability']}
                contentStyle={{
                  background: 'rgba(15,28,52,0.95)',
                  border: '1px solid rgba(90,138,184,0.2)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#7aacd4' }}
              />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                {timelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.risk]} fillOpacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Risk Drivers */}
      <div className="grid grid-cols-12 gap-6">
        {/* Driver bars */}
        <div className="col-span-5">
          <div className="glass-card card-glow p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent-400" />
              Risk Driver Attribution
            </h3>
            <div className="space-y-4">
              {riskDriverData.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-text-secondary">{d.name.replace('\n', ' ')}</span>
                    <span className="text-sm font-bold text-text-primary">{d.value}%</span>
                  </div>
                  <div className="h-2.5 bg-nerv-850 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${d.value}%`,
                        background: `linear-gradient(90deg, ${d.color}88, ${d.color})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[0.55rem] text-text-muted mt-4">SHAP-style demo attribution</p>
          </div>
        </div>

        {/* What the system would have told the forecaster */}
        <div className="col-span-7">
          <div className="glass-card p-6 h-full">
            <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-400" />
              What the system would have told the forecaster
            </h3>

            <div className="space-y-3">
              {kase.forecasterInsights.map((insight) => (
                <div key={insight.signal} className="evidence-card flex items-start gap-3">
                  <StatusDot status={insight.status === 'Warning' ? 'Elevated' : insight.status} />
                  <div>
                    <p className="text-xs font-semibold text-text-primary mb-0.5">{insight.signal}</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{insight.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-3 !bg-amber-900/10 !border-amber-500/15 mt-4">
              <p className="text-[0.7rem] text-amber-200/80 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/70" />
                <span>
                  These are model-attributed signals, not causal explanations.
                  The model flags risk factors based on learned patterns from historical busts.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics Detail */}
      <section className="glass-card p-6">
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        >
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Eye className="w-4 h-4 text-accent-400" />
            Diagnostic Evidence Detail
          </h3>
          {showDiagnostics ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {showDiagnostics && (
          <div className="mt-5 grid grid-cols-3 gap-3 animate-fade-in">
            {Object.entries(kase.diagnostics).map(([key, diag]) => (
              <div key={key} className="evidence-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="evidence-id">{key.toUpperCase()}</span>
                  <StatusDot status={diag.status} />
                </div>
                <p className="text-xs text-text-secondary capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {diag.value} <span className="text-xs text-text-muted">{diag.unit}</span>
                </p>
                <p className="text-[0.65rem] text-text-muted mt-1">
                  Threshold: {diag.threshold} {diag.unit}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
