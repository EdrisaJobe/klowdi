import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import { getTemperatureData } from '../../utils/weather';
import { drawTemperatureHeatmap } from '../../utils/canvas';

interface TemperatureLayerProps {
  map: Map | null;
  center: [number, number];
  visible: boolean;
}

export function TemperatureLayer({ map, center, visible }: TemperatureLayerProps) {
  const dataRef = useRef<{ temp: number; grid: number[][] } | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!map || !visible) return;

    const viewport = map.getViewport();
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    `;
    viewport.appendChild(canvas);
    
    const ctx = canvas.getContext('2d', { alpha: true })!;
    let isDestroyed = false;

    function resizeCanvas() {
      if (!map) return;
      const size = map.getSize();
      if (!size) return;
      canvas.width = size[0];
      canvas.height = size[1];
      if (dataRef.current) {
        drawHeatmap();
      }
    }

    async function updateTemperatureData() {
      if (isDestroyed) return;
      
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
      canvas.style.opacity = '0.6';
      
      if (!isDestroyed) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(drawHeatmap);
      }
    }

    function drawHeatmap() {
      if (!dataRef.current || isDestroyed) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      try {
        drawTemperatureHeatmap(ctx, canvas.width, canvas.height, dataRef.current.grid);
      } catch (error) {
        console.error('Error drawing temperature heatmap:', error);
      }
    }

    // Initialize
    resizeCanvas();
    updateTemperatureData();

    // Update on map move/zoom
    const moveEndListener = () => {
      if (!map.getView().getAnimating()) {
        resizeCanvas();
        updateTemperatureData();
      }
    };
    map.on('moveend', moveEndListener);

    return () => {
      isDestroyed = true;
      map.un('moveend', moveEndListener);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (canvas && canvas.parentNode === viewport) {
        canvas.style.opacity = '0';
        // Give time for the fade out animation
        setTimeout(() => {
          if (canvas.parentNode === viewport) {
            canvas.parentNode.removeChild(canvas);
          }
        }, 300);
      }
    };
  }, [map, visible, center]);

  return null;
}