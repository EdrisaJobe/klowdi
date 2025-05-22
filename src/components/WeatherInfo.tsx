import React from 'react';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  ArrowUp, 
  Thermometer, 
  Eye, 
  Gauge, 
  Sun,
  Globe,
  MapPin,
  CloudRain,
  SunDim,
  Sunrise,
  Sunset
} from 'lucide-react';
import type { WeatherData } from '../types/weather';
import { getTemperatureColor } from '../utils/colors';

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
  return (
    <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-4 sm:left-4 sm:right-auto z-[15] 
                  bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-100/50 
                  transition-all duration-200 hover:shadow-2xl animate-slideUp">
      <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{weather.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Cloud className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 capitalize font-medium">{weather.weather[0].description}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => {
              const globeButton = document.querySelector('[data-globe-button]');
              if (globeButton) {
                (globeButton as HTMLButtonElement).click();
              }
            }}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-md"
          >
            <Globe className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              const locationButton = document.querySelector('[data-location-button]');
              if (locationButton) {
                (locationButton as HTMLButtonElement).click();
              }
            }}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-md"
          >
            <MapPin className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span 
                className="text-4xl sm:text-5xl font-bold"
                style={{ color: getTemperatureColor(weather.main.temp, 1) }}
              >
                {Math.round(weather.main.temp)}°C
              </span>
              <span className="text-gray-500 ml-2 text-lg">
                {Math.round(celsiusToFahrenheit(weather.main.temp))}°F
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ArrowUp className="w-4 h-4" />
                <span className="font-medium">{Math.round(weather.main.temp_max)}°</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ArrowUp className="w-4 h-4 rotate-180" />
                <span className="font-medium">{Math.round(weather.main.temp_min)}°</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 font-medium">
            Feels like {Math.round(weather.main.feels_like)}°C
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <Droplets className="w-6 h-6 text-blue-500 animate-pulse" />
              <div>
                <div className="font-semibold text-gray-800">{weather.main.humidity}%</div>
                <div className="text-sm text-gray-500">Humidity</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <Gauge className="w-6 h-6 text-emerald-500" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{weather.main.pressure} hPa</div>
                <div className="text-sm text-gray-500">Surface Pressure</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <SunDim className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="font-semibold text-gray-800">
                  {weather.clouds?.all || 0}%
                </div>
                <div className="text-sm text-gray-500">Cloud Coverage</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <CloudRain className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-semibold text-gray-800">
                  {Math.round((weather.rain?.['1h'] || 0) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Precipitation</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <Wind 
                className="w-6 h-6 text-blue-500"
                style={{ 
                  transform: `rotate(${weather.wind.deg}deg)`,
                  transition: 'transform 0.3s ease-in-out'
                }}
              />
              <div>
                <div className="font-semibold text-gray-800">
                  {weather.wind.speed} m/s
                  <span className="text-gray-500 ml-1 text-sm">
                    {getWindDirection(weather.wind.deg)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">Wind</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <Eye className="w-6 h-6 text-indigo-500" />
              <div>
                <div className="font-semibold text-gray-800">
                  {(weather.visibility / 1000).toFixed(1)} km
                </div>
                <div className="text-sm text-gray-500">Visibility</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <Sunrise className="w-6 h-6 text-orange-400" />
              <div>
                <div className="font-semibold text-gray-800">
                  {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-500">Sunrise</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
              <Sunset className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-semibold text-gray-800">
                  {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-500">Sunset</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}