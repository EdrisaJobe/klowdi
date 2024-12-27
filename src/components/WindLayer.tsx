import React, { useEffect, useRef } from 'react';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import Map from 'ol/Map';
import { getWindData } from '../utils/weather';
import { drawWindArrows } from '../utils/canvas';

interface WindLayerProps {
  map: Map | null;
  center: [number, number];
  visible: boolean;
  windData?: { speed: number; deg: number };
}

export function WindLayer({ map, center, visible, windData }: WindLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Array<{ x: number; y: number; speed: number; angle: number }>>([]);
  const lastWindDataRef = useRef(windData);

  useEffect(() => {
    if (!map) return;
    
    const viewport = map.getViewport();
    const canvas = document.createElement('canvas');
    canvas.className = "absolute inset-0 pointer-events-none z-20";
    canvas.style.opacity = visible ? '0.7' : '0';
    canvas.style.transition = 'opacity 0.3s ease-in-out';
    viewport.appendChild(canvas);
    canvasRef.current = canvas;
    
    // Update last wind data reference
    if (windData) {
      lastWindDataRef.current = windData;
    }

    const ctx = canvas.getContext('2d')!;
    let isAnimating = visible;

    function resizeCanvas() {
      const size = map.getSize();
      if (!size) return;
      canvas.width = size[0];
      canvas.height = size[1];
    }

    async function initializeParticles() {
      const view = map.getView();
      const zoom = view.getZoom() || 4;
      const extent = view.calculateExtent();
      
      if (!lastWindDataRef.current) return;

      // Create particles based on zoom level
      const particleCount = Math.min(200, Math.max(100, Math.floor(400 / Math.pow(2, zoom - 8))));
      particlesRef.current = Array.from({ length: particleCount }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        
        return {
          x,
          y,
          speed: lastWindDataRef.current.speed * 0.05, // Even slower animation
          angle: (lastWindDataRef.current.deg * Math.PI) / 180
        };
      });
    }

    function animate() {
      if (!isAnimating) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const view = map.getView();
      const zoom = view.getZoom() || 4;
      
      particlesRef.current.forEach((particle) => {
        // Update particle position
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        
        // Slow down wrapping to make movement more continuous
        const margin = 50;
        if (particle.x < -margin) particle.x = canvas.width + margin;
        if (particle.x > canvas.width + margin) particle.x = -margin;
        if (particle.y < -margin) particle.y = canvas.height + margin;
        if (particle.y > canvas.height + margin) particle.y = -margin;

        // Calculate arrow scale based on zoom level
        const scale = Math.min(1.2, Math.max(0.6, zoom / 10));
        const alpha = Math.min(0.8, Math.max(0.3, zoom / 15));

        // Draw wind arrow (angle already points in wind direction)
        drawWindArrows(ctx, particle.x, particle.y, particle.angle, particle.speed * 10, alpha, scale);
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    // Initialize
    resizeCanvas();
    initializeParticles();
    if (visible) {
      animate();
    }

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

    // Reset animation when wind data changes
    if (windData !== lastWindDataRef.current) {
      initializeParticles();
    }

    map.on('moveend', moveEndListener);
    map.on('postrender', postrender);

    // Handle visibility changes
    canvas.style.opacity = visible ? '0.7' : '0';
    isAnimating = visible;
    if (visible) {
      animate();
    }

    // Cleanup
    return () => {
      map.un('postrender', postrender);
      map.un('moveend', moveEndListener);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      
      if (canvas && canvas.parentNode === viewport) {
        canvas.parentNode.removeChild(canvas);
      }
      canvasRef.current = null;
    };
  }, [map, visible, center, windData]);

  return (
    null
  );
}