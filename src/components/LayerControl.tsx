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
    <div className="fixed sm:absolute top-16 sm:top-32 sm:right-2 z-10 w-full sm:w-auto">
      <div className="flex sm:flex-col gap-1 p-2 mx-2 sm:mx-0 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100">
        <button
          onClick={onToggleSatellite}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-md
                   transition-all duration-200 border ${
                     showSatellite 
                       ? 'bg-slate-50 text-slate-600 border-slate-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Satellite className={`w-4 h-4 ${showSatellite ? 'text-slate-600' : ''}`} />
          <span className="hidden sm:inline text-sm">Satellite</span>
        </button>
        <button
          onClick={onToggleWind}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-md
                   transition-all duration-200 border ${
                     showWind 
                       ? 'bg-blue-50 text-blue-600 border-blue-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Wind className={`w-4 h-4 ${showWind ? 'animate-spin-slow' : ''}`} />
          <span className="hidden sm:inline text-sm">Wind Layer</span>
        </button>
        <button
          onClick={onToggleTemp}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-md
                   transition-all duration-200 border ${
                     showTemp 
                       ? 'bg-red-50 text-red-600 border-red-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Thermometer className={`w-4 h-4 ${showTemp ? 'text-red-600' : ''}`} />
          <span className="hidden sm:inline text-sm">Temperature</span>
        </button>
        <button
          onClick={onToggleRadar}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-md
                   transition-all duration-200 border ${
                     showRadar 
                       ? 'bg-purple-50 text-purple-600 border-purple-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Radar className={`w-4 h-4 ${showRadar ? 'text-purple-600' : ''}`} />
          <span className="hidden sm:inline text-sm">Radar</span>
        </button>
        <button
          onClick={onTogglePrecipitation}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-md
                   transition-all duration-200 border ${
                     showPrecipitation 
                       ? 'bg-blue-50 text-blue-600 border-blue-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <CloudRain className={`w-4 h-4 ${showPrecipitation ? 'text-blue-600' : ''}`} />
          <span className="hidden sm:inline text-sm">Precipitation</span>
        </button>
        <button
          onClick={onTogglePressure}
          className={`flex-1 sm:w-full flex items-center justify-center sm:justify-start gap-2 p-2 sm:px-3 sm:py-2 rounded-md
                   transition-all duration-200 border ${
                     showPressure 
                       ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                       : 'hover:bg-gray-50 text-gray-600 border-transparent'
                   }`}
        >
          <Gauge className={`w-4 h-4 ${showPressure ? 'text-emerald-600' : ''}`} />
          <span className="hidden sm:inline text-sm">Pressure</span>
        </button>
      </div>
    </div>
  );
}