import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, LineChart,
} from 'recharts';
import {
  ShieldCheck, BarChart3, AlertTriangle,
  Clock, TrendingUp, Layers,
} from 'lucide-react';
import { VALIDATION_METRICS } from '../data/forecasts';

function MetricCard({ name, value, status }: { name: string; value: number | null; status: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-text-muted mb-2">{name}</p>
      {value !== null ? (
        <p className="text-xl font-bold text-text-primary">{value.toFixed(3)}</p>
      ) : (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-text-muted" />
          <p className="text-xs text-text-muted italic">{status}</p>
        </div>
      )}
    </div>
  );
}

export default function Validation() {
  const { metrics, reliabilityDiagram, modelLadder, bustCounts } = VALIDATION_METRICS;

  // Reliability diagram data
  const reliabilityData = reliabilityDiagram.points.map(p => ({
    predicted: Math.round(p.predicted * 100),
    observed: Math.round(p.observed * 100),
  }));

  const perfectLine = [
    { predicted: 0, observed: 0 },
    { predicted: 100, observed: 100 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Model Validation
          </h1>
          <span className="badge badge-demo text-[0.6rem]">Demo Metrics</span>
        </div>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          Model verification and performance metrics. Scientific performance claims require 
          evaluation on verified NWP and observational datasets using temporal holdout validation.
        </p>
      </header>

      {/* Warning banner */}
      <div className="glass-card p-4 !bg-amber-900/10 !border-amber-500/15">
        <p className="text-sm text-amber-200/80 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400/70" />
          <span>
            <strong>Demo metrics — not scientific validation.</strong> The metrics shown below are placeholders 
            awaiting temporal validation on verified datasets. No performance claims are made until measured.
          </span>
        </p>
      </div>

      {/* Bust Event Counts */}
      <section>
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Bust Event Counts
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card card-glow p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-accent-400" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">Percentile Busts</h4>
            {bustCounts.percentile.busts !== null ? (
              <p className="text-3xl font-bold text-text-primary">
                {bustCounts.percentile.busts} / {bustCounts.percentile.total}
                <span className="text-sm text-text-muted ml-1">forecasts</span>
              </p>
            ) : (
              <p className="text-sm text-text-muted italic flex items-center gap-1 justify-center">
                <Clock className="w-3.5 h-3.5" /> Pending dataset evaluation
              </p>
            )}
          </div>
          <div className="glass-card card-glow p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-risk-high/10 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-risk-high" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">Event Busts</h4>
            {bustCounts.event.busts !== null ? (
              <p className="text-3xl font-bold text-text-primary">
                {bustCounts.event.busts} / {bustCounts.event.total}
                <span className="text-sm text-text-muted ml-1">forecasts</span>
              </p>
            ) : (
              <p className="text-sm text-text-muted italic flex items-center gap-1 justify-center">
                <Clock className="w-3.5 h-3.5" /> Pending dataset evaluation
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section>
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Verification Metrics
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m) => (
            <MetricCard key={m.name} name={m.name} value={m.value} status={m.status} />
          ))}
        </div>
      </section>

      {/* Reliability Diagram */}
      <section className="glass-card card-glow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent-400" />
            Reliability Diagram
          </h3>
          <span className="badge badge-demo text-[0.55rem]">Illustrative / Demo</span>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,138,184,0.08)" />
              <XAxis
                type="number"
                dataKey="predicted"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                label={{ value: 'Predicted Probability (%)', position: 'insideBottom', offset: -5, fill: '#4a6e8f', fontSize: 11 }}
                tick={{ fill: '#4a6e8f', fontSize: 11 }}
                stroke="rgba(90,138,184,0.3)"
              />
              <YAxis
                type="number"
                dataKey="observed"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                label={{ value: 'Observed Frequency (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#4a6e8f', fontSize: 11 }}
                tick={{ fill: '#4a6e8f', fontSize: 11 }}
                stroke="rgba(90,138,184,0.3)"
              />
              <Tooltip
                formatter={(value: any) => [`${value}%`]}
                contentStyle={{
                  background: 'rgba(15,28,52,0.95)',
                  border: '1px solid rgba(90,138,184,0.2)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              {/* Perfect calibration line */}
              <Line
                data={perfectLine}
                type="monotone"
                dataKey="observed"
                stroke="rgba(90,138,184,0.3)"
                strokeDasharray="6 4"
                dot={false}
                name="Perfect Calibration"
              />
              {/* Actual reliability */}
              <Line
                data={reliabilityData}
                type="monotone"
                dataKey="observed"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ fill: '#06b6d4', stroke: '#0a1628', strokeWidth: 2, r: 4 }}
                name="Model Calibration (Demo)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[0.6rem] text-text-muted mt-2">
          Dashed line = perfect calibration. Closer to the dashed line = better calibrated model.
          This is illustrative demo data.
        </p>
      </section>

      {/* Model Comparison Ladder */}
      <section className="glass-card card-glow p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-400" />
          Model Comparison Ladder
        </h3>

        <div className="space-y-0">
          {modelLadder.map((model, idx) => (
            <div key={model.name} className="flex items-center">
              {/* Connector line */}
              <div className="w-12 flex flex-col items-center">
                <div
                  className="w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: model.status === 'baseline' ? '#4a6e8f'
                      : model.status === 'core' ? '#22c55e'
                      : '#c084fc',
                    backgroundColor: model.status === 'baseline' ? '#4a6e8f18'
                      : model.status === 'core' ? '#22c55e18'
                      : '#c084fc18',
                  }}
                />
                {idx < modelLadder.length - 1 && (
                  <div className="w-px h-8 bg-nerv-700/30" />
                )}
              </div>

              {/* Model card */}
              <div className="flex-1 glass-card p-3 mb-2 flex items-center justify-between !bg-nerv-850/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">{model.name}</span>
                </div>
                <span className={`badge text-[0.55rem] ${
                  model.status === 'baseline' ? 'badge-demo' :
                  model.status === 'core' ? 'badge-core' :
                  'badge-experimental'
                }`}>
                  {model.status === 'baseline' ? 'BASELINE' :
                   model.status === 'core' ? 'CORE' :
                   'EXPERIMENTAL'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-3 !bg-amber-900/10 !border-amber-500/15 mt-4">
          <p className="text-[0.7rem] text-amber-200/80">
            <strong>No performance superiority is claimed</strong> without measured results.
            Stage 2 is labelled as experimental/planned and is only retained if it beats or matches the calibrated baselines.
          </p>
        </div>
      </section>
    </div>
  );
}
