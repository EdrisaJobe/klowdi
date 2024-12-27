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
  MapPin
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
    <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-4 sm:left-4 sm:right-auto z-[15] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg 
                  border border-gray-100 transition-all duration-200 hover:shadow-xl animate-slideUp">
      <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
        <h2 className="text-xl font-semibold">{weather.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <Cloud className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600 capitalize">{weather.weather[0].description}</span>
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
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
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
            className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
          >
            <MapPin className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4 sm:gap-6">
        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span 
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: getTemperatureColor(weather.main.temp, 1) }}
              >
                {Math.round(weather.main.temp)}°C
              </span>
              <span className="text-gray-500 ml-2">
                {Math.round(celsiusToFahrenheit(weather.main.temp))}°F
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ArrowUp className="w-4 h-4" />
                <span>{Math.round(weather.main.temp_max)}°</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ArrowUp className="w-4 h-4 rotate-180" />
                <span>{Math.round(weather.main.temp_min)}°</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Feels like {Math.round(weather.main.feels_like)}°C
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500 animate-pulse" />
            <div>
              <div className="font-medium">{weather.main.humidity}%</div>
              <div className="text-sm text-gray-500">Humidity</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="font-medium">{weather.main.pressure} hPa</div>
              <div className="text-sm text-gray-500">Pressure</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wind 
              className="w-5 h-5 text-blue-500"
              style={{ 
                transform: `rotate(${weather.wind.deg}deg)`,
                transition: 'transform 0.3s ease-in-out'
              }}
            />
            <div>
              <div className="font-medium">
                {weather.wind.speed} m/s
                <span className="text-gray-500 ml-1">
                  {getWindDirection(weather.wind.deg)}
                </span>
              </div>
              <div className="text-sm text-gray-500">Wind</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="font-medium">10 km</div>
              <div className="text-sm text-gray-500">Visibility</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}