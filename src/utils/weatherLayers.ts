import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

const API_KEY = import.meta.env.VITE_OPENWEATHER_ALT_API_KEY;

export function createWindLayer() {
  return new TileLayer({
    source: new XYZ({
      url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      crossOrigin: 'anonymous',
    }),
    opacity: 0.6,
    zIndex: 2,
    className: 'wind-layer',
  });
}