import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import { getCloudData } from '../utils/weather';
import { drawWeatherEffects } from '../utils/canvas';

interface WeatherLayerProps {
  map: Map;
  center: [number, number];
  visible: boolean;
}

export function WeatherLayer({ map, center, visible }: WeatherLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const weatherRef = useRef<string>('');

  useEffect(() => {
    if (!map || !visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    function resizeCanvas() {
      const size = map.getSize();
      if (!size) return;
      canvas.width = size[0];
      canvas.height = size[1];
    }

    async function updateWeather() {
      const data = await getCloudData(center[1], center[0]);
      if (!data) return;
      weatherRef.current = data.weather.main;
      animate();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWeatherEffects(ctx, canvas.width, canvas.height, weatherRef.current);
      animationRef.current = requestAnimationFrame(animate);
    }

    resizeCanvas();
    updateWeather();

    const moveEndListener = () => {
      resizeCanvas();
      updateWeather();
    };
    map.on('moveend', moveEndListener);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      map.un('moveend', moveEndListener);
    };
  }, [map, visible, center]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-25"
      style={{ 
        opacity: visible ? 0.8 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
}