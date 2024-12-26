import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import { getRainData } from '../utils/weather';
import { drawRaindrops } from '../utils/canvas';

interface RainLayerProps {
  map: Map | null;
  center: [number, number];
  visible: boolean;
}

export function RainLayer({ map, center, visible }: RainLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const raindropsRef = useRef<Array<{ x: number; y: number; speed: number; size: number }>>([]);
  const weatherRef = useRef<{ isRaining: boolean }>({ isRaining: false });

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

    async function initializeRaindrops() {
      const rainData = await getRainData(center[1], center[0]);
      if (!rainData) return;
      
      const { weather, rain } = rainData;
      weatherRef.current = {
        isRaining: weather.main === 'Rain',
      };

      // Initialize raindrops if raining
      if (weatherRef.current.isRaining) {
        const dropCount = 100; // Increased number of raindrops for better effect
        
        raindropsRef.current = Array.from({ length: dropCount }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 15 + Math.random() * 10, // Faster drops
          size: 1 + Math.random() * 2 // Varied sizes
        }));
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and animate raindrops if it's raining
      if (weatherRef.current.isRaining) {
        raindropsRef.current.forEach(drop => {
          drop.y += drop.speed;
          if (drop.y > canvas.height) {
            drop.y = -5;
            drop.x = Math.random() * canvas.width;
          }
          drawRaindrops(ctx, drop.x, drop.y, drop.size);
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    // Initialize
    resizeCanvas();
    initializeRaindrops();
    animate();

    // Update on map move
    const moveEndListener = () => {
      resizeCanvas();
      initializeRaindrops();
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
      className="absolute inset-0 pointer-events-none z-30"
      style={{ 
        opacity: visible && weatherRef.current.isRaining ? 0.8 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
}