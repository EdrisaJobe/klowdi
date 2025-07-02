import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

interface SatelliteLayerProps {
  map: Map | null;
  visible: boolean;
}


export function SatelliteLayer({ map, visible }: SatelliteLayerProps) {
  const layerRef = useRef<TileLayer<XYZ> | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create satellite layer if it doesn't exist
    if (!layerRef.current) {
      layerRef.current = new TileLayer({
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          crossOrigin: 'anonymous',
          maxZoom: 19,
        }),
        opacity: 1,
        zIndex: 5, // Above base map but below weather layers and marker
        className: 'satellite-layer',
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