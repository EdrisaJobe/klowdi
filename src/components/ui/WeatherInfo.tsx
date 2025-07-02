import { useState } from 'react';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  ArrowUp, 
  Eye, 
  Gauge, 
  Globe,
  MapPin,
  CloudRain,
  SunDim,
  Sunrise,
  Sunset,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { WeatherData } from '../../types/weather';
import { getTemperatureColor } from '../../utils/colors';

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

interface WeatherInfoProps {
  weather: WeatherData;
}

export function WeatherInfo({ weather }: WeatherInfoProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-4 sm:left-4 sm:right-auto z-[15] 
                  bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-100/50 
                  transition-all duration-300 hover:shadow-2xl animate-slideUp overflow-hidden
                  ${!isExpanded ? 'h-16' : 'h-auto'}`}>
      <div className="p-4 border-b border-gray-100/50 flex items-center justify-between h-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{weather.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Cloud className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 capitalize font-medium">{weather.weather[0].description}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-md"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronUp className="w-5 h-5 text-gray-600" />}
          </button>
          <button
            onClick={() => (document.querySelector('[data-globe-button]') as HTMLElement)?.click()}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-md"
          >
            <Globe className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => (document.querySelector('[data-location-button]') as HTMLElement)?.click()}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-md"
          >
            <MapPin className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className={`p-4 transition-all duration-300 ${!isExpanded ? 'opacity-0 h-0 p-0' : 'opacity-100 h-auto'}`}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span 
                className="text-4xl sm:text-5xl font-bold"
                style={{ color: getTemperatureColor(weather.main.temp, 1) }}
              >
                {Math.round(celsiusToFahrenheit(weather.main.temp))}°F
              </span>
              <span className="text-gray-500 ml-2 text-lg">
                {Math.round(weather.main.temp)}°C
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ArrowUp className="w-4 h-4" />
                <span className="font-medium">{Math.round(celsiusToFahrenheit(weather.main.temp_max))}°F</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ArrowUp className="w-4 h-4 rotate-180" />
                <span className="font-medium">{Math.round(celsiusToFahrenheit(weather.main.temp_min))}°F</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 font-medium">
            Feels like {Math.round(celsiusToFahrenheit(weather.main.feels_like))}°F ({Math.round(weather.main.feels_like)}°C)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <WeatherCard icon={<Droplets className="w-6 h-6 text-blue-500 animate-pulse" />} value={`${weather.main.humidity}%`} label="Humidity" />
            <WeatherCard icon={<Gauge className="w-6 h-6 text-emerald-500" />} value={`${weather.main.pressure} hPa`} label="Surface Pressure" />
            <WeatherCard icon={<SunDim className="w-6 h-6 text-yellow-500" />} value={`${weather.clouds?.all || 0}%`} label="Cloud Coverage" />
            <WeatherCard icon={<CloudRain className="w-6 h-6 text-blue-400" />} value={`${Math.round((weather.rain?.['1h'] || 0) * 100)}%`} label="Precipitation" />
          </div>
          
          <div className="space-y-3">
            <WeatherCard 
              icon={<Wind className="w-6 h-6 text-blue-500" style={{ transform: `rotate(${weather.wind.deg}deg)`, transition: 'transform 0.3s ease-in-out' }} />} 
              value={`${weather.wind.speed} m/s ${getWindDirection(weather.wind.deg)}`} 
              label="Wind" 
            />
            <WeatherCard icon={<Eye className="w-6 h-6 text-indigo-500" />} value={`${((weather.visibility || 0) / 1000).toFixed(1)} km`} label="Visibility" />
            <WeatherCard 
              icon={<Sunrise className="w-6 h-6 text-orange-400" />} 
              value={weather.sys ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} 
              label="Sunrise" 
            />
            <WeatherCard 
              icon={<Sunset className="w-6 h-6 text-purple-400" />} 
              value={weather.sys ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} 
              label="Sunset" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 hover:scale-105 hover:shadow-lg">
      {icon}
      <div>
        <div className="font-semibold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}