
import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIInsights = async (location: LocationData): Promise<AIResponse> => {
  const prompt = `Analyze the air quality for ${location.name}. 
  Current AQI: ${location.aqi} (${location.status}). 
  Pollutants: PM2.5: ${location.pollutants.pm25}, PM10: ${location.pollutants.pm10}, NO2: ${location.pollutants.no2}, SO2: ${location.pollutants.so2}, CO: ${location.pollutants.co}, O3: ${location.pollutants.o3}.
  Temperature: ${location.temperature}°C, Humidity: ${location.humidity}%.
  
  Provide a health analysis and localized recommendations for residents of Hyderabad.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                icon: { type: Type.STRING },
                severity: { type: Type.STRING }
              },
              required: ["title", "description", "icon", "severity"]
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "insights", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const searchLocationAQI = async (query: string): Promise<LocationData | null> => {
  const prompt = `Find the latest real-time Air Quality Index (AQI), PM2.5, PM10, temperature, and coordinates for the specific area: "${query}" in Hyderabad, India. Return only the data for this neighborhood.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            aqi: { type: Type.NUMBER },
            status: { type: Type.STRING },
            pm25: { type: Type.NUMBER },
            pm10: { type: Type.NUMBER },
            no2: { type: Type.NUMBER },
            so2: { type: Type.NUMBER },
            co: { type: Type.NUMBER },
            o3: { type: Type.NUMBER },
            temp: { type: Type.NUMBER },
            humidity: { type: Type.NUMBER },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER }
          },
          required: ["name", "aqi", "status", "pm25", "pm10", "lat", "lng"]
        }
      }
    });

    const data = JSON.parse(response.text);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web?.uri).filter(Boolean) as string[];

    return {
      id: `searched-${Date.now()}`,
      name: data.name || query,
      aqi: data.aqi,
      status: data.status as any,
      pollutants: {
        pm25: data.pm25,
        pm10: data.pm10,
        no2: data.no2 || 15,
        so2: data.so2 || 5,
        co: data.co || 0.8,
        o3: data.o3 || 40
      },
      temperature: data.temp || 30,
      humidity: data.humidity || 50,
      lastUpdated: new Date().toLocaleTimeString(),
      coordinates: { lat: data.lat, lng: data.lng },
      isAIGenerated: true,
      sources: sources || []
    };
  } catch (error) {
    console.error("Failed to fetch search data", error);
    return null;
  }
};
