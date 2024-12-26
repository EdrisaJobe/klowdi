import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';

export function createLocationMarker(coordinates: [number, number]): Feature<Point> {
  const marker = new Feature({
    geometry: new Point(fromLonLat(coordinates)),
  });

  marker.setStyle(
    new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#3b82f6" fill-opacity="0.2"/>
            <circle cx="20" cy="20" r="12" fill="#3b82f6" fill-opacity="0.4"/>
            <circle cx="20" cy="20" r="6" fill="#3b82f6"/>
          </svg>
        `),
        scale: 1,
        opacity: 0.9
      })
    })
  );

  return marker;
}