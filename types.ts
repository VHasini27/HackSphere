
export interface Pollutants {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
}

export interface LocationData {
  id: string;
  name: string;
  aqi: number;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pollutants: Pollutants;
  temperature: number;
  humidity: number;
  lastUpdated: string;
  coordinates: { lat: number; lng: number };
  isAIGenerated?: boolean;
  sources?: string[];
}

export interface HealthInsight {
  title: string;
  description: string;
  icon: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AIResponse {
  insights: HealthInsight[];
  summary: string;
  recommendations: string[];
}
