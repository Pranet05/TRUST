import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Search, AlertTriangle, Shield, Droplets, Wind, Zap, Info,
  BarChart3, Eye, ChevronRight, Target, Clock, CloudRain,
  Layers, TrendingUp, Flame, History as HistoryIcon,
} from 'lucide-react';
import {
  REGIONS, SEASONS,
  generateBustProbabilities, calculateTrustHorizon,
  generateForecastCase, generateRiskDrivers, generateEvidence,
  generateHistoricalCases, generateInterpretation,
  type Region, type Season,
} from '../data/forecasts';
import {
  SunIcon, PartlyCloudyIcon, RainIcon, HeavyRainIcon,
  ThunderIcon, FogIcon,
} from '@/components/ui/animated-weather-icons';
import NwpHeatMap from '../components/NwpHeatMap';

// Reusable badge for risk level
function RiskBadge({ level }: { level: string }) {
  const cls =
    level === 'LOW' ? 'badge-low' :
    level === 'MODERATE' ? 'badge-moderate' :
    level === 'HIGH' ? 'badge-high' :
    'badge-critical';
  return <span className={`badge ${cls}`}>{level} RISK</span>;
}

function StatusDot({ status }: { status: string }) {
  const cls = status === 'Normal' ? 'normal' : status === 'Elevated' ? 'elevated' : 'critical';
  return <span className={`status-dot ${cls}`} />;
}

// Custom chart tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 !border-nerv-600/30 text-sm">
      <p className="text-text-muted text-xs mb-1">Day {label}</p>
      <p className="text-text-primary font-semibold">
        {(payload[0].value * 100).toFixed(0)}% bust probability
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [region, setRegion] = useState<Region>('Kerala');
  const [season, setSeason] = useState<Season>('Monsoon');
  const [leadDay, setLeadDay] = useState(3);
  const [dateStr, setDateStr] = useState('2024-08-15');
  const [threshold, setThreshold] = useState(0.70);
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedAnalog, setSelectedAnalog] = useState<string | null>(null);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [topView, setTopView] = useState<'chart' | 'heatmap'>('chart');

  // Compute all derived data
  const bustProbabilities = useMemo(() =>
    generateBustProbabilities(region, season, dateStr),
    [region, season, dateStr, analysisKey]
  );

  const trustHorizon = useMemo(() =>
    calculateTrustHorizon(bustProbabilities, threshold),
    [bustProbabilities, threshold]
  );

  const currentDayProb = useMemo(() =>
    bustProbabilities.find(p => p.leadDay === leadDay),
    [bustProbabilities, leadDay]
  );

  const forecastCase = useMemo(() =>
    generateForecastCase(region, season, leadDay, dateStr),
    [region, season, leadDay, dateStr, analysisKey]
  );

  const riskDrivers = useMemo(() =>
    generateRiskDrivers(region, season, leadDay, dateStr),
    [region, season, leadDay, dateStr, analysisKey]
  );

  const evidence = useMemo(() =>
    generateEvidence(forecastCase, riskDrivers),
    [forecastCase, riskDrivers]
  );

  const interpretation = useMemo(() =>
    generateInterpretation(riskDrivers, evidence, currentDayProb?.bustProbability || 0),
    [riskDrivers, evidence, currentDayProb]
  );

  const historicalCases = useMemo(() =>
    generateHistoricalCases(region, season, leadDay, dateStr),
    [region, season, leadDay, dateStr, analysisKey]
  );

  const weatherIconInfo = useMemo(() => {
    if (forecastCase.forecastRainfall > 70) {
      return { Icon: HeavyRainIcon, label: 'Heavy Convective Monsoonal Rain', color: '#3b82f6' };
    }
    if (forecastCase.cape > 2200) {
      return { Icon: ThunderIcon, label: 'Severe Convective Instability / Thunderstorm', color: '#f59e0b' };
    }
    if (forecastCase.forecastRainfall > 25) {
      return { Icon: RainIcon, label: 'Sustained Monsoonal Rainfall', color: '#60a5fa' };
    }
    if (forecastCase.forecastRainfall > 5) {
      return { Icon: PartlyCloudyIcon, label: 'Scattered Cloud & Passing Showers', color: '#94a3b8' };
    }
    if (season === 'Winter') {
      return { Icon: FogIcon, label: 'Boundary Layer Radiation Fog', color: '#cbd5e1' };
    }
    return { Icon: SunIcon, label: 'Clear Sky / High Insolation Regime', color: '#fbbf24' };
  }, [forecastCase.forecastRainfall, forecastCase.cape, season]);

  // Chart data
  const chartData = bustProbabilities.map(p => ({
    day: p.leadDay,
    probability: p.bustProbability,
    isTrustHorizon: p.leadDay === trustHorizon,
  }));

  // Risk driver bars
  const driverData = [
    { name: 'Ensemble\nDisagreement', value: riskDrivers.ensembleDisagreement, color: '#f97316', icon: Layers },
    { name: 'Moisture', value: riskDrivers.moisture, color: '#22d3ee', icon: Droplets },
    { name: 'Dynamics', value: riskDrivers.dynamics, color: '#a78bfa', icon: Wind },
    { name: 'Instability', value: riskDrivers.instability, color: '#facc15', icon: Zap },
  ].sort((a, b) => b.value - a.value);

  const handleAnalyze = () => {
    setAnalysisKey(k => k + 1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                NERV-TRUST
              </h1>
              <span className="badge badge-demo text-[0.6rem]">Prototype • Demo Data</span>
            </div>
            <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
              Forecast reliability layer for identifying when an NWP forecast is likely to fail,
              why the model flags it, and what happened in similar historical cases.
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-5 glass-card p-5 gradient-border">
          <p className="text-accent-400 text-sm font-medium italic">
            "Know when to trust the forecast. Know why. Learn from what failed before."
          </p>
          <div className="flex gap-8 mt-4">
            {[
              { num: '01', title: 'Calibrated Bust Risk', desc: 'Know when forecast reliability begins to degrade.' },
              { num: '02', title: 'Error Memory', desc: 'Find historical cases where similar forecasts failed.' },
              { num: '03', title: 'Evidence-Grounded Explanation', desc: 'Understand model-attributed risk using computed diagnostics.' },
            ].map(usp => (
              <div key={usp.num} className="flex-1">
                <span className="text-accent-400/50 text-xs font-mono font-bold">{usp.num}</span>
                <h3 className="text-text-primary text-sm font-semibold mt-1">{usp.title}</h3>
                <p className="text-text-muted text-xs mt-1 leading-relaxed">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Forecast Selection
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">IMD Sub-Division</label>
            <select
              className="form-select"
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Forecast Date</label>
            <input
              type="date"
              className="form-input"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
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
            <label className="block text-xs text-text-muted mb-1.5">Bust Threshold</label>
            <select
              className="form-select !min-w-[100px]"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            >
              <option value={0.5}>50%</option>
              <option value={0.6}>60%</option>
              <option value={0.7}>70%</option>
              <option value={0.8}>80%</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleAnalyze}>
            <Search className="w-4 h-4" />
            Analyze Forecast
          </button>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Bust Probability Card */}
        <div className="lg:col-span-4">
          <div className="glass-card card-glow p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                background: currentDayProb && currentDayProb.bustProbability >= 0.7
                  ? 'radial-gradient(circle at center, rgba(239,68,68,0.3), transparent 70%)'
                  : currentDayProb && currentDayProb.bustProbability >= 0.5
                  ? 'radial-gradient(circle at center, rgba(249,115,22,0.3), transparent 70%)'
                  : 'radial-gradient(circle at center, rgba(34,197,94,0.2), transparent 70%)',
              }} />
            </div>

            {/* Living Atmospheric Micro-Scene */}
            <div className="relative z-10 mb-3 flex flex-col items-center">
              <div className="size-16 rounded-2xl bg-nerv-900/80 border border-nerv-700/40 flex items-center justify-center shadow-lg hover:border-accent-500/40 transition-colors">
                <weatherIconInfo.Icon size={42} />
              </div>
              <span className="text-[0.65rem] text-accent-300 font-medium mt-1.5 max-w-[220px] text-center leading-tight">
                {weatherIconInfo.label}
              </span>
            </div>

            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1 relative z-10">
              Bust Probability — Day {leadDay}
            </p>

            <div className="relative z-10 mb-2">
              <span className="metric-value text-3xl font-bold" style={{
                color: currentDayProb && currentDayProb.bustProbability >= 0.7 ? '#f87171'
                  : currentDayProb && currentDayProb.bustProbability >= 0.5 ? '#fb923c'
                  : currentDayProb && currentDayProb.bustProbability >= 0.3 ? '#facc15'
                  : '#4ade80',
              }}>
                {currentDayProb ? `${Math.round(currentDayProb.bustProbability * 100)}%` : '—'}
              </span>
            </div>

            {currentDayProb && (
              <div className="relative z-10 space-y-3">
                <RiskBadge level={currentDayProb.riskLevel} />
                <div className="space-y-1">
                  <p className="text-sm text-text-secondary flex items-center gap-2 justify-center">
                    <Clock className="w-3.5 h-3.5" />
                    Trust Horizon: <span className="font-semibold text-text-primary">
                      {trustHorizon ? `Day ${trustHorizon}` : 'Beyond Day 10'}
                    </span>
                  </p>
                  <p className="text-xs text-text-muted">
                    Threshold: {Math.round(threshold * 100)}%
                  </p>
                </div>
              </div>
            )}

            <p className="text-[0.6rem] text-text-muted mt-4 relative z-10">Prototype Data</p>
          </div>
        </div>

        {/* Trust Horizon Chart & Geospatial Heat Map Container */}
        <div className="lg:col-span-8">
          <div className="glass-card card-glow p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-nerv-950/70 p-1 rounded-lg border border-nerv-700/30">
                  <button
                    onClick={() => setTopView('chart')}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      topView === 'chart'
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Timeline Curve
                  </button>
                  <button
                    onClick={() => setTopView('heatmap')}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      topView === 'heatmap'
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-accent-400" />
                    Geospatial Heat Map
                  </button>
                </div>
              </div>

              {topView === 'chart' && trustHorizon && (
                <span className="text-xs text-text-muted">
                  Trust Horizon at Day {trustHorizon} (≥{Math.round(threshold * 100)}%)
                </span>
              )}

              {topView === 'heatmap' && (
                <Link to="/heatmap" className="text-xs text-accent-400 hover:text-accent-300 font-semibold flex items-center gap-1">
                  Full Geospatial Intelligence View →
                </Link>
              )}
            </div>

            {topView === 'chart' ? (
              <>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bustGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EA3852" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#EA3852" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(199,48,70,0.12)" />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(v) => `Day ${v}`}
                        stroke="rgba(199,48,70,0.3)"
                        tick={{ fill: '#9e646e', fontSize: 11 }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        tickFormatter={(v) => `${Math.round(v * 100)}%`}
                        stroke="rgba(199,48,70,0.3)"
                        tick={{ fill: '#9e646e', fontSize: 11 }}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine
                        y={threshold}
                        stroke="#f97316"
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                        label={{
                          value: `${Math.round(threshold * 100)}% threshold`,
                          position: 'insideTopRight',
                          fill: '#f97316',
                          fontSize: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="probability"
                        stroke="#EA3852"
                        strokeWidth={2.5}
                        fill="url(#bustGradient)"
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.isTrustHorizon) {
                            return (
                              <g key={`dot-${payload.day}`}>
                                <circle cx={cx} cy={cy} r={8} fill="#f97316" fillOpacity={0.25} />
                                <circle cx={cx} cy={cy} r={5} fill="#f97316" stroke="#fff" strokeWidth={2} />
                              </g>
                            );
                          }
                          return (
                            <circle
                              key={`dot-${payload.day}`}
                              cx={cx} cy={cy} r={3}
                              fill="#EA3852" stroke="#1c060a" strokeWidth={2}
                            />
                          );
                        }}
                        activeDot={{ r: 5, fill: '#EA3852', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[0.6rem] text-text-muted mt-2 text-right">Prototype Data</p>
              </>
            ) : (
              <div className="mt-2">
                <NwpHeatMap
                  selectedRegion={region}
                  leadDay={leadDay}
                  onSelectRegion={(r) => setRegion(r)}
                  className="!border-none !shadow-none !bg-transparent"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forecast Summary Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
            <CloudRain className="w-4 h-4" />
            Forecast Summary
          </h3>
          <Link to="/weather-suite" className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 font-medium transition-colors">
            Atmospheric Motion Suite
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Forecast Rainfall', value: `${forecastCase.forecastRainfall} mm`, icon: weatherIconInfo.Icon, isAnimated: true },
            { label: 'Ensemble Mean', value: `${forecastCase.ensembleMean} mm`, icon: BarChart3 },
            { label: 'Ensemble Spread', value: `${forecastCase.ensembleSpread} mm`, icon: Layers },
            { label: 'Historical 90th %ile Error', value: '31 mm', icon: AlertTriangle },
            { label: 'Lead Day', value: `Day ${leadDay}`, icon: Clock },
            { label: 'Season', value: season, icon: Target },
          ].map((item) => (
            <div key={item.label} className="glass-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {item.isAnimated ? (
                    <div className="size-5 flex items-center justify-center">
                      <item.icon size={20} />
                    </div>
                  ) : (
                    <item.icon className="w-3.5 h-3.5 text-text-muted" />
                  )}
                  <span className="text-xs text-text-muted">{item.label}</span>
                </div>
                <p className="text-lg font-bold text-text-primary">{item.value}</p>
              </div>
              <p className="text-[0.55rem] text-text-muted mt-2">Prototype Data</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Drivers + Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Drivers */}
        <div className="lg:col-span-5">
          <div className="glass-card card-glow p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent-400" />
                Risk Drivers
              </h3>
              <span className="badge badge-demo text-[0.55rem]">SHAP-style Demo</span>
            </div>

            <div className="space-y-4">
              {driverData.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <d.icon className="w-3.5 h-3.5" style={{ color: d.color }} />
                      <span className="text-xs text-text-secondary">{d.name.replace('\n', ' ')}</span>
                    </div>
                    <span className="text-sm font-bold text-text-primary">{d.value}%</span>
                  </div>
                  <div className="h-2 bg-nerv-850 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${d.value}%`,
                        background: `linear-gradient(90deg, ${d.color}88, ${d.color})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn-secondary mt-5 w-full"
              onClick={() => setShowEvidence(!showEvidence)}
            >
              <Eye className="w-3.5 h-3.5" />
              {showEvidence ? 'Hide Evidence' : 'View Evidence'}
            </button>

            {/* Evidence panel */}
            {showEvidence && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {evidence.filter(e => e.status !== 'Normal').map((ev, i) => (
                  <div key={ev.id} className={`evidence-card stagger-${i + 1} animate-fade-in`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="evidence-id">{ev.id}</span>
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={ev.status} />
                        <span className="text-xs" style={{
                          color: ev.status === 'Critical' ? '#f87171' : ev.status === 'Elevated' ? '#facc15' : '#4ade80',
                        }}>{ev.status}</span>
                      </div>
                    </div>
                    <p className="text-text-secondary text-xs">
                      {ev.label}: <span className="text-text-primary font-semibold">{ev.currentValue} {ev.unit}</span>
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      Reference threshold: {ev.referenceThreshold} {ev.unit}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interpretation */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 h-full">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-400" />
              Why is this forecast at risk?
            </h3>

            <div className="glass-card p-4 !bg-nerv-850/40 mb-5">
              <p className="text-sm text-text-secondary leading-relaxed">
                {interpretation}
              </p>
            </div>

            {/* Evidence cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {evidence.filter(e => e.status !== 'Normal').slice(0, 4).map((ev) => (
                <div key={ev.id} className="evidence-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="evidence-id">{ev.id}</span>
                    <StatusDot status={ev.status} />
                  </div>
                  <p className="text-xs text-text-secondary">
                    {ev.label}: <span className="font-semibold text-text-primary">{ev.currentValue} {ev.unit}</span>
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Ref: {ev.referenceThreshold} {ev.unit}
                  </p>
                </div>
              ))}
            </div>

            <div className="glass-card p-3 !bg-amber-900/10 !border-amber-500/15">
              <p className="text-[0.7rem] text-amber-200/80 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/70" />
                <span>
                  <strong>Attribution ≠ causation.</strong> Interpretations are generated only from available computed diagnostics. 
                  The model attributes risk factors but does not claim causal relationships.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Error Memory Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-accent-400" />
            Historical Error Memory — Top Similar Cases
          </h3>
          <Link to="/error-memory" className="btn-secondary text-xs">
            View all 5 similar cases
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {historicalCases.slice(0, 3).map((c, idx) => (
            <div
              key={c.id}
              className={`glass-card card-glow p-5 cursor-pointer stagger-${idx + 1} animate-fade-in`}
              onClick={() => setSelectedAnalog(selectedAnalog === c.id ? null : c.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{c.region}</p>
                  <p className="text-xs text-text-muted">{c.date} • Day {c.leadDay}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent-400">{c.similarity}%</p>
                  <p className="text-[0.6rem] text-text-muted">Similarity</p>
                </div>
              </div>

              <div className="divider !my-3" />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-text-muted">Forecast</p>
                  <p className="text-text-primary font-semibold">{c.forecastRainfall} mm</p>
                </div>
                <div>
                  <p className="text-text-muted">Actual</p>
                  <p className="text-text-primary font-semibold">{c.actualRainfall} mm</p>
                </div>
                <div>
                  <p className="text-text-muted">Abs. Error</p>
                  <p className="text-text-primary font-semibold">{c.absoluteError} mm</p>
                </div>
                <div>
                  <p className="text-text-muted">Status</p>
                  {c.bustLabel
                    ? <span className="badge badge-critical text-[0.55rem] !px-2 !py-0.5">BUST</span>
                    : <span className="badge badge-low text-[0.55rem] !px-2 !py-0.5">OK</span>
                  }
                </div>
              </div>

              {/* Expanded detail */}
              {selectedAnalog === c.id && (
                <div className="mt-4 pt-3 border-t border-nerv-700/20 animate-fade-in">
                  <p className="text-xs text-text-muted mb-2">Risk Driver Breakdown</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Ensemble Disagreement', val: c.riskDrivers.ensembleDisagreement },
                      { label: 'Moisture', val: c.riskDrivers.moisture },
                      { label: 'Dynamics', val: c.riskDrivers.dynamics },
                      { label: 'Instability', val: c.riskDrivers.instability },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-2">
                        <span className="text-[0.65rem] text-text-muted w-28 truncate">{d.label}</span>
                        <div className="flex-1 h-1.5 bg-nerv-850 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent-500/60"
                            style={{ width: `${d.val}%` }}
                          />
                        </div>
                        <span className="text-[0.65rem] text-text-secondary w-8 text-right">{d.val}%</span>
                      </div>
                    ))}
                  </div>
                  {c.eventBust && (
                    <p className="text-[0.6rem] text-amber-400/80 mt-2">
                      Event bust: Actual rainfall exceeded ≥ 64.5 mm/day threshold
                    </p>
                  )}
                </div>
              )}

              <p className="text-[0.55rem] text-text-muted mt-3 text-right">Prototype Data</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bust Definitions */}
      <section className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-accent-400" />
          Bust Definitions
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card p-4 !bg-nerv-850/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-core text-[0.55rem]">CORE</span>
              <h4 className="text-sm font-semibold text-text-primary">Percentile Forecast Bust</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              A forecast whose absolute rainfall error exceeds the historical error percentile
              for the relevant IMD sub-division, lead day and season. Example: 90th percentile.
            </p>
            <p className="text-[0.65rem] text-text-muted mt-2">
              The percentile threshold is computed from the training period only.
            </p>
          </div>
          <div className="glass-card p-4 !bg-nerv-850/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-core text-[0.55rem]">CORE</span>
              <h4 className="text-sm font-semibold text-text-primary">Event Bust</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Failure to correctly predict an IMD-defined heavy-rainfall event.
              Prototype threshold: ≥ 64.5 mm/day.
            </p>
            <p className="text-[0.65rem] text-text-muted mt-2">
              The exact operational definition should follow the relevant IMD standard used in real implementation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
