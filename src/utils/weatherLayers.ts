import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

const API_KEY = 'aa237aa0b8bfefa9b4156b04460b1e24';

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