import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

interface HumidityLayerProps {
  map: Map | null;
  visible: boolean;
}

const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

export function HumidityLayer({ map, visible }: HumidityLayerProps) {
  const layerRef = useRef<TileLayer<XYZ> | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) {
      layerRef.current = new TileLayer({
        source: new XYZ({
          url: `https://tile.openweathermap.org/map/humidity_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
          crossOrigin: 'anonymous',
        }),
        opacity: 0.6,
        zIndex: 18,
        className: 'humidity-layer',
      });
    }

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