import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  CycloneData,
  InfrastructureAsset,
  EvacuationRoute
} from '../../types';
import {
  loadGoogleMaps,
  DARK_MAP_STYLE,
  createMarkerSvgIcon,
  createCycloneCenterIcon,
  getRiskColor
} from '../../services/mapService';
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Key,
  ShieldAlert,
  Wind,
  Waves,
  MapPin,
  Building2,
  Navigation,
  Info,
  CheckCircle2,
  CloudRain
} from 'lucide-react';
import { playButtonClickTone } from '../../utils/audio';

export interface MapActiveLayers {
  satellite: boolean;
  cycloneTrack: boolean;
  uncertaintyCone: boolean;
  windRadius: boolean;
  stormSurge: boolean;
  rainfall: boolean;
  infrastructure: boolean;
  populationExposure: boolean;
  evacuationRoutes: boolean;
}

interface RealMapProps {
  cyclone: CycloneData;
  assets: InfrastructureAsset[];
  evacuationRoutes: EvacuationRoute[];
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset) => void;
  activeLayers: MapActiveLayers;
  onToggleLayer: (layerKey: keyof MapActiveLayers) => void;
  height?: string;
  onOpenAiAnalysisModal?: (asset: InfrastructureAsset) => void;
}

const DEFAULT_CENTER = { lat: 20.15, lng: 86.60 };
const DEFAULT_ZOOM = 8;

export const RealMap: React.FC<RealMapProps> = ({
  cyclone,
  assets,
  evacuationRoutes,
  selectedAsset,
  onSelectAsset,
  activeLayers,
  onToggleLayer,
  height = '620px',
  onOpenAiAnalysisModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  // API Key handling
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const [customKey, setCustomKey] = useState<string>('');
  const [keyInputVisible, setKeyInputVisible] = useState(false);
  const activeKey = customKey || envKey;

  const [isGoogleMapLoaded, setIsGoogleMapLoaded] = useState(false);
  const [googleMapError, setGoogleMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // Fallback interactive Mercator Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [demoZoom, setDemoZoom] = useState(1);
  const [demoPan, setDemoPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredAsset, setHoveredAsset] = useState<InfrastructureAsset | null>(null);

  // Initialize or re-initialize Google Map when key changes
  useEffect(() => {
    if (!activeKey) {
      setIsGoogleMapLoaded(false);
      setGoogleMapError('NO_KEY');
      return;
    }

    let isMounted = true;

    loadGoogleMaps(activeKey)
      .then((googleInstance) => {
        if (!isMounted || !mapContainerRef.current) return;

        const map = new googleInstance.maps.Map(mapContainerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          styles: DARK_MAP_STYLE,
          mapTypeId: activeLayers.satellite ? 'hybrid' : 'roadmap',
          disableDefaultUI: true,
          gestureHandling: 'greedy'
        });

        googleMapRef.current = map;
        setIsGoogleMapLoaded(true);
        setGoogleMapError(null);
      })
      .catch((err: unknown) => {
        console.warn('Google Maps API load error:', err);
        if (isMounted) {
          setIsGoogleMapLoaded(false);
          const msg = err instanceof Error ? err.message : 'Failed to initialize Google Maps';
          setGoogleMapError(msg);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeKey]);

  // Sync Google Map satellite mode
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(activeLayers.satellite ? 'hybrid' : 'roadmap');
    }
  }, [activeLayers.satellite]);

  // Pan to selected asset in Google Map
  useEffect(() => {
    if (googleMapRef.current && selectedAsset) {
      googleMapRef.current.panTo({ lat: selectedAsset.lat, lng: selectedAsset.lng });
      if (googleMapRef.current.getZoom()! < 10) {
        googleMapRef.current.setZoom(10);
      }
    }
  }, [selectedAsset]);

  // Render Google Map overlays (Markers, Polylines, Circles, Polygons)
  useEffect(() => {
    if (!isGoogleMapLoaded || !googleMapRef.current) return;
    const map = googleMapRef.current;

    // Clear previous Google Maps overlays
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];
    polygonsRef.current.forEach((pg) => pg.setMap(null));
    polygonsRef.current = [];

    // 1. Cyclone Center & Track Overlays
    if (activeLayers.cycloneTrack && cyclone) {
      // Cyclone Eye marker
      const eyeMarker = new google.maps.Marker({
        position: { lat: cyclone.coordinates.lat, lng: cyclone.coordinates.lng },
        map,
        title: `${cyclone.name} (${cyclone.currentWindKmh} km/h)`,
        icon: {
          url: createCycloneCenterIcon(),
          scaledSize: new google.maps.Size(44, 44),
          anchor: new google.maps.Point(22, 22)
        },
        zIndex: 999
      });
      markersRef.current.push(eyeMarker);

      // Track Polyline
      const trackCoords = cyclone.trackPoints.map((pt) => ({ lat: pt.lat, lng: pt.lng }));
      const trackLine = new google.maps.Polyline({
        path: trackCoords,
        geodesic: true,
        strokeColor: '#f43f5e',
        strokeOpacity: 0.9,
        strokeWeight: 3.5,
        map
      });
      polylinesRef.current.push(trackLine);

      // Waypoint Markers
      cyclone.trackPoints.forEach((pt) => {
        const ptMarker = new google.maps.Marker({
          position: { lat: pt.lat, lng: pt.lng },
          map,
          title: `${pt.label} (${pt.timeStep}) • ${pt.windKmh} km/h`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: pt.hoursFromLandfall === 0 ? '#ef4444' : '#fb923c',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            scale: pt.hoursFromLandfall === 0 ? 7 : 5
          }
        });
        markersRef.current.push(ptMarker);
      });
    }

    // 1b. Uncertainty Cone
    if (activeLayers.uncertaintyCone && cyclone) {
      const coneCoords = [
        { lat: 17.85, lng: 89.20 },
        { lat: 18.40, lng: 88.65 },
        { lat: 19.10, lng: 87.90 },
        { lat: 19.75, lng: 87.15 },
        { lat: 20.25, lng: 86.40 },
        { lat: 20.55, lng: 86.85 },
        { lat: 20.05, lng: 87.15 },
        { lat: 19.45, lng: 87.75 },
        { lat: 18.85, lng: 88.45 },
        { lat: 18.15, lng: 89.05 }
      ];
      const conePolygon = new google.maps.Polygon({
        paths: coneCoords,
        strokeColor: '#f59e0b',
        strokeOpacity: 0.75,
        strokeWeight: 1.5,
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        map
      });
      polygonsRef.current.push(conePolygon);
    }

    // 2. Wind Radius Circles
    if (activeLayers.windRadius && cyclone) {
      // 64kt (Gale core)
      const r64 = new google.maps.Circle({
        strokeColor: '#ef4444',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.18,
        map,
        center: { lat: cyclone.coordinates.lat, lng: cyclone.coordinates.lng },
        radius: 45000 // 45km
      });
      // 50kt (Severe wind perimeter)
      const r50 = new google.maps.Circle({
        strokeColor: '#f97316',
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        fillColor: '#f97316',
        fillOpacity: 0.12,
        map,
        center: { lat: cyclone.coordinates.lat, lng: cyclone.coordinates.lng },
        radius: 95000 // 95km
      });
      // 34kt (Gale threshold)
      const r34 = new google.maps.Circle({
        strokeColor: '#eab308',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#eab308',
        fillOpacity: 0.08,
        map,
        center: { lat: cyclone.coordinates.lat, lng: cyclone.coordinates.lng },
        radius: 175000 // 175km
      });
      circlesRef.current.push(r64, r50, r34);
    }

    // 3. Storm Surge Inundation Polygon
    if (activeLayers.stormSurge) {
      const surgeCoords = [
        { lat: 19.78, lng: 85.80 },
        { lat: 19.88, lng: 86.10 },
        { lat: 20.15, lng: 86.42 },
        { lat: 20.28, lng: 86.68 },
        { lat: 20.52, lng: 86.75 },
        { lat: 20.82, lng: 86.98 },
        { lat: 20.72, lng: 86.85 },
        { lat: 20.40, lng: 86.55 },
        { lat: 20.12, lng: 86.30 },
        { lat: 19.82, lng: 85.95 }
      ];
      const surgePolygon = new google.maps.Polygon({
        paths: surgeCoords,
        strokeColor: '#0ea5e9',
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: '#0284c7',
        fillOpacity: 0.35,
        map
      });
      polygonsRef.current.push(surgePolygon);
    }

    // 4. Rainfall Hazard Zone
    if (activeLayers.rainfall) {
      const rainCoords = [
        { lat: 19.65, lng: 85.70 },
        { lat: 20.35, lng: 85.75 },
        { lat: 20.85, lng: 86.20 },
        { lat: 20.95, lng: 86.95 },
        { lat: 20.25, lng: 87.10 },
        { lat: 19.65, lng: 86.40 }
      ];
      const rainPolygon = new google.maps.Polygon({
        paths: rainCoords,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.5,
        strokeWeight: 1.5,
        fillColor: '#2563eb',
        fillOpacity: 0.22,
        map
      });
      polygonsRef.current.push(rainPolygon);
    }

    // 4b. Population Exposure Density Polygons
    if (activeLayers.populationExposure) {
      const popZones = [
        [
          { lat: 19.75, lng: 85.75 },
          { lat: 19.92, lng: 86.15 },
          { lat: 20.05, lng: 86.05 },
          { lat: 19.85, lng: 85.70 }
        ],
        [
          { lat: 20.15, lng: 86.35 },
          { lat: 20.35, lng: 86.72 },
          { lat: 20.45, lng: 86.55 },
          { lat: 20.22, lng: 86.25 }
        ],
        [
          { lat: 20.48, lng: 86.62 },
          { lat: 20.72, lng: 86.95 },
          { lat: 20.78, lng: 86.78 },
          { lat: 20.55, lng: 86.50 }
        ]
      ];

      popZones.forEach((zone, idx) => {
        const popPoly = new google.maps.Polygon({
          paths: zone,
          strokeColor: idx === 1 ? '#ef4444' : '#f97316',
          strokeOpacity: 0.85,
          strokeWeight: 1.5,
          fillColor: idx === 1 ? '#ef4444' : '#f97316',
          fillOpacity: 0.22,
          map
        });
        polygonsRef.current.push(popPoly);
      });
    }

    // 5. Evacuation Routes Polylines
    if (activeLayers.evacuationRoutes) {
      evacuationRoutes.forEach((route) => {
        const poly = new google.maps.Polyline({
          path: route.path,
          geodesic: true,
          strokeColor: route.color,
          strokeOpacity: 0.9,
          strokeWeight: route.type === 'BLOCKED' ? 4 : 3,
          map
        });
        polylinesRef.current.push(poly);
      });
    }

    // 6. Infrastructure Markers
    if (activeLayers.infrastructure) {
      assets.forEach((asset) => {
        const isSelected = selectedAsset?.id === asset.id;
        const marker = new google.maps.Marker({
          position: { lat: asset.lat, lng: asset.lng },
          map,
          title: `${asset.name} (${asset.type} • Risk: ${asset.riskScore}/100)`,
          icon: {
            url: createMarkerSvgIcon(asset.type, asset.riskLevel, isSelected),
            scaledSize: isSelected ? new google.maps.Size(36, 36) : new google.maps.Size(28, 28),
            anchor: isSelected ? new google.maps.Point(18, 18) : new google.maps.Point(14, 14)
          },
          zIndex: isSelected ? 500 : 100
        });

        marker.addListener('click', () => {
          playButtonClickTone();
          onSelectAsset(asset);
        });

        markersRef.current.push(marker);
      });
    }
  }, [
    isGoogleMapLoaded,
    assets,
    selectedAsset,
    activeLayers,
    cyclone,
    evacuationRoutes,
    onSelectAsset
  ]);

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = () => {
    playButtonClickTone();
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  // Reset View to Default Bay of Bengal Viewport
  const handleResetView = () => {
    playButtonClickTone();
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(DEFAULT_CENTER);
      googleMapRef.current.setZoom(DEFAULT_ZOOM);
    } else {
      setDemoZoom(1);
      setDemoPan({ x: 0, y: 0 });
    }
  };

  // Handle Zoom In / Out
  const handleZoom = (delta: number) => {
    playButtonClickTone();
    if (googleMapRef.current) {
      const cur = googleMapRef.current.getZoom() || DEFAULT_ZOOM;
      googleMapRef.current.setZoom(Math.max(5, Math.min(15, cur + delta)));
    } else {
      setDemoZoom((z) => Math.max(0.6, Math.min(3, z + delta * 0.25)));
    }
  };

  // -------------------------------------------------------------
  // HIGH-FIDELITY DEMO MERCATOR CANVAS BASEMAP (Zero Fake Imagery)
  // When Google Maps API key is not present, renders an interactive
  // spatial projection of the Bay of Bengal coastline with pan/zoom.
  // -------------------------------------------------------------
  useEffect(() => {
    if (isGoogleMapLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Map bounds in Lat/Lng:
    // Lat range: 17.5 to 22.0 (~4.5 deg)
    // Lng range: 84.5 to 89.5 (~5.0 deg)
    const project = (lat: number, lng: number) => {
      const minLat = 17.5;
      const maxLat = 22.0;
      const minLng = 84.5;
      const maxLng = 89.5;

      const normX = (lng - minLng) / (maxLng - minLng);
      const normY = 1 - (lat - minLat) / (maxLat - minLat);

      const cx = width / 2;
      const cy = height / 2;

      const px = cx + (normX * width - cx + demoPan.x) * demoZoom;
      const py = cy + (normY * height - cy + demoPan.y) * demoZoom;
      return { x: px, y: py };
    };

    // Clear background (Deep Oceanic Black/Navy)
    ctx.fillStyle = activeLayers.satellite ? '#04070e' : '#05070a';
    ctx.fillRect(0, 0, width, height);

    // Coordinate Grid Lines
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    for (let lng = 85.0; lng <= 89.0; lng += 1.0) {
      const top = project(22.0, lng);
      const btm = project(17.5, lng);
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(btm.x, btm.y);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '10px monospace';
      ctx.fillText(`${lng.toFixed(1)}°E`, btm.x + 4, height - 12);
    }

    for (let lat = 18.0; lat <= 21.5; lat += 1.0) {
      const left = project(lat, 84.5);
      const right = project(lat, 89.5);
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '10px monospace';
      ctx.fillText(`${lat.toFixed(1)}°N`, 8, left.y - 4);
    }
    ctx.setLineDash([]);

    // Draw Realistic Coastline of Odisha & West Bengal
    // High-resolution real coastal geographic coordinates
    const coastline = [
      { lat: 21.95, lng: 88.95 }, // Sundarbans East
      { lat: 21.75, lng: 88.20 }, // Sagar Island
      { lat: 21.62, lng: 87.52 }, // Digha / Subarnarekha
      { lat: 21.28, lng: 87.05 }, // Balasore Chandipur
      { lat: 20.82, lng: 86.98 }, // Dhamra Port & Estuary
      { lat: 20.55, lng: 86.75 }, // Bhitarkanika / Rajnagar
      { lat: 20.30, lng: 86.68 }, // Paradip Port & Mahanadi
      { lat: 20.15, lng: 86.42 }, // Ersama Coast
      { lat: 19.98, lng: 86.32 }, // Devi River Mouth
      { lat: 19.88, lng: 86.11 }, // Konark Marine Beach
      { lat: 19.81, lng: 85.83 }, // Puri Beach
      { lat: 19.70, lng: 85.35 }, // Chilika Lake Estuary
      { lat: 19.45, lng: 85.05 }, // Ganjam / Rushikulya
      { lat: 19.25, lng: 84.85 }, // Gopalpur
      { lat: 18.50, lng: 84.25 }  // Andhra Border
    ];

    // Landmass polygon
    ctx.beginPath();
    const start = project(coastline[0].lat, coastline[0].lng);
    ctx.moveTo(start.x, start.y);

    for (let i = 1; i < coastline.length; i++) {
      const p = project(coastline[i].lat, coastline[i].lng);
      ctx.lineTo(p.x, p.y);
    }
    // Close to top-left for land fill
    const inlandBtm = project(18.50, 84.5);
    const inlandTop = project(22.0, 84.5);
    ctx.lineTo(inlandBtm.x, inlandBtm.y);
    ctx.lineTo(inlandTop.x, inlandTop.y);
    ctx.closePath();

    ctx.fillStyle = activeLayers.satellite ? '#0b1118' : '#0d131a';
    ctx.fill();
    ctx.strokeStyle = '#1e2d3d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Major River Estuaries (Mahanadi, Brahmani, Devi)
    const rivers = [
      // Mahanadi
      [{ lat: 20.46, lng: 85.88 }, { lat: 20.40, lng: 86.35 }, { lat: 20.30, lng: 86.68 }],
      // Devi
      [{ lat: 20.08, lng: 85.95 }, { lat: 20.02, lng: 86.18 }, { lat: 19.98, lng: 86.32 }],
      // Brahmani / Baitarani
      [{ lat: 20.88, lng: 86.52 }, { lat: 20.78, lng: 86.74 }, { lat: 20.82, lng: 86.98 }]
    ];

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.8;
    rivers.forEach((r) => {
      ctx.beginPath();
      const p0 = project(r[0].lat, r[0].lng);
      ctx.moveTo(p0.x, p0.y);
      for (let j = 1; j < r.length; j++) {
        const pj = project(r[j].lat, r[j].lng);
        ctx.lineTo(pj.x, pj.y);
      }
      ctx.stroke();
    });

    // 1. Storm Surge Layer
    if (activeLayers.stormSurge) {
      const surgePoints = [
        { lat: 19.78, lng: 85.80 },
        { lat: 19.88, lng: 86.10 },
        { lat: 20.15, lng: 86.42 },
        { lat: 20.28, lng: 86.68 },
        { lat: 20.52, lng: 86.75 },
        { lat: 20.82, lng: 86.98 },
        { lat: 20.72, lng: 86.85 },
        { lat: 20.40, lng: 86.55 },
        { lat: 20.12, lng: 86.30 },
        { lat: 19.82, lng: 85.95 }
      ];
      ctx.beginPath();
      const sp0 = project(surgePoints[0].lat, surgePoints[0].lng);
      ctx.moveTo(sp0.x, sp0.y);
      for (let k = 1; k < surgePoints.length; k++) {
        const sp = project(surgePoints[k].lat, surgePoints[k].lng);
        ctx.lineTo(sp.x, sp.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 2. Rainfall Layer
    if (activeLayers.rainfall) {
      const rainCenter = project(cyclone.coordinates.lat, cyclone.coordinates.lng);
      const rad = 130 * demoZoom;
      const grad = ctx.createRadialGradient(rainCenter.x, rainCenter.y, 10, rainCenter.x, rainCenter.y, rad);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
      grad.addColorStop(0.5, 'rgba(37, 99, 235, 0.25)');
      grad.addColorStop(1, 'rgba(30, 64, 175, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rainCenter.x, rainCenter.y, rad, 0, 2 * Math.PI);
      ctx.fill();
    }

    // 2b. Population Exposure Density Polygons
    if (activeLayers.populationExposure) {
      const popZones = [
        [
          { lat: 19.75, lng: 85.75 },
          { lat: 19.92, lng: 86.15 },
          { lat: 20.05, lng: 86.05 },
          { lat: 19.85, lng: 85.70 }
        ],
        [
          { lat: 20.15, lng: 86.35 },
          { lat: 20.35, lng: 86.72 },
          { lat: 20.45, lng: 86.55 },
          { lat: 20.22, lng: 86.25 }
        ],
        [
          { lat: 20.48, lng: 86.62 },
          { lat: 20.72, lng: 86.95 },
          { lat: 20.78, lng: 86.78 },
          { lat: 20.55, lng: 86.50 }
        ]
      ];

      popZones.forEach((zone, idx) => {
        ctx.beginPath();
        const zp0 = project(zone[0].lat, zone[0].lng);
        ctx.moveTo(zp0.x, zp0.y);
        for (let z = 1; z < zone.length; z++) {
          const zp = project(zone[z].lat, zone[z].lng);
          ctx.lineTo(zp.x, zp.y);
        }
        ctx.closePath();
        ctx.fillStyle = idx === 1 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.20)';
        ctx.fill();
        ctx.strokeStyle = idx === 1 ? '#ef4444' : '#f97316';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // 2c. Uncertainty Cone
    if (activeLayers.uncertaintyCone) {
      const conePoints = [
        { lat: 17.85, lng: 89.20 },
        { lat: 18.40, lng: 88.65 },
        { lat: 19.10, lng: 87.90 },
        { lat: 19.75, lng: 87.15 },
        { lat: 20.25, lng: 86.40 },
        { lat: 20.55, lng: 86.85 },
        { lat: 20.05, lng: 87.15 },
        { lat: 19.45, lng: 87.75 },
        { lat: 18.85, lng: 88.45 },
        { lat: 18.15, lng: 89.05 }
      ];
      ctx.beginPath();
      const cp0 = project(conePoints[0].lat, conePoints[0].lng);
      ctx.moveTo(cp0.x, cp0.y);
      for (let k = 1; k < conePoints.length; k++) {
        const cp = project(conePoints[k].lat, conePoints[k].lng);
        ctx.lineTo(cp.x, cp.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Evacuation Routes
    if (activeLayers.evacuationRoutes) {
      evacuationRoutes.forEach((route) => {
        ctx.strokeStyle = route.color;
        ctx.lineWidth = route.type === 'BLOCKED' ? 3.5 : 2.5;
        if (route.type === 'ALTERNATE') ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);

        ctx.beginPath();
        const rp0 = project(route.path[0].lat, route.path[0].lng);
        ctx.moveTo(rp0.x, rp0.y);
        for (let m = 1; m < route.path.length; m++) {
          const rpm = project(route.path[m].lat, route.path[m].lng);
          ctx.lineTo(rpm.x, rpm.y);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // 4. Cyclone Track & Eyewall
    if (activeLayers.cycloneTrack) {
      // Uncertainty cone
      ctx.beginPath();
      const tpStart = project(cyclone.trackPoints[0].lat, cyclone.trackPoints[0].lng);
      ctx.moveTo(tpStart.x, tpStart.y);
      for (let t = 1; t < cyclone.trackPoints.length; t++) {
        const pt = project(cyclone.trackPoints[t].lat, cyclone.trackPoints[t].lng);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Track points
      cyclone.trackPoints.forEach((pt) => {
        const pp = project(pt.lat, pt.lng);
        ctx.fillStyle = pt.hoursFromLandfall === 0 ? '#ef4444' : '#fb923c';
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, pt.hoursFromLandfall === 0 ? 7 : 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px monospace';
        ctx.fillText(pt.timeStep, pp.x + 8, pp.y + 3);
      });

      // Cyclone Eye
      const eye = project(cyclone.coordinates.lat, cyclone.coordinates.lng);
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 16, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
    }

    // 5. Wind Radii
    if (activeLayers.windRadius) {
      const eye = project(cyclone.coordinates.lat, cyclone.coordinates.lng);
      [
        { km: 45, color: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', label: '64kt (Core)' },
        { km: 95, color: 'rgba(249, 115, 22, 0.12)', border: '#f97316', label: '50kt (Severe)' },
        { km: 175, color: 'rgba(234, 179, 8, 0.08)', border: '#eab308', label: '34kt (Gale)' }
      ].forEach((ring) => {
        const radiusPx = (ring.km / 111) * ((height / 4.5) * demoZoom);
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, radiusPx, 0, 2 * Math.PI);
        ctx.fillStyle = ring.color;
        ctx.fill();
        ctx.strokeStyle = ring.border;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    // 6. Infrastructure Markers
    if (activeLayers.infrastructure) {
      assets.forEach((asset) => {
        const p = project(asset.lat, asset.lng);
        const isSelected = selectedAsset?.id === asset.id;
        const color = getRiskColor(asset.riskLevel);
        const r = isSelected ? 10 : 7;

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 6, 0, 2 * Math.PI);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = isSelected ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.fillText(asset.name.split(' ')[0], p.x + r + 3, p.y + 3);
      });
    }
  }, [
    isGoogleMapLoaded,
    demoZoom,
    demoPan,
    assets,
    selectedAsset,
    activeLayers,
    cyclone,
    evacuationRoutes
  ]);

  // Demo Map Drag & Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - demoPan.x, y: e.clientY - demoPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setDemoPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const minLat = 17.5;
    const maxLat = 22.0;
    const minLng = 84.5;
    const maxLng = 89.5;

    // Find closest asset within 16px threshold
    for (const asset of assets) {
      const normX = (asset.lng - minLng) / (maxLng - minLng);
      const normY = 1 - (asset.lat - minLat) / (maxLat - minLat);
      const cx = width / 2;
      const cy = height / 2;

      const px = cx + (normX * width - cx + demoPan.x) * demoZoom;
      const py = cy + (normY * height - cy + demoPan.y) * demoZoom;

      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < 18) {
        playButtonClickTone();
        onSelectAsset(asset);
        return;
      }
    }
  };

  return (
    <div
      ref={mapWrapperRef}
      className={`relative w-full rounded-xl overflow-hidden border border-[#161f30] bg-[#05070a] shadow-2xl select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Top Map Control Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Mode Badge & Basemap Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090d16]/90 backdrop-blur-md border border-[#1b263b] text-xs font-mono shadow-xl">
            <span
              className={`w-2 h-2 rounded-full ${
                isGoogleMapLoaded ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 font-bold">
              {isGoogleMapLoaded ? 'LIVE GOOGLE MAPS' : 'DEMO GEOGRAPHIC BASEMAP'}
            </span>
            <span className="text-[10px] text-slate-500">•</span>
            <span className="text-[10px] text-cyan-400">
              {activeLayers.satellite ? 'SATELLITE' : 'VECTOR'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#090d16]/90 backdrop-blur-md border border-[#1b263b] text-[11px] font-mono text-slate-400 shadow-xl">
            <span>HAZARD MODEL:</span>
            <strong className="text-amber-300">SIMULATED</strong>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* API Key Modal / Status Button */}
          <button
            onClick={() => setKeyInputVisible(!keyInputVisible)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer shadow-lg ${
              isGoogleMapLoaded
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80'
                : 'bg-amber-950/80 text-amber-300 border border-amber-500/40 hover:bg-amber-900/80'
            }`}
            title="Google Maps Platform API Key Configuration"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isGoogleMapLoaded ? 'Google Maps Connected' : 'Google Maps Key'}
            </span>
          </button>

          {/* Satellite Toggle */}
          <button
            onClick={() => {
              playButtonClickTone();
              onToggleLayer('satellite');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-lg ${
              activeLayers.satellite
                ? 'bg-cyan-600 text-white shadow-cyan-600/30'
                : 'bg-[#090d16]/90 backdrop-blur-md text-slate-300 border border-slate-700 hover:text-white'
            }`}
            title="Toggle Satellite Photogrammetry"
          >
            {activeLayers.satellite ? 'Satellite' : 'Map'}
          </button>

          {/* Reset Center */}
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-lg bg-[#090d16]/90 backdrop-blur-md border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-200 transition-colors cursor-pointer shadow-lg"
            title="Reset Viewport to Bay of Bengal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Controls */}
          <button
            onClick={() => handleZoom(1)}
            className="w-8 h-8 rounded-lg bg-[#090d16]/90 backdrop-blur-md border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-200 transition-colors cursor-pointer shadow-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="w-8 h-8 rounded-lg bg-[#090d16]/90 backdrop-blur-md border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-200 transition-colors cursor-pointer shadow-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="w-8 h-8 rounded-lg bg-[#090d16]/90 backdrop-blur-md border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-200 transition-colors cursor-pointer shadow-lg"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* API Key Modal Banner (if toggled) */}
      {keyInputVisible && (
        <div className="absolute top-14 right-3 z-30 max-w-sm w-full bg-[#080d17]/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-4 shadow-2xl space-y-3 font-mono text-xs text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-cyan-400" />
              Google Maps API Key
            </span>
            <button
              onClick={() => setKeyInputVisible(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Connect a live Google Maps Platform key to unlock Google satellite imagery, real road vector networks, and street-level cartography.
          </p>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400">ENTER GOOGLE MAPS API KEY:</label>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value.trim())}
              placeholder={envKey || 'AIzaSy...'}
              className="w-full bg-[#05080f] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-500">
              {isGoogleMapLoaded ? 'Active: Google Maps' : 'Active: Demo Basemap'}
            </span>
            <button
              onClick={() => setKeyInputVisible(false)}
              className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
            >
              Apply Key
            </button>
          </div>
        </div>
      )}

      {/* Main Map Canvas Containers */}
      {/* 1. Real Google Maps Div */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${isGoogleMapLoaded ? 'block' : 'hidden'}`}
      />

      {/* 2. Professional Demo Geographic Basemap Canvas (When API key is pending) */}
      {!isGoogleMapLoaded && (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
          />

          {/* Missing Key Gentle Floating Banner */}
          <div className="absolute top-14 left-3 bg-[#080d17]/85 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-xl">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Google Maps API Key not detected in environment • Running in <strong>Interactive Demo Geographic Basemap</strong> mode.
            </span>
          </div>
        </div>
      )}

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 z-20 bg-[#080d17]/90 backdrop-blur-md border border-[#161f30] rounded-xl p-3 text-[11px] font-mono shadow-2xl flex flex-wrap items-center gap-4 text-slate-300">
        <div className="font-bold text-white uppercase text-[10px] tracking-wider pr-2 border-r border-slate-800">
          RISK CLASSIFICATION
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>LOW (&lt;50)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
          <span>MODERATE (50–74)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span>CRITICAL (75–100)</span>
        </div>

        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-800 text-slate-400 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Eye: {cyclone.name} ({cyclone.currentWindKmh} km/h)</span>
          </span>
          <span>Surge: +{cyclone.stormSurgeExpectedM}m</span>
        </div>
      </div>
    </div>
  );
};
