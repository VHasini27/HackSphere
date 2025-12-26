
import React, { useState, useEffect, useCallback } from 'react';
import { HYDERABAD_STATIONS, getAQIBg, getAQIColor } from './data/mockData';
import { LocationData, AIResponse } from './types';
import { getAIInsights, searchLocationAQI } from './services/geminiService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- Sub-components ---

const PollutantCard = ({ label, value, unit, colorClass }: { label: string, value: number, unit: string, colorClass: string }) => (
  <div className="glass p-4 rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105">
    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</span>
    <div className="flex items-baseline space-x-1">
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      <span className="text-gray-500 text-[10px]">{unit}</span>
    </div>
  </div>
);

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl group">
      <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 ${isFocused ? 'opacity-75' : ''}`}></div>
      <div className="relative flex items-center glass rounded-2xl p-1 overflow-hidden">
        <div className="pl-4 flex items-center space-x-2">
          <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-emerald-400 leading-none">LIVE SCAN</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search any area (e.g., Kondapur, Miyapur...)"
              className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm py-1 w-64 md:w-96"
            />
          </div>
        </div>
        <button 
          type="submit"
          className="ml-auto bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-2 rounded-xl transition-all"
        >
          Monitor
        </button>
      </div>
    </form>
  );
};

// --- Main App ---

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(HYDERABAD_STATIONS[0]);
  const [aiInsights, setAiInsights] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [stations, setStations] = useState<LocationData[]>(HYDERABAD_STATIONS);

  const fetchInsights = useCallback(async (location: LocationData) => {
    setLoading(true);
    try {
      const data = await getAIInsights(location);
      setAiInsights(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights(selectedLocation);
  }, [selectedLocation, fetchInsights]);

  const handleSearch = async (query: string) => {
    // Check local first
    const local = stations.find(s => s.name.toLowerCase().includes(query.toLowerCase()));
    if (local) {
      setSelectedLocation(local);
      return;
    }

    // AI Grounded Search
    setSearching(true);
    const result = await searchLocationAQI(query);
    setSearching(false);
    
    if (result) {
      setStations(prev => [result, ...prev.filter(s => s.id !== result.id)]);
      setSelectedLocation(result);
    } else {
      alert("Area not found or API error. Try 'Gachibowli' or 'Miyapur'.");
    }
  };

  // Mock historical data for trend
  const trendData = [
    { time: '12 AM', aqi: selectedLocation.aqi - 10 },
    { time: '4 AM', aqi: selectedLocation.aqi - 15 },
    { time: '8 AM', aqi: selectedLocation.aqi + 5 },
    { time: '12 PM', aqi: selectedLocation.aqi + 20 },
    { time: '4 PM', aqi: selectedLocation.aqi + 15 },
    { time: '8 PM', aqi: selectedLocation.aqi },
  ];

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <i className="fa-solid fa-wind text-emerald-950 text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HyderAQI <span className="text-emerald-400">Pro</span></h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Real-time Intel • Hyderabad</p>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase">System Status</span>
            <div className="flex items-center space-x-2">
              <div className="pulse-dot"></div>
              <span className="text-sm font-semibold text-emerald-400">Live Active</span>
            </div>
          </div>
          <button className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <i className="fa-solid fa-bell text-gray-400"></i>
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stats & Map */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Hero Card */}
          <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 transition-all duration-700 shadow-2xl ${getAQIBg(selectedLocation.aqi)}`}>
            {searching && (
              <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center backdrop-blur-md">
                <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-2xl font-bold text-white mb-2">Scanning Hyderabad...</h3>
                <p className="text-gray-400 text-sm animate-pulse italic">Leveraging Gemini Google Search Grounding</p>
              </div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    {selectedLocation.isAIGenerated ? 'AI Sourced' : 'IoT Sensor'}
                  </span>
                  <span className="text-white/80 text-sm font-medium">Last updated: {selectedLocation.lastUpdated}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">{selectedLocation.name}</h2>
                <p className="text-xl md:text-2xl font-medium text-white/90 mb-8">{selectedLocation.status}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl min-w-[120px]">
                    <span className="block text-[10px] font-bold text-white/60 uppercase mb-1">Temp</span>
                    <span className="text-2xl font-bold text-white">{selectedLocation.temperature}°C</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl min-w-[120px]">
                    <span className="block text-[10px] font-bold text-white/60 uppercase mb-1">Humidity</span>
                    <span className="text-2xl font-bold text-white">{selectedLocation.humidity}%</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl min-w-[120px]">
                    <span className="block text-[10px] font-bold text-white/60 uppercase mb-1">Wind</span>
                    <span className="text-2xl font-bold text-white">12 km/h</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 md:mt-0 flex flex-col items-center">
                <div className="relative">
                  <svg className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.15)" strokeWidth="12" fill="none" />
                    <circle cx="50%" cy="50%" r="45%" stroke="white" strokeWidth="12" fill="none" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * Math.min(selectedLocation.aqi, 300) / 300)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">{selectedLocation.aqi}</span>
                    <span className="text-xs md:text-sm font-bold text-white/70 uppercase tracking-widest mt-[-5px]">AQI Index</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>
          </div>

          {/* Pollutant Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <PollutantCard label="PM2.5" value={selectedLocation.pollutants.pm25} unit="µg/m³" colorClass={getAQIColor(selectedLocation.aqi)} />
            <PollutantCard label="PM10" value={selectedLocation.pollutants.pm10} unit="µg/m³" colorClass="text-blue-400" />
            <PollutantCard label="NO2" value={selectedLocation.pollutants.no2} unit="ppb" colorClass="text-purple-400" />
            <PollutantCard label="SO2" value={selectedLocation.pollutants.so2} unit="ppb" colorClass="text-orange-400" />
            <PollutantCard label="CO" value={selectedLocation.pollutants.co} unit="ppm" colorClass="text-indigo-400" />
            <PollutantCard label="O3" value={selectedLocation.pollutants.o3} unit="ppb" colorClass="text-pink-400" />
          </div>

          {/* Trend Chart */}
          <div className="glass p-6 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Hourly Trend</h3>
                <p className="text-xs text-gray-400">Visualizing AQI shifts over the last 12 hours</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold">24h</button>
                <button className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-500/20">7d</button>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAqi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Sources */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Insights Card */}
          <div className="glass p-8 rounded-[2rem] flex flex-col h-full min-h-[500px]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3 className="text-xl font-bold">Health Intel</h3>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 animate-pulse text-sm">Gemini is analyzing air patterns...</p>
              </div>
            ) : aiInsights ? (
              <div className="space-y-6 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-gray-300 text-sm leading-relaxed italic">"{aiInsights.summary}"</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {aiInsights.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl glass border-none">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        insight.severity === 'high' ? 'bg-red-500/10 text-red-400' : 
                        insight.severity === 'medium' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        <i className={`fa-solid ${insight.icon}`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                        <p className="text-xs text-gray-400 leading-normal">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Recommendations</h4>
                  {aiInsights.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-sm text-gray-300 bg-white/5 p-3 rounded-xl">
                      <i className="fa-solid fa-check text-emerald-400 shrink-0"></i>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                {/* Sources if AI generated */}
                {selectedLocation.sources && selectedLocation.sources.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Data Grounding Sources</h4>
                    <div className="flex flex-col gap-2">
                      {selectedLocation.sources.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline truncate">
                          <i className="fa-solid fa-link mr-1"></i> {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Quick Select Stations */}
          <div className="glass p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Nearby Stations</h3>
            <div className="space-y-3">
              {stations.map(station => (
                <button
                  key={station.id}
                  onClick={() => setSelectedLocation(station)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedLocation.id === station.id ? 'bg-emerald-500/20 border border-emerald-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getAQIColor(station.aqi).replace('text-', 'bg-')}`}></div>
                    <span className="text-sm font-semibold truncate max-w-[150px]">{station.name}</span>
                  </div>
                  <span className={`text-sm font-black ${getAQIColor(station.aqi)}`}>{station.aqi}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer / Credits */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-8 glass border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest z-50">
        <div>&copy; 2024 HyderAQI Dashboard • Project Hyderabad</div>
        <div className="flex space-x-4">
          <span className="text-emerald-400">Powered by Gemini 3 Flash</span>
          <span>Open Data Network</span>
        </div>
      </footer>
    </div>
  );
}
