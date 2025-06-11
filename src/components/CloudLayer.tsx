import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

interface CloudLayerProps {
  map: Map | null;
  visible: boolean;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export function CloudLayer({ map, visible }: CloudLayerProps) {
  const layerRef = useRef<TileLayer<XYZ> | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) {
      layerRef.current = new TileLayer({
        source: new XYZ({
          url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
          crossOrigin: 'anonymous',
        }),
        opacity: 0.6,
        zIndex: 17,
        className: 'cloud-layer',
      });
    }

    if (visible) {
      map.addLayer(layerRef.current);
    } else if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, visible]);

  return null;
}