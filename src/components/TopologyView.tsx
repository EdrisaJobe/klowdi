import { useEffect, useRef, useState } from 'react';
import { getElevationData } from '../utils/elevation';
import { Mountain, Eye, Layers } from 'lucide-react';

interface TopologyViewProps {
  center: [number, number];
  width: number;
  height: number;
}

type ViewMode = 'contour' | 'gradient' | 'both';

export function TopologyView({ center, width, height }: TopologyViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [showControls, setShowControls] = useState(false);

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

      // Clear previous animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      let time = 0;
      function animate() {
        if (!isMounted || !data) return;

        ctx.clearRect(0, 0, width, height);

        // Draw contour lines if enabled
        if (viewMode === 'contour' || viewMode === 'both') {
          const contourCount = 5;
          const contourStep = (data.max - data.min) / contourCount;
          
          for (let i = 0; i <= contourCount; i++) {
            const elevation = data.min + i * contourStep;
            const y = height - ((elevation - data.min) / (data.max - data.min)) * height * 0.8;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + (i / contourCount) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Draw elevation profile with animation
        ctx.beginPath();
        ctx.moveTo(0, height);

        data.forEach((elevation, i) => {
          const x = (i / (data.length - 1)) * width;
          const baseY = height - ((elevation - data.min) / (data.max - data.min)) * height * 0.8;
          
          // Add subtle wave animation
          const waveOffset = Math.sin(time + i * 0.1) * 2;
          const y = baseY + waveOffset;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.lineTo(width, height);
        ctx.closePath();

        // Create sophisticated terrain gradient if enabled
        if (viewMode === 'gradient' || viewMode === 'both') {
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, 'rgba(139, 69, 19, 0.8)'); // Mountain tops
          gradient.addColorStop(0.3, 'rgba(160, 82, 45, 0.7)'); // Upper slopes
          gradient.addColorStop(0.5, 'rgba(34, 139, 34, 0.6)'); // Mid slopes
          gradient.addColorStop(0.7, 'rgba(46, 139, 87, 0.5)'); // Lower slopes
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.4)'); // Valleys

          ctx.fillStyle = gradient;
          ctx.fill();
        } else {
          // If only contour mode, use a simple fill
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
          ctx.fill();
        }

        // Add elevation markers with improved styling
        ctx.font = '12px system-ui';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        [0, 0.25, 0.5, 0.75, 1].forEach(pos => {
          const elevation = Math.round(data.min + (data.max - data.min) * pos);
          const y = height - (pos * height * 0.8);
          
          // Draw marker line
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
          
          // Draw elevation label with background
          const text = `${elevation}m`;
          const textWidth = ctx.measureText(text).width;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(5, y - 10, textWidth + 8, 20);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(text, 9, y);
        });

        time += 0.02;
        animationRef.current = requestAnimationFrame(animate);
      }

      animate();
      setIsLoading(false);
    }

    drawTopology();
    
    return () => {
      isMounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [center, width, height, viewMode]);

  return (
    <div className="hidden sm:block absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg 
                  shadow-lg border border-gray-100 overflow-hidden w-96 transition-all 
                  duration-200 hover:shadow-xl">
      <div className="p-2 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Elevation Profile</span>
        </div>
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Layers className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      {showControls && (
        <div className="p-2 border-b border-gray-100 flex gap-2">
          <button
            onClick={() => setViewMode('both')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-sm
                     transition-all duration-200 ${
                       viewMode === 'both'
                         ? 'bg-blue-50 text-blue-700 border border-blue-200'
                         : 'hover:bg-gray-50 text-gray-600'
                     }`}
          >
            <Eye className="w-4 h-4" />
            Both
          </button>
          <button
            onClick={() => setViewMode('contour')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-sm
                     transition-all duration-200 ${
                       viewMode === 'contour'
                         ? 'bg-blue-50 text-blue-700 border border-blue-200'
                         : 'hover:bg-gray-50 text-gray-600'
                     }`}
          >
            <Eye className="w-4 h-4" />
            Contour
          </button>
          <button
            onClick={() => setViewMode('gradient')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-sm
                     transition-all duration-200 ${
                       viewMode === 'gradient'
                         ? 'bg-blue-50 text-blue-700 border border-blue-200'
                         : 'hover:bg-gray-50 text-gray-600'
                     }`}
          >
            <Eye className="w-4 h-4" />
            Gradient
          </button>
        </div>
      )}

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