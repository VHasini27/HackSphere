
import { LocationData } from '../types';

export const HYDERABAD_STATIONS: LocationData[] = [
  {
    id: 'gachibowli',
    name: 'Gachibowli (IT Corridor)',
    aqi: 82,
    status: 'Moderate',
    pollutants: { pm25: 28, pm10: 55, no2: 18, so2: 5, co: 0.8, o3: 42 },
    temperature: 31,
    humidity: 45,
    lastUpdated: new Date().toLocaleTimeString(),
    coordinates: { lat: 17.4401, lng: 78.3489 }
  },
  {
    id: 'charminar',
    name: 'Charminar (Old City)',
    aqi: 145,
    status: 'Unhealthy for Sensitive Groups',
    pollutants: { pm25: 58, pm10: 110, no2: 32, so2: 12, co: 1.5, o3: 35 },
    temperature: 33,
    humidity: 40,
    lastUpdated: new Date().toLocaleTimeString(),
    coordinates: { lat: 17.3616, lng: 78.4747 }
  },
  {
    id: 'jubilee-hills',
    name: 'Jubilee Hills',
    aqi: 65,
    status: 'Moderate',
    pollutants: { pm25: 19, pm10: 42, no2: 12, so2: 4, co: 0.6, o3: 48 },
    temperature: 29,
    humidity: 50,
    lastUpdated: new Date().toLocaleTimeString(),
    coordinates: { lat: 17.4284, lng: 78.4120 }
  },
  {
    id: 'punjagutta',
    name: 'Punjagutta Traffic Hub',
    aqi: 188,
    status: 'Unhealthy',
    pollutants: { pm25: 125, pm10: 210, no2: 45, so2: 15, co: 2.2, o3: 28 },
    temperature: 34,
    humidity: 38,
    lastUpdated: new Date().toLocaleTimeString(),
    coordinates: { lat: 17.4265, lng: 78.4523 }
  }
];

export const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return 'text-green-400';
  if (aqi <= 100) return 'text-yellow-400';
  if (aqi <= 150) return 'text-orange-400';
  if (aqi <= 200) return 'text-red-400';
  if (aqi <= 300) return 'text-purple-400';
  return 'text-red-900';
};

export const getAQIBg = (aqi: number) => {
  if (aqi <= 50) return 'aqi-gradient-good';
  if (aqi <= 100) return 'aqi-gradient-moderate';
  if (aqi <= 150) return 'aqi-gradient-unhealthy-sensitive';
  if (aqi <= 200) return 'aqi-gradient-unhealthy';
  if (aqi <= 300) return 'aqi-gradient-very-unhealthy';
  return 'aqi-gradient-hazardous';
};
