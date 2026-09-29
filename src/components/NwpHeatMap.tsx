import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Flame,
  Maximize2,
  Minimize2,
  MapPin,
  Compass,
} from 'lucide-react';
import { REGIONS, type Region } from '../data/forecasts';
import { useTheme } from '../context/ThemeContext';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Geospatial anchor coordinates for IMD subdivisions and synoptic gateways
const REGION_COORDINATES: Record<string, { lng: number; lat: number; name: string }> = {
  'Kerala': { lng: 76.2711, lat: 10.8505, name: 'Kerala' },
  'Konkan & Goa': { lng: 73.8180, lat: 15.2993, name: 'Konkan & Goa' },
  'Coastal Karnataka': { lng: 74.8560, lat: 13.3409, name: 'Coastal Karnataka' },
  'Assam & Meghalaya': { lng: 91.7362, lat: 25.5788, name: 'Assam & Meghalaya' },
  'Gujarat Region': { lng: 71.1924, lat: 22.2587, name: 'Gujarat Region' },
  'East Rajasthan': { lng: 75.7873, lat: 26.9124, name: 'East Rajasthan' },
  'Odisha Coast': { lng: 85.8245, lat: 20.9517, name: 'Odisha Coast' },
  'Gangetic West Bengal': { lng: 88.3639, lat: 22.5726, name: 'Gangetic West Bengal' },
  'Western Himalayas': { lng: 78.0322, lat: 30.3165, name: 'Western Himalayas' },
  'Madhya Maharashtra': { lng: 74.1240, lat: 18.5204, name: 'Madhya Maharashtra' },
  'Vidarbha': { lng: 79.0882, lat: 21.1458, name: 'Vidarbha' },
  'Arabian Sea Convective Node': { lng: 69.2, lat: 14.8, name: 'Arabian Sea Convective Node' },
  'Bay of Bengal Depression Track': { lng: 88.5, lat: 17.2, name: 'Bay of Bengal Depression Track' },
  'Andaman Marine Trough': { lng: 93.2, lat: 11.5, name: 'Andaman Marine Trough' },
  'Equatorial Moisture Inflow': { lng: 76.5, lat: 4.2, name: 'Equatorial Moisture Inflow' },
};

const PRESETS = [
  { label: 'All India', center: [78.9629, 21.5937] as [number, number], zoom: 4.2 },
  { label: 'Western Ghats', center: [75.0, 13.5] as [number, number], zoom: 6.2 },
  { label: 'Bay of Bengal', center: [88.0, 16.5] as [number, number], zoom: 5.5 },
  { label: 'North-East', center: [92.5, 25.8] as [number, number], zoom: 6.0 },
  { label: 'Global Basin', center: [80.0, 15.0] as [number, number], zoom: 3.0 },
];

interface NwpHeatMapProps {
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
  const [metric, setMetric] = useState<'bustRisk' | 'ensembleSpread' | 'cape'>('bustRisk');
  const [showStations, setShowStations] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Generate deterministic heat map data points matching the selected lead day & metric
  const geojsonData = useMemo(() => {
    const features = Object.entries(REGION_COORDINATES).map(([key, coord], idx) => {
      // Deterministic calculation based on lead day and region index
      const baseSeed = (idx * 17 + leadDay * 23) % 100;
      const isSelected = selectedRegion === key;

      // Bust risk between 0.18 and 0.95
      const bustProb = Math.min(0.95, Math.max(0.18, (baseSeed / 100) * 0.7 + (leadDay * 0.04) + (isSelected ? 0.25 : 0)));
      // Ensemble spread in mm
      const spread = Math.round(15 + (bustProb * 45) + (leadDay * 3.5));
      // CAPE in J/kg
      const capeVal = Math.round(800 + (bustProb * 2800));

      const weight = metric === 'bustRisk' ? bustProb : metric === 'ensembleSpread' ? spread / 65 : capeVal / 3500;

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

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [leadDay, metric, selectedRegion]);

  // Setup layers helper using custom crimson palette
  const setupLayers = useCallback((mapInstance: mapboxgl.Map, isDark: boolean, data: any) => {
    if (!mapInstance.getSource('nwp-points')) {
      mapInstance.addSource('nwp-points', {
        type: 'geojson',
        data,
      });
    }

    if (!mapInstance.getLayer('nwp-heatmap-layer')) {
      mapInstance.addLayer({
        id: 'nwp-heatmap-layer',
        type: 'heatmap',
        source: 'nwp-points',
        maxzoom: 9,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0,
            1, 1.2
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1.2,
            9, 3.2
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(77, 18, 27, 0)',
            0.15, 'rgba(77, 18, 27, 0.45)', // #4D121B
            0.35, '#751C2A',                 // #751C2A
            0.55, '#9E2638',                 // #9E2638
            0.75, '#C73046',                 // #C73046
            0.9, '#EA3852',                  // #EA3852
            1.0, '#fff1f3'                   // White hot core
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 25,
            4, 45,
            7, 75
          ],
          'heatmap-opacity': isDark ? 0.85 : 0.78,
        },
      });
    }

    if (!mapInstance.getLayer('nwp-station-circles')) {
      mapInstance.addLayer({
        id: 'nwp-station-circles',
        type: 'circle',
        source: 'nwp-points',
        minzoom: 3.5,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3.5, 4,
            6, 9,
            9, 16
          ],
          'circle-color': [
            'case',
            ['get', 'isSelected'],
            '#ffffff',
            ['>=', ['get', 'bustProbability'], 70],
            '#EA3852',
            ['>=', ['get', 'bustProbability'], 50],
            '#fb923c',
            ['>=', ['get', 'bustProbability'], 30],
            '#facc15',
            '#4ade80'
          ],
          'circle-stroke-color': isDark ? '#1c060a' : '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.95,
        },
      });
    }

    if (!mapInstance.getLayer('nwp-station-rings')) {
      mapInstance.addLayer({
        id: 'nwp-station-rings',
        type: 'circle',
        source: 'nwp-points',
        minzoom: 4,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 8,
            7, 18
          ],
          'circle-color': 'transparent',
          'circle-stroke-color': '#EA3852',
          'circle-stroke-width': 1.5,
          'circle-stroke-opacity': 0.5,
        },
      });
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const isDark = theme === 'dark';
    const styleUri = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

    const initialMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUri,
      center: [78.9629, 21.5937],
      zoom: 4.1,
      minZoom: 2.5,
      maxZoom: 10,
      pitch: 25,
      attributionControl: false,
    });

    initialMap.on('load', () => {
      setupLayers(initialMap, isDark, geojsonData);

      // Hover interaction
      initialMap.on('mousemove', 'nwp-station-circles', (e) => {
        initialMap.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          const feature = e.features[0] as unknown as { properties?: Record<string, any> };
          const props = feature.properties;
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
          const feature = e.features[0] as unknown as { properties?: { id?: Region } };
          const regionId = feature.properties?.id;
          if (regionId && REGIONS.includes(regionId) && onSelectRegion) {
            onSelectRegion(regionId);
          }
        }
      });

      setMapLoaded(true);
    });

    map.current = initialMap;

    return () => {
      initialMap.remove();
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const isDark = theme === 'dark';
    const targetStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

    const onStyleData = () => {
      if (map.current) {
        setupLayers(map.current, isDark, geojsonData);
      }
    };

    map.current.once('style.load', onStyleData);
    map.current.setStyle(targetStyle);
  }, [theme, setupLayers, geojsonData, mapLoaded]);

  // Update GeoJSON source when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource('nwp-points') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojsonData);
    }
  }, [geojsonData, mapLoaded]);

  // Toggle station circles visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const visibility = showStations ? 'visible' : 'none';
    if (map.current.getLayer('nwp-station-circles')) {
      map.current.setLayoutProperty('nwp-station-circles', 'visibility', visibility);
    }
    if (map.current.getLayer('nwp-station-rings')) {
      map.current.setLayoutProperty('nwp-station-rings', 'visibility', visibility);
    }
  }, [showStations, mapLoaded]);

  // Pan to selected region if changed externally
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

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleReset = () => {
    map.current?.flyTo({
      center: [78.9629, 21.5937],
      zoom: 4.1,
      pitch: 25,
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
      className={`glass-card card-glow relative overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl bg-nerv-950' : className
      }`}
    >
      {/* Map Header Bar */}
      <div className="p-4 sm:p-5 border-b border-nerv-700/25 flex flex-wrap items-center justify-between gap-3 relative z-10 bg-nerv-900/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              NWP Bust-Risk Geospatial Heat Map
              <span className="badge badge-demo text-[0.6rem] py-0.5">Mapbox Engine</span>
            </h3>
            <p className="text-[0.68rem] text-text-muted">
              Spatial divergence density & atmospheric instability telemetry • Day {leadDay}
            </p>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-nerv-950/70 p-1 rounded-lg border border-nerv-700/30">
          <button
            onClick={() => setMetric('bustRisk')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              metric === 'bustRisk'
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Bust Risk
          </button>
          <button
            onClick={() => setMetric('ensembleSpread')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              metric === 'ensembleSpread'
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Ensemble Spread
          </button>
          <button
            onClick={() => setMetric('cape')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              metric === 'cape'
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            CAPE (Instability)
          </button>
        </div>

        {/* View Controls & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showStations
                ? 'border-accent-500/40 bg-accent-500/10 text-accent-400'
                : 'border-nerv-700/30 text-text-muted hover:text-text-primary'
            }`}
            title="Toggle Station Markers"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stations</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-nerv-700/30 hover:border-accent-500/40 text-text-muted hover:text-text-primary bg-nerv-950/60"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preset Region Shortcuts */}
      <div className="px-4 py-2 bg-nerv-950/90 border-b border-nerv-700/20 flex items-center gap-2 overflow-x-auto text-[0.7rem] relative z-10">
        <span className="text-text-muted font-medium shrink-0 flex items-center gap-1">
          <Compass className="w-3 h-3 text-accent-400" />
          Focus:
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

      {/* Map Container */}
      <div className="relative w-full" style={{ height: isFullscreen ? 'calc(100% - 110px)' : '380px' }}>
        <div ref={mapContainer} className="w-full h-full" />

        {/* Mapbox Floating Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-nerv-900/90 border border-nerv-700/40 text-text-secondary hover:text-text-primary hover:border-accent-500/50 shadow-lg backdrop-blur-sm"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-nerv-900/90 border border-nerv-700/40 text-text-secondary hover:text-text-primary hover:border-accent-500/50 shadow-lg backdrop-blur-sm"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-nerv-900/90 border border-nerv-700/40 text-text-secondary hover:text-text-primary hover:border-accent-500/50 shadow-lg backdrop-blur-sm"
            aria-label="Reset orientation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Heat Map Legend */}
        <div className="absolute left-4 bottom-4 z-20 glass-card p-3 !bg-nerv-950/90 border border-nerv-700/40 backdrop-blur-md rounded-xl max-w-xs shadow-xl">
          <div className="flex items-center justify-between text-[0.65rem] font-semibold text-text-secondary mb-1.5">
            <span>LOW DENSITY</span>
            <span>CRITICAL SEVERITY</span>
          </div>
          {/* Custom Crimson Gradient Ramp */}
          <div
            className="h-2 rounded-full w-48 shadow-inner"
            style={{
              background: 'linear-gradient(90deg, #4D121B, #751C2A, #9E2638, #C73046, #EA3852, #ffffff)',
            }}
          />
          <div className="flex items-center justify-between text-[0.6rem] text-text-muted mt-1 font-mono">
            <span>&lt;30%</span>
            <span>50%</span>
            <span>70%</span>
            <span>&gt;90%</span>
          </div>
        </div>

        {/* Active Node Hover Card */}
        {hoveredPoint && (
          <div className="absolute right-4 bottom-4 z-20 glass-card p-3 !bg-nerv-950/95 border border-accent-500/40 rounded-xl shadow-2xl animate-fade-in w-56">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-text-primary">{hoveredPoint.name}</span>
              <span className={`badge ${
                hoveredPoint.riskLevel === 'CRITICAL' ? 'badge-critical' :
                hoveredPoint.riskLevel === 'HIGH' ? 'badge-high' :
                hoveredPoint.riskLevel === 'MODERATE' ? 'badge-moderate' : 'badge-low'
              } text-[0.55rem] py-0 px-1.5`}>
                {hoveredPoint.riskLevel}
              </span>
            </div>
            <div className="space-y-1 text-[0.68rem] text-text-secondary">
              <div className="flex justify-between">
                <span className="text-text-muted">Bust Probability:</span>
                <span className="font-bold text-accent-400">{hoveredPoint.bustProbability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Ensemble Spread:</span>
                <span className="font-semibold">{hoveredPoint.ensembleSpread} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">CAPE:</span>
                <span className="font-semibold">{hoveredPoint.cape} J/kg</span>
              </div>
            </div>
            <p className="text-[0.55rem] text-text-muted mt-2 pt-1 border-t border-nerv-700/20 text-center">
              Click node to inspect in Dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
