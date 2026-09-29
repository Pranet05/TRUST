import {
  Shield, AlertTriangle, CheckCircle, FlaskConical,
  ArrowDown, Radio, Layers,
  BarChart3, History as HistoryIcon, Target, CloudRain,
} from 'lucide-react';

const DEMONSTRATED = [
  { name: 'Stage 1 bust-risk engine', badge: 'CORE' },
  { name: 'Spread-only baseline', badge: 'CORE' },
  { name: 'Calibration framework', badge: 'CORE' },
  { name: 'Bust map', badge: 'CORE' },
  { name: 'Trust Horizon', badge: 'CORE' },
  { name: 'Historical analog retrieval', badge: 'CORE' },
  { name: 'Replay Lab', badge: 'CORE' },
  { name: 'SHAP-style risk groups', badge: 'CORE' },
  { name: 'Evidence-grounded interpretation', badge: 'CORE' },
];

const EXPERIMENTAL = [
  { name: 'Stage 2 correction network', badge: 'EXPERIMENTAL' },
  { name: 'EMOS / quantile regression', badge: 'EXPERIMENTAL' },
  { name: 'Corrected forecast uncertainty band', badge: 'EXPERIMENTAL' },
  { name: 'Error Autopsy', badge: 'EXPERIMENTAL' },
  { name: 'Sector panel', badge: 'EXPERIMENTAL' },
  { name: 'Reliability Passport', badge: 'EXPERIMENTAL' },
];

const GUARDRAILS = [
  'Never claim 100% attribution.',
  'Never claim causation from SHAP.',
  'Never use future observations as forecast-time features.',
  'Never fabricate scientific validation numbers.',
  'Never call demo data real IMD data.',
  'Clearly distinguish prototype from planned research.',
  'Show event counts alongside metrics.',
  'Use temporal holdout validation with real data.',
  'Calibration on held-out temporal calibration set.',
  'Display limitations when insufficient events for calibration.',
  'Support both percentile bust and event-bust labels.',
  'Stage 2 is experimental — never present as validated core.',
];

export default function About() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            About NERV-TRUST
          </h1>
        </div>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          NWP Reliability & Error Intelligence — A forecaster-facing reliability layer
          for Indian Numerical Weather Prediction.
        </p>
      </header>

      {/* Core Message */}
      <div className="glass-card gradient-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <Radio className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Core Message</h2>
            <p className="text-sm text-text-secondary">What NERV-TRUST does and does not do</p>
          </div>
        </div>
        <blockquote className="border-l-2 border-accent-500 pl-4 py-2">
          <p className="text-accent-400 text-base font-medium italic">
            "NWP predicts the weather. NERV-TRUST tells the forecaster whether to trust it,
            why, and which past cases failed the same way."
          </p>
        </blockquote>
        <p className="text-sm text-text-secondary mt-4 leading-relaxed">
          NERV-TRUST is <strong className="text-text-primary">not</strong> a new weather model. 
          It is a forecaster-facing reliability layer that sits on top of any NWP or ensemble system 
          (GEFS now, NCUM/NEPS later). It provides calibrated bust-risk detection, historical 
          analog-based error memory, and evidence-grounded physical explanation.
        </p>
      </div>

      {/* Novelty Statement */}
      <div className="glass-card p-5 !bg-nerv-850/40">
        <h3 className="text-sm font-semibold text-accent-400 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Novelty Statement
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          NERV-TRUST combines calibrated forecast-bust detection, historical analog-based error memory 
          and evidence-grounded physical explanation into a forecaster-facing reliability workflow. 
          The novelty is the integration and workflow, not any single ML technique.
        </p>
      </div>

      {/* Leakage Protection */}
      <section className="glass-card card-glow p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent-400" />
          Leakage Protection — Data Flow Architecture
        </h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Forecast Time */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="badge badge-core text-[0.55rem]">FORECAST TIME</span>
            </div>
            <div className="space-y-0">
              {[
                { label: 'GEFS Ensemble', sub: 'Forecast-derived diagnostics', icon: CloudRain },
                { label: 'NERV-TRUST', sub: 'Stage 1 bust-risk engine', icon: Radio },
                { label: 'Bust Probability', sub: 'Per sub-division × lead day', icon: BarChart3 },
              ].map((step, i) => (
                <div key={step.label}>
                  <div className="glass-card p-4 !bg-nerv-850/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-4 h-4 text-accent-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                      <p className="text-xs text-text-muted">{step.sub}</p>
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-4 h-4 text-accent-500/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* After the Event */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="badge badge-demo text-[0.55rem]">AFTER THE EVENT</span>
            </div>
            <div className="space-y-0">
              {[
                { label: 'ERA5 / IMD / IMERG', sub: 'Observations', icon: CloudRain },
                { label: 'Actual Rainfall', sub: 'Observed precipitation', icon: Layers },
                { label: 'Forecast Error', sub: 'abs(forecast − actual)', icon: AlertTriangle },
                { label: 'Bust Label', sub: 'Percentile + Event bust', icon: Target },
                { label: 'Error Memory', sub: 'Stored for analog retrieval', icon: HistoryIcon },
              ].map((step, i) => (
                <div key={step.label}>
                  <div className="glass-card p-3 !bg-nerv-850/30 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-nerv-700/30 flex items-center justify-center shrink-0">
                      <step.icon className="w-3.5 h-3.5 text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{step.label}</p>
                      <p className="text-[0.65rem] text-text-muted">{step.sub}</p>
                    </div>
                  </div>
                  {i < 4 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3 h-3 text-nerv-600/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-4 !bg-green-900/10 !border-green-500/15 mt-6">
          <p className="text-sm text-green-200/80 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-400/70" />
            <strong>Future observations are never used as model inputs at forecast time.</strong>
          </p>
        </div>
      </section>

      {/* Prototype vs Experimental */}
      <section>
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Prototype vs Experimental Components
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Demonstrated */}
          <div className="glass-card card-glow p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-risk-low" />
              <h4 className="text-sm font-semibold text-text-primary">Demonstrated</h4>
            </div>
            <div className="space-y-2">
              {DEMONSTRATED.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-nerv-850/30">
                  <span className="text-xs text-text-secondary">{item.name}</span>
                  <span className="badge badge-core text-[0.5rem]">{item.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experimental */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-text-primary">Experimental / Planned</h4>
            </div>
            <div className="space-y-2">
              {EXPERIMENTAL.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-nerv-850/30">
                  <span className="text-xs text-text-secondary">{item.name}</span>
                  <span className="badge badge-experimental text-[0.5rem]">{item.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Guardrails */}
      <section className="glass-card card-glow p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent-400" />
          Scientific Guardrails
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {GUARDRAILS.map((rule, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-nerv-850/20">
              <span className="text-[0.65rem] text-text-muted font-mono w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-xs text-text-secondary leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info box */}
      <div className="glass-card p-5 !bg-accent-500/5 !border-accent-500/15">
        <p className="text-sm text-text-secondary leading-relaxed">
          This prototype demonstrates the NERV-TRUST workflow using demonstration data. 
          Scientific performance claims require evaluation on verified NWP and observational 
          datasets using temporal holdout validation.
        </p>
      </div>
    </div>
  );
}
