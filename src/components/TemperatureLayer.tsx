import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import { getTemperatureData } from '../utils/weather';
import { drawTemperatureHeatmap } from '../utils/canvas';

interface TemperatureLayerProps {
  map: Map | null;
  center: [number, number];
  visible: boolean;
}

export function TemperatureLayer({ map, center, visible }: TemperatureLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<{ temp: number; grid: number[][] } | null>(null);

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

    async function updateTemperatureData() {
      const data = await getTemperatureData(center[1], center[0]);
      if (!data) return;

      // Higher resolution grid for better visualization
      const gridSize = 30;
      const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
      
      // Create more natural temperature variations
      const baseTemp = data.temp;
      const time = new Date().getHours();
      const isDaytime = time >= 6 && time <= 18;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          // Add natural variations based on position and time
          const distanceFromCenter = Math.sqrt(
            Math.pow((i - gridSize/2) / (gridSize/2), 2) + 
            Math.pow((j - gridSize/2) / (gridSize/2), 2)
          );
          
          // Temperature varies more during day, less at night
          const variation = isDaytime 
            ? (Math.random() - 0.5) * 3 // Larger variations during day
            : (Math.random() - 0.5) * 1.5; // Smaller variations at night
          
          // Temperature drops slightly with distance from center
          const distanceEffect = -distanceFromCenter * 2;
          
          grid[i][j] = baseTemp + variation + distanceEffect;
        }
      }

      dataRef.current = { temp: data.temp, grid };
      drawHeatmap();
    }

    function drawHeatmap() {
      if (!dataRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTemperatureHeatmap(ctx, canvas.width, canvas.height, dataRef.current.grid);
    }

    // Initialize
    resizeCanvas();
    updateTemperatureData();

    // Update on map move/zoom
    const moveEndListener = () => {
      if (!map.getView().getAnimating()) {
      resizeCanvas();
      drawHeatmap();
      }
    };
    map.on('moveend', moveEndListener);

    return () => {
      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
      map.un('moveend', moveEndListener);
    };
  }, [map, visible, center]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ 
        opacity: visible ? 0.6 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
}