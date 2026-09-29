# NERV-TRUST — NWP Reliability & Error Intelligence

> **"NWP predicts the weather. NERV-TRUST tells the forecaster whether to trust it, why, and which past cases failed the same way."**

## What is NERV-TRUST?

NERV-TRUST is a **forecaster-facing reliability layer** that sits on top of existing Numerical Weather Prediction (NWP) systems. It is **not** a new weather forecasting model. Instead, it provides:

1. **Calibrated bust-risk detection** — Know *when* forecast reliability begins to degrade
2. **Historical analog-based error memory** — Find past cases where similar forecasts failed
3. **Evidence-grounded physical explanation** — Understand model-attributed risk using computed diagnostics

## The Problem

NWP models produce deterministic or ensemble forecasts, but forecasters lack systematic tools to assess *forecast reliability* at the decision point. Key questions go unanswered:

- Is this forecast likely to bust?
- At what lead time does forecast skill degrade for this region and season?
- Have we seen similar forecast scenarios before, and what happened?
- What atmospheric features are driving elevated bust risk?

NERV-TRUST addresses these questions through a unified reliability workflow.

## How It Differs from an NWP Model

| NWP Model | NERV-TRUST |
|-----------|------------|
| Predicts weather variables (rainfall, temperature, wind) | Predicts whether the *forecast itself* is reliable |
| Outputs forecast fields | Outputs bust probability, Trust Horizon, and risk drivers |
| Runs on atmospheric initial conditions | Runs on NWP forecast outputs and derived diagnostics |
| Improves by better physics/resolution | Improves by learning from forecast verification history |

## Architecture

```
GEFS Ensemble + Forecast Diagnostics
        ↓
Feature & Diagnostic Engine
        ↓
Stage 1: Calibrated XGBoost Bust-Risk Engine
        ↓
    ┌───┴───┐
    ↓       ↓
Bust       Trust
Probability Horizon
    ↓
Historical Error Memory (Analog Retrieval)
    ↓
Replay Lab
    ↓
Two-Layer Explainability (SHAP + Physics-Aware Interpretation)
    ↓
Forecaster Decision Support
```

## Core Features

### 1. Calibrated Bust-Risk Dashboard
- Bust probability per IMD sub-division and lead day (Day 1–10)
- Trust Horizon: first lead day where mean bust probability crosses a configurable threshold
- Risk level classification (Low / Moderate / High / Very High)

### 2. Historical Error Memory
- Retrieves the 5 most similar historical forecast cases
- Displays forecast vs actual rainfall, similarity score, bust classification
- Supports filtering by region, season, lead day, and bust-only

### 3. Evidence-Grounded Explainability
- SHAP-style feature contributions grouped into physical categories:
  - **Moisture** (precipitable water, relative humidity)
  - **Instability** (CAPE, CIN)
  - **Dynamics** (wind shear, vorticity)
  - **Ensemble Disagreement** (ensemble spread)
- Every explanation references computed diagnostic values
- **Attribution ≠ causation** — the system never claims causal relationships

### 4. Replay Lab
- Complete reconstruction of historical forecast cases
- Shows what was predicted vs what actually happened
- Displays risk driver evolution and diagnostics
- Includes Kerala 2018 as a prototype case

## Bust Definitions

### Percentile Forecast Bust
A forecast whose absolute rainfall error exceeds the historical error percentile (e.g., 90th) for the relevant IMD sub-division, lead day, and season. **The percentile threshold is computed from the training period only.**

### Event Bust
Failure to correctly predict an IMD-defined heavy-rainfall event. Prototype threshold: ≥ 64.5 mm/day.

## Leakage Protection

NERV-TRUST enforces strict temporal separation:

**At forecast time (e.g., 00Z):**
```
GEFS Ensemble + Forecast-derived diagnostics → NERV-TRUST → Bust probability
```

**After the event:**
```
ERA5/IMD/IMERG observations → Actual rainfall → Error → Bust label → Error Memory
```

**Future observations are never used as model inputs at forecast time.**

## Explainability Design

```
Forecast + Diagnostics → SHAP Attribution → Computed Evidence → Physics-Aware Interpretation
```

Key principles:
- The interpreter does **not** generate new meteorological facts
- It verbalizes only computed diagnostics and retrieved evidence
- Every sentence is shown next to the evidence it comes from
- Wording rule: **attribution ≠ causation**

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Data:** Local demo JSON/CSV (no database required)
- **Deployment:** Vercel / Netlify compatible

## Project Structure

```
nerv-trust-app/
├── public/
│   └── data/
│       ├── forecasts.csv           # Sample forecast data
│       └── historical_cases.csv    # Historical analog cases
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Root layout with sidebar
│   │   └── Sidebar.tsx             # Navigation sidebar
│   ├── data/
│   │   └── forecasts.ts            # Demo data + inference layer
│   ├── pages/
│   │   ├── Dashboard.tsx           # Main bust-risk dashboard
│   │   ├── ErrorMemory.tsx         # Historical analog cases
│   │   ├── ReplayLab.tsx           # Historical case reconstruction
│   │   ├── Validation.tsx          # Model verification metrics
│   │   └── About.tsx               # About + scientific guardrails
│   ├── App.tsx                     # Router setup
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Design system + Tailwind
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## How to Run Locally

```bash
# Clone the repository
git clone <repository-url>
cd nerv-trust-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

No external database, API key, or paid service is required.

## How to Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the dist/ directory
```

### GitHub Pages
```bash
npm run build
# Deploy the dist/ directory to GitHub Pages
```

## Prototype vs Experimental Components

### Demonstrated (Core)
- Stage 1 bust-risk engine
- Spread-only baseline
- Calibration framework
- Bust map and Trust Horizon
- Historical analog retrieval
- Replay Lab
- SHAP-style risk groups
- Evidence-grounded interpretation

### Experimental / Planned
- Stage 2 correction network
- EMOS / quantile regression
- Corrected forecast uncertainty band
- Error Autopsy
- Sector panel
- Reliability Passport

## Scientific Limitations

1. This prototype uses **demonstration data**, not verified IMD/GEFS measurements
2. All metrics shown as "Pending temporal validation" require evaluation on real datasets
3. No performance superiority is claimed without measured results
4. Stage 2 is experimental and only retained if it beats the calibrated baseline
5. Calibration requires a held-out temporal calibration set with sufficient events
6. Bootstrap confidence intervals are required for reliable metric estimates

## Scientific Guardrails

1. Never claim 100% attribution
2. Never claim causation from SHAP
3. Never use future observations as forecast-time features
4. Never fabricate scientific validation numbers
5. Never call demo data real IMD data
6. Clearly distinguish prototype from planned research
7. Show event counts alongside metrics
8. Use temporal holdout validation with real data
9. Calibration on held-out temporal calibration set
10. Display limitations when insufficient events for calibration
11. Support both percentile bust and event-bust labels
12. Stage 2 is experimental — never present as validated core

## Novelty Statement

NERV-TRUST combines calibrated forecast-bust detection, historical analog-based error memory and evidence-grounded physical explanation into a forecaster-facing reliability workflow. The novelty is the integration and workflow, not any single ML technique.

## Future Work

- Integration with real GEFS reforecast data and IMD gridded rainfall observations
- Temporal holdout validation and calibration
- Stage 2 shared-trunk correction network (experimental)
- EMOS / quantile regression post-processing
- Error Autopsy for displacement/timing analysis
- Reliability Passport for forecaster briefings
- Multi-model support (NCUM, NEPS)
- Real-time ingestion pipeline

## License

This project is developed for the Smart India Hackathon (SIH) 2026.

---

*This prototype demonstrates the NERV-TRUST workflow using demonstration data. Scientific performance claims require evaluation on verified NWP and observational datasets using temporal holdout validation.*
