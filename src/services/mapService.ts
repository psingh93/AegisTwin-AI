import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { RiskLevel, InfrastructureCategory } from '../types';

export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#090d14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#05070a' }, { weight: 2 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a9399' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1d5db' }]
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f293d' }, { weight: 1.5 }]
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#162032' }, { weight: 1 }]
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#0e1522' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#151d2b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0b1019' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1c283d' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f1724' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#111827' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#04060a' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

let loadPromise: Promise<typeof google> | null = null;
let currentLoadedKey = '';

export async function loadGoogleMaps(apiKey: string): Promise<typeof google> {
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return (window as any).google;
  }
  if (!loadPromise || currentLoadedKey !== apiKey) {
    currentLoadedKey = apiKey;
    setOptions({
      key: apiKey,
      v: 'weekly'
    });
    loadPromise = (async () => {
      await importLibrary('maps');
      try {
        await importLibrary('marker');
      } catch (e) {
        console.warn('Marker library load fallback:', e);
      }
      try {
        await importLibrary('geometry');
      } catch (e) {
        console.warn('Geometry library load fallback:', e);
      }
      return (window as any).google;
    })();
  }
  return loadPromise;
}

export function getRiskColor(riskLevel: RiskLevel | string, status?: string): string {
  if (status === 'OFFLINE' || status === 'FAILED' || riskLevel === 'OFFLINE' || riskLevel === 'UNKNOWN') {
    return '#64748b'; // GREY = OFFLINE / UNKNOWN
  }
  if (status === 'ACTIVE' || riskLevel === 'ACTIVE' || riskLevel === 'NEUTRAL') {
    return '#ffffff'; // WHITE = ACTIVE / NEUTRAL
  }
  switch (riskLevel) {
    case 'CRITICAL':
    case 'Critical':
    case 'HIGH':
    case 'High':
      return '#ef4444'; // RED = HIGH / CRITICAL
    case 'MODERATE':
    case 'Moderate':
    case 'WARNING':
      return '#eab308'; // YELLOW = MODERATE / WARNING
    case 'LOW':
    case 'Low':
    case 'SAFE':
    default:
      return '#10b981'; // GREEN = LOW / SAFE
  }
}

export function getCategorySymbol(type: InfrastructureCategory | string): string {
  switch (type) {
    case 'Hospital':
      return 'H';
    case 'Power':
      return '⚡';
    case 'Bridge':
      return '☲';
    case 'Road':
      return '═';
    case 'Port':
      return '⚓';
    case 'Shelter':
      return '⌂';
    case 'Water':
      return '≈';
    case 'School':
      return '🎓';
    case 'Telecom':
      return '📶';
    default:
      return '●';
  }
}

export function createMarkerSvgIcon(
  type: InfrastructureCategory | string,
  riskLevel: RiskLevel | string,
  isSelected: boolean = false
): string {
  const color = getRiskColor(riskLevel);
  const symbol = getCategorySymbol(type);
  const stroke = isSelected ? '#38bdf8' : '#ffffff';
  const strokeWidth = isSelected ? 3 : 1.5;
  const radius = isSelected ? 18 : 14;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${radius * 2}" height="${radius * 2}" viewBox="0 0 ${radius * 2} ${radius * 2}">
    <circle cx="${radius}" cy="${radius}" r="${radius - 2}" fill="#090d16" stroke="${color}" stroke-width="2.5" />
    <circle cx="${radius}" cy="${radius}" r="${radius - 6}" fill="${color}" fill-opacity="0.3" stroke="${stroke}" stroke-width="${strokeWidth}" />
    <text x="${radius}" y="${radius + 4}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif">${symbol}</text>
  </svg>`;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

export function createCycloneCenterIcon(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="24" cy="24" r="14" fill="#dc2626" fill-opacity="0.4" stroke="#f87171" stroke-width="2"/>
    <circle cx="24" cy="24" r="6" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}
