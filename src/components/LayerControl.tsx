import React from 'react';
import { Wind, Thermometer, Radar, Satellite, CloudRain, Gauge, Cloud } from 'lucide-react';

interface LayerControlProps {
  showWind: boolean;
  showTemp: boolean;
  showRadar: boolean;
  showSatellite: boolean;
  showPrecipitation: boolean;
  showPressure: boolean;
  showClouds: boolean;
  onToggleWind: () => void;
  onToggleTemp: () => void;
  onToggleRadar: () => void;
  onToggleSatellite: () => void;
  onTogglePrecipitation: () => void;
  onTogglePressure: () => void;
  onToggleClouds: () => void;
}

export function LayerControl({
  showWind, 
  showTemp, 
  showRadar,
  showSatellite,
  showPrecipitation,
  showPressure,
  showClouds,
  onToggleWind, 
  onToggleTemp,
  onToggleRadar,
  onToggleSatellite,
  onTogglePrecipitation,
  onTogglePressure,
  onToggleClouds,
}: LayerControlProps) {
  return (
    <div className="fixed sm:absolute top-16 sm:top-32 sm:right-2 z-10 w-full sm:w-auto">
      <div className="flex sm:flex-col gap-2 p-3 mx-2 sm:mx-0 bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-100/50">
        <button
          onClick={onToggleSatellite}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-lg
                   transition-all duration-200 border ${
                     showSatellite 
                       ? 'bg-slate-50/80 text-slate-700 border-slate-200 shadow-md' 
                       : 'hover:bg-white/90 text-gray-600 border-transparent hover:shadow-md'
                   }`}
        >
          <Satellite className={`w-4 h-4 ${showSatellite ? 'text-slate-600' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Satellite</span>
        </button>
        <button
          onClick={onToggleWind}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-lg
                   transition-all duration-200 border ${
                     showWind 
                       ? 'bg-blue-50/80 text-blue-700 border-blue-200 shadow-md' 
                       : 'hover:bg-white/90 text-gray-600 border-transparent hover:shadow-md'
                   }`}
        >
          <Wind className={`w-4 h-4 ${showWind ? 'animate-spin-slow' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Wind Layer</span>
        </button>
        <button
          onClick={onToggleTemp}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-lg
                   transition-all duration-200 border ${
                     showTemp 
                       ? 'bg-red-50/80 text-red-700 border-red-200 shadow-md' 
                       : 'hover:bg-white/90 text-gray-600 border-transparent hover:shadow-md'
                   }`}
        >
          <Thermometer className={`w-4 h-4 ${showTemp ? 'text-red-600' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Temperature</span>
        </button>
        <button
          onClick={onToggleRadar}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-lg
                   transition-all duration-200 border ${
                     showRadar 
                       ? 'bg-purple-50/80 text-purple-700 border-purple-200 shadow-md' 
                       : 'hover:bg-white/90 text-gray-600 border-transparent hover:shadow-md'
                   }`}
        >
          <Radar className={`w-4 h-4 ${showRadar ? 'text-purple-600' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Radar</span>
        </button>
        <button
          onClick={onTogglePrecipitation}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-lg
                   transition-all duration-200 border ${
                     showPrecipitation 
                       ? 'bg-blue-50/80 text-blue-700 border-blue-200 shadow-md' 
                       : 'hover:bg-white/90 text-gray-600 border-transparent hover:shadow-md'
                   }`}
        >
          <CloudRain className={`w-4 h-4 ${showPrecipitation ? 'text-blue-600' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Precipitation</span>
        </button>
        <button
          onClick={onTogglePressure}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-lg
                   transition-all duration-200 border ${
                     showPressure 
                       ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200 shadow-md' 
                       : 'hover:bg-white/90 text-gray-600 border-transparent hover:shadow-md'
                   }`}
        >
          <Gauge className={`w-4 h-4 ${showPressure ? 'text-emerald-600' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Pressure</span>
        </button>
        <button
          onClick={onToggleClouds}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-lg
                   transition-all duration-200 border ${
                     showClouds 
                       ? 'bg-sky-50/80 text-sky-700 border-sky-200 shadow-md' 
                       : 'hover:bg-white/90 text-gray-600 border-transparent hover:shadow-md'
                   }`}
        >
          <Cloud className={`w-4 h-4 ${showClouds ? 'text-sky-600' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Clouds</span>
        </button>
      </div>
    </div>
  );
}