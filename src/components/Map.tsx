import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Overlay } from 'ol';
import 'ol/ol.css';
import { getUserLocation } from '../utils/location';
import { Globe, MapPin } from 'lucide-react';
import { createLocationMarker } from '../utils/map';
import { LayerControl } from './LayerControl';
import { WindLayer } from './WindLayer';
import { TemperatureLayer } from './TemperatureLayer';
import { PrecipitationLayer } from './PrecipitationLayer';
import { PressureLayer } from './PressureLayer';
import { SatelliteLayer } from './SatelliteLayer';
import { RadarLayer } from './RadarLayer';
import { TopologyView } from './TopologyView';
import { GlobeView } from './GlobeView';

interface MapComponentProps {
  center?: [number, number];
  ready?: boolean;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export function MapComponent({ center = [0, 0], ready = false, onLocationSelect }: MapComponentProps) {
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

  useEffect(() => {
    if (!mapRef.current) return;

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
      zIndex: 100, // Ensure marker is always on top
    });

    markerLayerRef.current = markerLayer;
    
    // Create overlay for coordinates popup
    overlayRef.current = new Overlay({
      element: popupRef.current!,
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false,
    });

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ // Base map layer
          zIndex: 0,
          source: new OSM({
            maxZoom: 19,
            crossOrigin: 'anonymous',
            imageSmoothing: false, // Disable image smoothing for better performance
            // Use multiple subdomains for parallel requests
            urls: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ]
          }),
          // Optimize tile loading
          preload: 4,
          useInterimTilesOnError: true,
          renderMode: 'image' // Use image rendering for better performance
        }),
        markerLayer,
      ],
      overlays: [overlayRef.current],
      view: new View({
        center: fromLonLat(center),
        zoom: 4,
        constrainResolution: true,
        // Optimize view settings
        constrainOnlyCenter: true,
        maxZoom: 19,
        minZoom: 2,
        // Smooth zoom settings
        zoomDuration: 200,
        zoomFactor: 1.5,
        constrainResolution: false,
        multiWorld: false
      }),
      // Performance settings
      pixelRatio: window.devicePixelRatio > 1 ? 2 : 1,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      moveTolerance: 1
    });

    // Add pointer cursor on marker hover
    const handlePointerMove = (evt) => {
      const pixel = mapInstanceRef.current!.getEventPixel(evt.originalEvent);
      const hit = mapInstanceRef.current!.hasFeatureAtPixel(pixel);
      mapRef.current!.style.cursor = hit ? 'pointer' : '';
    };
    mapInstanceRef.current.on('pointermove', handlePointerMove);

    // Add click handler for marker
    const handleClick = (evt) => {
      const feature = mapInstanceRef.current!.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      
      if (feature) {
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        const [lon, lat] = coordinates.map((coord: number) => coord.toFixed(6));
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
      // Clear existing markers
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
        easing: (t) => t * (2 - t) // Smooth easing function
      });
    }
  }, [center]);

  const handleToggleWind = () => setShowWind(!showWind);
  const handleToggleTemp = () => setShowTemp(!showTemp);

  return (
    <>
      <div 
        ref={mapRef} 
        className={`w-full h-full transition-opacity duration-1000 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      <SatelliteLayer map={mapInstanceRef.current} visible={showSatellite} />
      <WindLayer map={mapInstanceRef.current} center={center} visible={showWind} />
      <TemperatureLayer map={mapInstanceRef.current} center={center} visible={showTemp} />
      <RadarLayer map={mapInstanceRef.current} visible={showRadar} />
      <PrecipitationLayer map={mapInstanceRef.current} visible={showPrecipitation} />
      <PressureLayer map={mapInstanceRef.current} visible={showPressure} />
      <LayerControl 
        showWind={showWind} 
        showTemp={showTemp} 
        showRadar={showRadar}
        showSatellite={showSatellite}
        showPrecipitation={showPrecipitation}
        showPressure={showPressure}
        onToggleWind={handleToggleWind} 
        onToggleTemp={handleToggleTemp}
        onToggleRadar={() => setShowRadar(!showRadar)}
        onToggleSatellite={() => setShowSatellite(!showSatellite)}
        onTogglePrecipitation={() => setShowPrecipitation(!showPrecipitation)}
        onTogglePressure={() => setShowPressure(!showPressure)}
      />
      <div 
        ref={popupRef} 
        className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm hidden
                border border-blue-100 transform transition-all duration-200 hover:scale-105"
      >
        Lat: {center[1].toFixed(6)}, Lon: {center[0].toFixed(6)}
      </div>
      <div className="fixed left-4 top-4 z-20 flex gap-2">
        <button
          onClick={() => setShowGlobe(!showGlobe)}
          className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-100 
                   hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Globe className={`w-6 h-6 ${showGlobe ? 'text-blue-500' : 'text-gray-600'}`} />
          <span className="text-sm font-medium">3D View</span>
        </button>
        <button
          onClick={() => {
            if (onLocationSelect) {
              getUserLocation()
                .then(loc => onLocationSelect(loc.latitude, loc.longitude))
                .catch(error => {
                  console.error('Failed to get location:', error);
                  // TODO: Show error toast/notification to user
                });
            }
          }}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-100 
                   hover:bg-gray-50 transition-colors"
          title="My Location"
        >
          <MapPin className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      <TopologyView 
        center={center} 
        width={320}
        height={160}
      />
      <GlobeView 
        center={center}
        show={showGlobe}
        onToggle={() => setShowGlobe(!showGlobe)}
      />
    </>
  );
}