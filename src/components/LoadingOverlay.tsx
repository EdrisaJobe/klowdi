import React from 'react';
import { MapPin, Cloud, Sun, Wind } from 'lucide-react';

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fadeIn">
        <div className="relative">
          <MapPin className="w-16 h-16 text-blue-500 animate-bounce" />
          <div className="absolute -top-8 -left-8">
            <Cloud className="w-8 h-8 text-gray-400 animate-float" />
          </div>
          <div className="absolute -top-4 -right-8">
            <Sun className="w-10 h-10 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-8 right-0">
            <Wind className="w-8 h-8 text-blue-400 animate-spin-slow" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-2xl font-semibold text-gray-800">Finding your location...</p>
          <p className="text-gray-500">Preparing your weather experience</p>
        </div>
      </div>
    </div>
  );
}