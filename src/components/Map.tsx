import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultInteractions } from 'ol/interaction';
import { Attribution } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Overlay } from 'ol';
import 'ol/ol.css';
import { getUserLocation } from '../utils/location';
import { Globe, MapPin, Loader2, Plus, Minus } from 'lucide-react';
import { createLocationMarker } from '../utils/map';
import { LayerControl } from './ui/LayerControl';
import { WindLayer } from './layers/WindLayer';
import { TemperatureLayer } from './layers/TemperatureLayer';
import { PrecipitationLayer } from './layers/PrecipitationLayer';
import { PressureLayer } from './layers/PressureLayer';
import { SatelliteLayer } from './layers/SatelliteLayer';
import { RadarLayer } from './layers/RadarLayer';
import { TopologyView } from './views/TopologyView';
import { GlobeView } from './views/GlobeView';
import { CloudLayer } from './layers/CloudLayer';
import { MapBrowserEvent } from 'ol';
import type { WeatherData } from '../types/weather';

interface MapComponentProps {
  center?: [number, number];
  ready?: boolean;
  weatherData?: WeatherData;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export function MapComponent({ center = [0, 0], ready = false, weatherData, onLocationSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const [showWind, setShowWind] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showSatellite, setShowSatellite] = useState(false);
  const [showPrecipitation, setShowPrecipitation] = useState(false);
  const [showPressure, setShowPressure] = useState(false);
  const [showGlobe, setShowGlobe] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [isLoadingLayers, setIsLoadingLayers] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
      zIndex: 100,
    });

    markerLayerRef.current = markerLayer;
    
    overlayRef.current = new Overlay({
      element: popupRef.current!,
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false,
    });

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          zIndex: 0,
          source: new OSM({
            maxZoom: 19,
            crossOrigin: 'anonymous',
            url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }),
          preload: 4,
          useInterimTilesOnError: true,
        }),
        markerLayer,
      ],
      overlays: [overlayRef.current],
      controls: [new Attribution({ collapsible: false })],
      view: new View({
        center: fromLonLat(center),
        zoom: 4,
        enableRotation: false,
        maxZoom: 19,
        minZoom: 2,
      }),
      pixelRatio: window.devicePixelRatio > 1 ? 2 : 1,
      interactions: defaultInteractions({
        mouseWheelZoom: true,
        doubleClickZoom: true,
        dragPan: true,
        pinchRotate: false
      })
    });

    const handlePointerMove = (evt: MapBrowserEvent<UIEvent>) => {
      const pixel = mapInstanceRef.current!.getEventPixel(evt.originalEvent);
      const hit = mapInstanceRef.current!.hasFeatureAtPixel(pixel);
      mapRef.current!.style.cursor = hit ? 'pointer' : '';
    };
    mapInstanceRef.current.on('pointermove', handlePointerMove);

    const handleClick = (evt: MapBrowserEvent<UIEvent>) => {
      const feature = mapInstanceRef.current!.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      
      if (feature) {
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        if (popupRef.current) {
          popupRef.current.style.display = 'block';
          overlayRef.current!.setPosition(coordinates);
        }
      } else if (popupRef.current) {
        popupRef.current.style.display = 'none';
      }
    };
    mapInstanceRef.current.on('click', handleClick);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.un('pointermove', handlePointerMove);
        mapInstanceRef.current.un('click', handleClick);
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
      if (markerLayerRef.current) {
        markerLayerRef.current.getSource()?.clear();
        markerLayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      const source = markerLayerRef.current?.getSource();
      if (source) {
        source.clear();
        const marker = createLocationMarker(center);
        source.addFeature(marker);
      }

      mapInstanceRef.current.getView().animate({
        center: fromLonLat(center),
        zoom: 12,
        duration: 400,
        easing: (t) => t * (2 - t)
      });
    }
  }, [center]);

  const handleToggleLayer = (setter: React.Dispatch<React.SetStateAction<boolean>>, current: boolean) => {
    setIsLoadingLayers(true);
    setter(!current);
    setTimeout(() => setIsLoadingLayers(false), 1000);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: currentZoom + 1,
          duration: 250
        });
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: currentZoom - 1,
          duration: 250
        });
      }
    }
  };

  return (
    <>
      <div 
        ref={mapRef} 
        className={`w-full h-full transition-opacity duration-1000 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      {isLoadingLayers && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                    bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl
                    border border-gray-100/50 flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-sm font-medium text-gray-700">Loading map layers...</span>
        </div>
      )}
      <SatelliteLayer map={mapInstanceRef.current} visible={showSatellite} />
      <WindLayer 
        map={mapInstanceRef.current} 
        center={center} 
        visible={showWind}
        windData={weatherData?.wind}
      />
      <TemperatureLayer map={mapInstanceRef.current} center={center} visible={showTemp} />
      <RadarLayer map={mapInstanceRef.current} visible={showRadar} />
      <PrecipitationLayer map={mapInstanceRef.current} visible={showPrecipitation} />
      <PressureLayer map={mapInstanceRef.current} visible={showPressure} />
      <CloudLayer map={mapInstanceRef.current} visible={showClouds} />
      <LayerControl 
        showWind={showWind} 
        showTemp={showTemp} 
        showRadar={showRadar}
        showSatellite={showSatellite}
        showPrecipitation={showPrecipitation}
        showPressure={showPressure}
        showClouds={showClouds}
        onToggleWind={() => handleToggleLayer(setShowWind, showWind)}
        onToggleTemp={() => handleToggleLayer(setShowTemp, showTemp)}
        onToggleRadar={() => handleToggleLayer(setShowRadar, showRadar)}
        onToggleSatellite={() => handleToggleLayer(setShowSatellite, showSatellite)}
        onTogglePrecipitation={() => handleToggleLayer(setShowPrecipitation, showPrecipitation)}
        onTogglePressure={() => handleToggleLayer(setShowPressure, showPressure)}
        onToggleClouds={() => handleToggleLayer(setShowClouds, showClouds)}
      />
      <div 
        ref={popupRef} 
        className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl text-sm hidden
                border border-blue-100/50 transform transition-all duration-200 hover:scale-105
                font-medium text-gray-700"
      >
        Lat: {center[1].toFixed(6)}, Lon: {center[0].toFixed(6)}
      </div>
      <div className="fixed left-4 top-4 z-20 flex gap-2">
        <button
          data-globe-button
          onClick={() => setShowGlobe(!showGlobe)}
          className={`group relative bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg 
                   border border-gray-100/50 transition-all duration-300 flex items-center gap-2
                   hover:bg-white hover:shadow-2xl hover:scale-105 hover:border-blue-200/50
                   ${showGlobe ? 'bg-blue-50/90 border-blue-200' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 
                        group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 
                        rounded-xl transition-all duration-300" />
          <Globe className={`w-5 h-5 transition-colors duration-300 
                          ${showGlobe ? 'text-blue-500' : 'text-gray-600 group-hover:text-blue-500'}`} />
          <span className={`text-sm font-medium transition-colors duration-300
                         ${showGlobe ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`}>
            3D View
          </span>
        </button>
        <button
          data-location-button
          onClick={() => {
            setIsLocating(true);
            if (onLocationSelect) {
              getUserLocation()
                .then(loc => {
                  onLocationSelect(loc.latitude, loc.longitude);
                  setTimeout(() => setIsLocating(false), 1000);
                })
                .catch(error => {
                  console.error('Failed to get location:', error);
                  setIsLocating(false);
                });
            }
          }}
          className={`group relative bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg 
                   border border-gray-100/50 transition-all duration-300
                   hover:bg-white hover:shadow-2xl hover:scale-105 hover:border-blue-200/50
                   ${isLocating ? 'location-button-active bg-blue-50/90 border-blue-200' : ''}`}
          title="My Location"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 
                        group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 
                        rounded-xl transition-all duration-300" />
          <MapPin className={`w-5 h-5 transition-colors duration-300
                           ${isLocating ? 'text-blue-500' : 'text-gray-600 group-hover:text-blue-500'}`} />
        </button>
      </div>
      <TopologyView 
        center={center} 
        width={384}
        height={240}
      />
      <GlobeView 
        center={center}
        show={showGlobe}
      />
      
      {/* Custom Zoom Controls */}
      <div className="fixed bottom-32 right-4 sm:top-4 sm:bottom-auto sm:right-4 z-[200] flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white/95 backdrop-blur-md hover:bg-white text-gray-700 hover:text-gray-900
                   w-9 h-9 sm:w-10 sm:h-10 rounded-lg shadow-lg hover:shadow-xl
                   border border-gray-200 hover:border-gray-300
                   flex items-center justify-center
                   transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white/95 backdrop-blur-md hover:bg-white text-gray-700 hover:text-gray-900
                   w-9 h-9 sm:w-10 sm:h-10 rounded-lg shadow-lg hover:shadow-xl
                   border border-gray-200 hover:border-gray-300
                   flex items-center justify-center
                   transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
      
      {/* Copyright Footer */}
      <footer className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center text-xs sm:text-sm font-semibold text-gray-800 z-10 
                       bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-lg shadow-sm">
       © {new Date().getFullYear()} Klowdi. All rights reserved. Made by Edrisa Jobe.
      </footer>
    </>
  );
}