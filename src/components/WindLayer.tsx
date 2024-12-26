import React, { useEffect, useRef } from 'react';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import Map from 'ol/Map';
import { getWindData, getWindGridData } from '../utils/weather';
import { drawWindArrows } from '../utils/canvas';

interface WindLayerProps {
  map: Map | null;
  center: [number, number];
  visible: boolean;
}

export function WindLayer({ map, center, visible }: WindLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!map || !visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let particles: Array<{ x: number; y: number; speed: number; angle: number }> = [];
    let windGrid: Array<{ lat: number; lon: number; speed: number; deg: number }> = [];

    function resizeCanvas() {
      const size = map.getSize();
      if (!size) return;
      canvas.width = size[0];
      canvas.height = size[1];
    }

    async function initializeParticles() {
      const view = map.getView();
      const extent = view.calculateExtent();
      const [minLon, minLat, maxLon, maxLat] = extent.map(coord => toLonLat([coord, coord])[0]);
      const zoom = view.getZoom() || 0;
      
      // Get wind data grid for visible area
      windGrid = await getWindGridData(
        Math.min(minLat, maxLat),
        Math.max(minLat, maxLat),
        Math.min(minLon, maxLon),
        Math.max(minLon, maxLon)
      );
      
      if (!windGrid.length) return;

      // Create particles based on zoom level
      const particleCount = Math.min(100, Math.max(50, Math.floor(200 / Math.pow(2, zoom - 8))));
      particles = Array.from({ length: particleCount }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const [lon, lat] = toLonLat(map.getCoordinateFromPixel([x, y]));
        
        // Find nearest wind data point
        const nearest = windGrid.reduce((prev, curr) => {
          const prevDist = Math.hypot(prev.lat - lat, prev.lon - lon);
          const currDist = Math.hypot(curr.lat - lat, curr.lon - lon);
          return currDist < prevDist ? curr : prev;
        });
        
        return {
          x,
          y,
          speed: nearest.speed * 0.3, // Scale down for animation
          angle: (nearest.deg * Math.PI) / 180
        };
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const view = map.getView();
      const zoom = view.getZoom() || 0;
      
      particles.forEach((particle) => {
        // Update particle position
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;

        // Wrap particles around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw wind arrow
        const alpha = Math.min(0.8, Math.max(0.3, zoom / 15));
        drawWindArrows(ctx, particle.x, particle.y, particle.angle, particle.speed, alpha);
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    // Initialize
    resizeCanvas();
    initializeParticles();
    animate();

    // Update particles on map move
    const moveEndListener = () => {
      if (!map.getView().getAnimating()) {
        initializeParticles();
      }
    };
    
    const postrender = () => {
      if (!map.getView().getAnimating()) {
        animate();
      }
    };

    map.on('moveend', moveEndListener);
    map.on('postrender', postrender);

    // Cleanup
    return () => {
      map.un('postrender', postrender);
      map.un('moveend', moveEndListener);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, [map, visible, center]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ opacity: visible ? 0.7 : 0 }}
    />
  );
}