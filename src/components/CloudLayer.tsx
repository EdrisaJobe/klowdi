import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import { getCloudData } from '../utils/weather';
import { drawClouds } from '../utils/canvas';

interface CloudLayerProps {
  map: Map | null;
  center: [number, number];
  visible: boolean;
}

interface CloudData {
  clouds: number;
  weather: {
    main: string;
    description: string;
  };
  grid: number[][];
}

export function CloudLayer({ map, center, visible }: CloudLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<CloudData | null>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    if (!map || !visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true })!;

    function resizeCanvas() {
      const size = map.getSize();
      if (!size) return;
      canvas.width = size[0];
      canvas.height = size[1];
    }

    async function updateCloudData() {
      const data = await getCloudData(center[1], center[0]);
      if (!data) return;

      const gridSize = 30;
      const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
      
      const baseCoverage = data.clouds;
      const isOvercast = data.weather.main === 'Clouds' && 
                        (data.weather.description.includes('overcast') || 
                         data.weather.description.includes('broken'));
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const distanceFromCenter = Math.sqrt(
            Math.pow((i - gridSize/2) / (gridSize/2), 2) + 
            Math.pow((j - gridSize/2) / (gridSize/2), 2)
          );
          
          let variation = (Math.random() - 0.5) * (isOvercast ? 10 : 20);
          let distanceEffect = -distanceFromCenter * (isOvercast ? 5 : 10);
          
          grid[i][j] = Math.max(0, Math.min(100, baseCoverage + variation + distanceEffect));
        }
      }

      dataRef.current = { 
        clouds: data.clouds, 
        weather: data.weather,
        grid 
      };
      drawCloudLayer();
    }

    function drawCloudLayer() {
      if (!dataRef.current) return;
      
      timeRef.current += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isOvercast = dataRef.current.weather.main === 'Clouds' && 
                        (dataRef.current.weather.description.includes('overcast') || 
                         dataRef.current.weather.description.includes('broken'));
      
      drawClouds(
        ctx, 
        canvas.width, 
        canvas.height, 
        dataRef.current.grid,
        isOvercast ? timeRef.current : undefined,
        dataRef.current.weather.main
      );
      
      if (isOvercast) {
        animationRef.current = requestAnimationFrame(drawCloudLayer);
      }
    }

    // Initialize
    resizeCanvas();
    updateCloudData();
    
    // Update on map move/zoom
    const moveEndListener = () => {
      resizeCanvas();
      timeRef.current = 0;
      drawCloudLayer();
    };
    map.on('moveend', moveEndListener);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
      map.un('moveend', moveEndListener);
    };
  }, [map, visible, center]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-15"
      style={{ 
        opacity: visible ? 0.7 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
}