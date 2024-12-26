import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

interface RadarLayerProps {
  map: Map | null;
  visible: boolean;
}

const RADAR_API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

export function RadarLayer({ map, visible }: RadarLayerProps) {
  const layerRef = useRef<TileLayer<XYZ> | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create radar layer if it doesn't exist
    if (!layerRef.current) {
      layerRef.current = new TileLayer({
        source: new XYZ({
          url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${RADAR_API_KEY}`,
          crossOrigin: 'anonymous',
        }),
        opacity: 0.6,
        zIndex: 25,
        className: 'radar-layer',
      });
    }

    // Add/remove layer based on visibility
    if (visible) {
      map.addLayer(layerRef.current);
    } else if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, visible]);

  return null;
}