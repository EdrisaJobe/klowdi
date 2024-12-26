import React from 'react';
import { Wind, Thermometer, Radar, Satellite, CloudRain, Gauge } from 'lucide-react';

interface LayerControlProps {
  showWind: boolean;
  showTemp: boolean;
  showRadar: boolean;
  showSatellite: boolean;
  showPrecipitation: boolean;
  showPressure: boolean;
  onToggleWind: () => void;
  onToggleTemp: () => void;
  onToggleRadar: () => void;
  onToggleSatellite: () => void;
  onTogglePrecipitation: () => void;
  onTogglePressure: () => void;
}

export function LayerControl({
  showWind, 
  showTemp, 
  showRadar,
  showSatellite,
  showPrecipitation,
  showPressure,
  onToggleWind, 
  onToggleTemp,
  onToggleRadar,
  onToggleSatellite,
  onTogglePrecipitation,
  onTogglePressure,
}: LayerControlProps) {
  return (
    <div className="absolute right-2 top-32 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100">
      <div className="p-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700 block text-center">Weather Layers</span>
      </div>
      <div className="p-2 space-y-2">
        <button
          onClick={onToggleSatellite}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
                   transition-all duration-200 border ${
                     showSatellite 
                       ? 'bg-slate-50 text-slate-600 border-slate-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Satellite className={`w-4 h-4 ${showSatellite ? 'text-slate-600' : ''}`} />
          <span className="text-sm">Satellite</span>
        </button>
        <button
          onClick={onToggleWind}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
                   transition-all duration-200 border ${
                     showWind 
                       ? 'bg-blue-50 text-blue-600 border-blue-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Wind className={`w-4 h-4 ${showWind ? 'animate-spin-slow' : ''}`} />
          <span className="text-sm">Wind Layer</span>
        </button>
        <button
          onClick={onToggleTemp}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
                   transition-all duration-200 border ${
                     showTemp 
                       ? 'bg-red-50 text-red-600 border-red-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Thermometer className={`w-4 h-4 ${showTemp ? 'text-red-600' : ''}`} />
          <span className="text-sm">Temperature</span>
        </button>
        <button
          onClick={onToggleRadar}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
                   transition-all duration-200 border ${
                     showRadar 
                       ? 'bg-purple-50 text-purple-600 border-purple-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Radar className={`w-4 h-4 ${showRadar ? 'text-purple-600' : ''}`} />
          <span className="text-sm">Radar</span>
        </button>
        <button
          onClick={onTogglePrecipitation}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
                   transition-all duration-200 border ${
                     showPrecipitation 
                       ? 'bg-blue-50 text-blue-600 border-blue-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <CloudRain className={`w-4 h-4 ${showPrecipitation ? 'text-blue-600' : ''}`} />
          <span className="text-sm">Precipitation</span>
        </button>
        <button
          onClick={onTogglePressure}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
                   transition-all duration-200 border ${
                     showPressure 
                       ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Gauge className={`w-4 h-4 ${showPressure ? 'text-emerald-600' : ''}`} />
          <span className="text-sm">Pressure</span>
        </button>
      </div>
    </div>
  );
}