import React, { useEffect, useRef, useState } from 'react';
import { getElevationData } from '../utils/elevation';
import { Mountain } from 'lucide-react';

interface TopologyViewProps {
  center: [number, number];
  width: number;
  height: number;
}

export function TopologyView({ center, width, height }: TopologyViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let isMounted = true;

    async function drawTopology() {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      const data = await getElevationData(center[1], center[0]);
      
      if (!isMounted) return;
      
      if (!data) {
        setError('Failed to load elevation data');
        setIsLoading(false);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw elevation profile
      ctx.beginPath();
      ctx.moveTo(0, height);

      data.forEach((elevation, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((elevation - data.min) / (data.max - data.min)) * height * 0.8;
        ctx.lineTo(x, y);
      });

      ctx.lineTo(width, height);
      ctx.closePath();

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(139, 69, 19, 0.8)'); // Brown for mountains
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.6)'); // Green for valleys

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add elevation markers
      ctx.font = '12px system-ui';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      
      [0, 0.5, 1].forEach(pos => {
        const elevation = Math.round(data.min + (data.max - data.min) * pos);
        const y = height - (pos * height * 0.8);
        ctx.fillText(`${elevation}m`, 5, y + 4);
      });
      
      setIsLoading(false);
    }

    drawTopology();
    
    return () => {
      isMounted = false;
    };
  }, [center, width, height]);

  return (
    <div className="hidden sm:block absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg 
                  shadow-lg border border-gray-100 overflow-hidden w-80 transition-all 
                  duration-200 hover:shadow-xl">
      <div className="p-2 border-b border-gray-100 flex items-center gap-2 justify-center">
        <Mountain className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-gray-700">Elevation Profile</span>
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
      {error && (
        <div className="p-4 text-center text-red-500 text-sm">
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full p-2"
      />
    </div>
  );
}