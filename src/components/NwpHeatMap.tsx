import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  Flame,
  Layers,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Compass,
  MapPin,
} from 'lucide-react';
import { REGIONS, REGION_COORDINATES, type Region } from '../data/forecasts';
import { useTheme } from '../context/ThemeContext';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const PRESETS = [
  { label: 'All India', center: [78.9629, 21.5937] as [number, number], zoom: 4.2 },
  { label: 'Western Ghats', center: [75.0, 13.5] as [number, number], zoom: 6.2 },
  { label: 'Bay of Bengal', center: [88.0, 16.5] as [number, number], zoom: 5.5 },
  { label: 'North-East', center: [92.5, 25.8] as [number, number], zoom: 6.0 },
  { label: 'Northern Plains', center: [77.5, 27.5] as [number, number], zoom: 5.5 },
];

export interface NwpHeatMapProps {
  selectedRegion?: Region;
  leadDay?: number;
  onSelectRegion?: (region: Region) => void;
  className?: string;
}

export default function NwpHeatMap({
  selectedRegion,
  leadDay = 3,
  onSelectRegion,
  className = '',
}: NwpHeatMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [metric, setMetric] = useState<'bustRisk' | 'ensembleSpread' | 'cape'>('bustRisk');
  const [showStations, setShowStations] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Generate deterministic GeoJSON data for heatmap + station layers
  const geojsonData = useMemo(() => {
    const features = Object.entries(REGION_COORDINATES).map(([key, coord], idx) => {
      const baseSeed = (idx * 19 + leadDay * 29) % 100;
      const isSelected = selectedRegion === key;

      let bustProb = Math.min(0.95, Math.max(0.18, (baseSeed / 100) * 0.65 + (leadDay * 0.045) + (isSelected ? 0.22 : 0)));
      if (key === 'Kerala' || key === 'Konkan & Goa') {
        bustProb = Math.min(0.95, Math.max(0.55, bustProb + 0.15));
      } else if (key === 'Odisha') {
        bustProb = Math.min(0.95, Math.max(0.48, bustProb + 0.12));
      }

      const spread = Math.round(15 + (bustProb * 48) + (leadDay * 3.8));
      const capeVal = Math.round(900 + (bustProb * 2800));

      const weight = metric === 'bustRisk'
        ? bustProb
        : metric === 'ensembleSpread'
        ? spread / 68
        : capeVal / 3800;

      return {
        type: 'Feature' as const,
        properties: {
          id: key,
          name: coord.name,
          bustProbability: Math.round(bustProb * 100),
          ensembleSpread: spread,
          cape: capeVal,
          weight: Math.min(1, Math.max(0.1, weight)),
          riskLevel: bustProb >= 0.7 ? 'CRITICAL' : bustProb >= 0.5 ? 'HIGH' : bustProb >= 0.3 ? 'MODERATE' : 'LOW',
          isSelected,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [coord.lng, coord.lat],
        },
      };
    });

    return { type: 'FeatureCollection' as const, features };
  }, [leadDay, metric, selectedRegion]);

  // Setup heatmap + station layers on the Mapbox map
  const setupLayers = useCallback((mapInstance: mapboxgl.Map, dark: boolean, data: any) => {
    // Add or update source
    const existingSource = mapInstance.getSource('nwp-points') as mapboxgl.GeoJSONSource | undefined;
    if (!existingSource) {
      mapInstance.addSource('nwp-points', { type: 'geojson', data });
    } else {
      existingSource.setData(data);
    }

    // Heatmap layer — multi-stop risk gradient
    if (!mapInstance.getLayer('nwp-heatmap-layer')) {
      mapInstance.addLayer({
        id: 'nwp-heatmap-layer',
        type: 'heatmap',
        source: 'nwp-points',
        maxzoom: 9,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1.2],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.2, 9, 3.2],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,    'rgba(34, 197, 94, 0)',       // transparent green
            0.15, 'rgba(34, 197, 94, 0.45)',    // low — emerald
            0.30, 'rgba(234, 179, 8, 0.55)',    // moderate — amber
            0.50, 'rgba(249, 115, 22, 0.70)',   // high — orange
            0.70, 'rgba(234, 56, 82, 0.82)',    // critical — crimson
            0.90, 'rgba(199, 48, 70, 0.92)',    // severe — burgundy
            1.0,  'rgba(255, 241, 243, 0.98)',  // white-hot core
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 30, 4, 55, 7, 85],
          'heatmap-opacity': dark ? 0.88 : 0.80,
        },
      });
    }

    // Station circle markers
    if (!mapInstance.getLayer('nwp-station-circles')) {
      mapInstance.addLayer({
        id: 'nwp-station-circles',
        type: 'circle',
        source: 'nwp-points',
        minzoom: 3.5,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3.5, 4, 6, 9, 9, 16],
          'circle-color': [
            'case',
            ['get', 'isSelected'], '#ffffff',
            ['>=', ['get', 'bustProbability'], 70], '#EA3852',
            ['>=', ['get', 'bustProbability'], 50], '#fb923c',
            ['>=', ['get', 'bustProbability'], 30], '#facc15',
            '#4ade80',
          ],
          'circle-stroke-color': dark ? '#1c060a' : '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.95,
        },
      });
    }

    // Outer glow rings
    if (!mapInstance.getLayer('nwp-station-rings')) {
      mapInstance.addLayer({
        id: 'nwp-station-rings',
        type: 'circle',
        source: 'nwp-points',
        minzoom: 4,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 8, 7, 18],
          'circle-color': 'transparent',
          'circle-stroke-color': '#EA3852',
          'circle-stroke-width': 1.5,
          'circle-stroke-opacity': 0.5,
        },
      });
    }

    // Station name labels
    if (!mapInstance.getLayer('nwp-station-labels')) {
      mapInstance.addLayer({
        id: 'nwp-station-labels',
        type: 'symbol',
        source: 'nwp-points',
        minzoom: 5,
        layout: {
          'text-field': ['concat', ['get', 'name'], ' ', ['to-string', ['get', 'bustProbability']], '%'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 11,
          'text-offset': [0, -1.5],
          'text-anchor': 'bottom',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': dark ? '#fff2f4' : '#2b060d',
          'text-halo-color': dark ? 'rgba(28, 6, 10, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          'text-halo-width': 1.5,
        },
      });
    }
  }, []);

  // Initialize Mapbox GL map
  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const styleUri = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

    const initialMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUri,
      center: [78.9629, 21.5937],
      zoom: 4.1,
      minZoom: 2.5,
      maxZoom: 10,
      pitch: 20,
      attributionControl: false,
    });

    initialMap.on('load', () => {
      setupLayers(initialMap, isDark, geojsonData);

      // Hover interaction on station circles
      initialMap.on('mousemove', 'nwp-station-circles', (e) => {
        initialMap.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          const props = (e.features[0] as any).properties;
          setHoveredPoint(props);
        }
      });

      initialMap.on('mouseleave', 'nwp-station-circles', () => {
        initialMap.getCanvas().style.cursor = '';
        setHoveredPoint(null);
      });

      // Click to select region
      initialMap.on('click', 'nwp-station-circles', (e) => {
        if (e.features && e.features[0]) {
          const regionId = (e.features[0] as any).properties?.id as Region;
          if (regionId && REGIONS.includes(regionId) && onSelectRegion) {
            onSelectRegion(regionId);
          }
        }
      });

      setMapLoaded(true);
      initialMap.resize();
      // Resize again after a tick in case layout wasn't finalized
      setTimeout(() => initialMap.resize(), 100);
    });

    map.current = initialMap;

    return () => {
      initialMap.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const geojsonRef = useRef(geojsonData);
  geojsonRef.current = geojsonData;

  const currentThemeRef = useRef(theme);

  // Update map style ONLY when theme actually changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (currentThemeRef.current === theme) return;
    currentThemeRef.current = theme;

    const dark = theme === 'dark';
    const targetStyle = dark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

    const onStyleLoad = () => {
      if (map.current) {
        setupLayers(map.current, dark, geojsonRef.current);
      }
    };

    map.current.once('style.load', onStyleLoad);
    map.current.setStyle(targetStyle);
  }, [theme, setupLayers, mapLoaded]);

  // Update GeoJSON source when data changes (e.g. Lead Day or Metric modes)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource('nwp-points') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojsonData);
    } else {
      setupLayers(map.current, theme === 'dark', geojsonData);
    }
  }, [geojsonData, mapLoaded, setupLayers, theme]);

  // Toggle station layer visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const visibility = showStations ? 'visible' : 'none';
    ['nwp-station-circles', 'nwp-station-rings', 'nwp-station-labels'].forEach((layerId) => {
      if (map.current!.getLayer(layerId)) {
        map.current!.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [showStations, mapLoaded]);

  // Fly to selected region
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedRegion) return;
    const coord = REGION_COORDINATES[selectedRegion];
    if (coord) {
      map.current.flyTo({
        center: [coord.lng, coord.lat],
        zoom: 6.5,
        essential: true,
        duration: 1500,
      });
    }
  }, [selectedRegion, mapLoaded]);

  // Resize map when fullscreen toggles
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    setTimeout(() => map.current?.resize(), 50);
  }, [isFullscreen, mapLoaded]);

  // Map control handlers
  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleReset = () => {
    map.current?.flyTo({
      center: [78.9629, 21.5937],
      zoom: 4.1,
      pitch: 20,
      essential: true,
      duration: 1200,
    });
  };

  const handleApplyPreset = (preset: typeof PRESETS[number]) => {
    map.current?.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      essential: true,
      duration: 1400,
    });
  };

  return (
    <div
      className={`glass-card card-glow relative overflow-hidden transition-all duration-300 flex flex-col select-none ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl bg-nerv-950' : className
      }`}
    >
      {/* Map Header Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-nerv-700/25 flex flex-wrap items-center justify-between gap-3 relative z-10 bg-nerv-900/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              NWP Bust-Risk Geospatial Heat Map
              <span className="badge badge-demo text-[0.6rem] py-0.5">Mapbox GL</span>
            </h3>
            <p className="text-[0.68rem] text-text-muted">
              Continuous spatial density of forecast error risk across India & oceanic gateways • Day {leadDay} (+{leadDay * 24}h)
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-nerv-950/70 p-1 rounded-lg border border-nerv-700/30">
          <button
            onClick={() => setMetric('bustRisk')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              metric === 'bustRisk'
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Bust Risk
          </button>
          <button
            onClick={() => setMetric('ensembleSpread')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              metric === 'ensembleSpread'
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Ensemble Spread
          </button>
          <button
            onClick={() => setMetric('cape')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              metric === 'cape'
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            CAPE (Instability)
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showStations
                ? 'border-accent-500/40 bg-accent-500/10 text-accent-400 font-semibold'
                : 'border-nerv-700/30 text-text-muted hover:text-text-primary'
            }`}
            title="Toggle Station Markers & Telemetry"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry Nodes</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-nerv-700/30 hover:border-accent-500/40 text-text-muted hover:text-text-primary bg-nerv-950/60 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Region Presets Bar */}
      <div className="px-4 py-1.5 bg-nerv-950/90 border-b border-nerv-700/20 flex items-center gap-2 overflow-x-auto text-[0.7rem] relative z-10">
        <span className="text-text-muted font-medium shrink-0 flex items-center gap-1">
          <Compass className="w-3 h-3 text-accent-400" />
          Focus Region:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleApplyPreset(preset)}
            className="px-2.5 py-0.5 rounded border border-nerv-700/30 hover:border-accent-500/40 text-text-secondary hover:text-text-primary bg-nerv-900/40 shrink-0 transition-all font-medium"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Mapbox Map Container */}
      <div className="relative w-full" style={{ height: isFullscreen ? 'calc(100% - 110px)' : '580px', minHeight: '480px' }}>
        <div ref={mapContainer} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

        {/* Floating Map Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-nerv-900/90 border border-nerv-700/40 text-text-secondary hover:text-text-primary hover:border-accent-500/50 shadow-lg backdrop-blur-sm transition-all"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-nerv-900/90 border border-nerv-700/40 text-text-secondary hover:text-text-primary hover:border-accent-500/50 shadow-lg backdrop-blur-sm transition-all"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-nerv-900/90 border border-nerv-700/40 text-text-secondary hover:text-text-primary hover:border-accent-500/50 shadow-lg backdrop-blur-sm transition-all"
            aria-label="Reset orientation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Risk Density Legend */}
        <div className="absolute left-4 bottom-4 z-20 glass-card p-3 !bg-nerv-900/95 border border-nerv-700/40 backdrop-blur-md rounded-xl max-w-xs shadow-xl">
          <div className="flex items-center justify-between text-[0.65rem] font-bold text-text-secondary mb-1.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              LOW BUST RISK
            </span>
            <span className="flex items-center gap-1 text-accent-400">
              <span className="w-2 h-2 rounded-full bg-accent-500 inline-block animate-pulse" />
              CRITICAL BUST SEVERITY
            </span>
          </div>
          <div
            className="h-2 rounded-full w-52 shadow-inner"
            style={{
              background: 'linear-gradient(90deg, #22c55e 0%, #eab308 30%, #f97316 55%, #EA3852 80%, #ffffff 100%)',
            }}
          />
          <div className="flex items-center justify-between text-[0.62rem] text-text-muted mt-1 font-mono font-semibold">
            <span>&lt;30%</span>
            <span>50%</span>
            <span>70%</span>
            <span>&gt;90%</span>
          </div>
        </div>

        {/* Active Node Hover Inspection HUD */}
        {hoveredPoint && (
          <div className="absolute right-4 bottom-4 z-20 glass-card p-3.5 !bg-nerv-900/95 border border-accent-500/50 rounded-xl shadow-2xl animate-fade-in w-60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-primary truncate max-w-[140px]">
                {hoveredPoint.name}
              </span>
              <span
                className={`badge ${
                  hoveredPoint.riskLevel === 'CRITICAL'
                    ? 'badge-critical'
                    : hoveredPoint.riskLevel === 'HIGH'
                    ? 'badge-high'
                    : hoveredPoint.riskLevel === 'MODERATE'
                    ? 'badge-moderate'
                    : 'badge-low'
                } text-[0.55rem] py-0 px-2`}
              >
                {hoveredPoint.riskLevel}
              </span>
            </div>

            <div className="space-y-1.5 text-[0.7rem] text-text-secondary">
              <div className="flex justify-between items-center py-0.5 border-b border-nerv-700/20">
                <span className="text-text-muted flex items-center gap-1">
                  <Flame className="w-3 h-3 text-accent-400" />
                  Bust Probability:
                </span>
                <span className="font-bold text-accent-400 text-sm">
                  {hoveredPoint.bustProbability}%
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-nerv-700/20">
                <span className="text-text-muted flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Ensemble Spread:
                </span>
                <span className="font-semibold text-text-primary">{hoveredPoint.ensembleSpread} mm</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-text-muted flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  CAPE:
                </span>
                <span className="font-semibold text-text-primary">{hoveredPoint.cape} J/kg</span>
              </div>
            </div>

            <p className="text-[0.6rem] text-accent-300 mt-2.5 pt-1.5 border-t border-nerv-700/20 text-center font-medium">
              Click node to inspect in Dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
