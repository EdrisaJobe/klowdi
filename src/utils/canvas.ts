export function drawWindArrows(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  speed: number,
  alpha: number = 0.6,
  scale: number = 1
) {
  // Adjust length based on wind speed with a more reasonable scale
  const length = Math.min(20, 10 + speed * 0.5) * scale;
  const headLength = length * 0.3;

  ctx.save();
  ctx.translate(x, y);
  // Point arrow in direction of wind flow
  ctx.rotate(angle);

  // Draw arrow body
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  
  // Draw arrow head
  ctx.lineTo(length - headLength, headLength * 0.8);
  ctx.moveTo(length, 0);
  ctx.lineTo(length - headLength, -headLength * 0.8);

  // Style
  ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
  ctx.lineWidth = 1.5 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.restore();
}

export function drawSnowflake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number = 0.8
) {
  ctx.save();
  ctx.translate(x, y);
  
  // Draw snowflake
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    
    // Add small branches
    ctx.moveTo(size * 0.4, -size * 0.2);
    ctx.lineTo(size * 0.4, size * 0.2);
    ctx.moveTo(size * 0.7, -size * 0.2);
    ctx.lineTo(size * 0.7, size * 0.2);
  }
  
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = size / 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  ctx.restore();
}

export function drawTemperatureHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: number[][]
) {
  const cellWidth = width / grid[0].length;
  const cellHeight = height / grid.length;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const temp = grid[i][j];
      const x = j * cellWidth;
      const y = i * cellHeight;

      // Temperature color scale
      const color = getTemperatureColor(temp);
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1);
    }
  }
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: number[][],
  time?: number,
  weatherType?: string
) {
  const cellWidth = width / grid[0].length;
  const cellHeight = height / grid.length;
  
  // Adjust cloud appearance based on weather type
  const isOvercast = weatherType === 'Clouds';
  const baseOpacity = isOvercast ? 0.9 : 0.7;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const coverage = grid[i][j];
      const x = j * cellWidth;
      const y = i * cellHeight;

      // Only draw if there's significant cloud coverage
      if (coverage > 10) {
        const alpha = coverage / 100 * baseOpacity;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        
        // Calculate animated position for heavy cloud cover
        let offsetX = 0;
        let offsetY = 0;
        if (time !== undefined) {
          // Slower, more unified movement for overcast conditions
          const speed = isOvercast ? 0.1 : 0.2;
          offsetX = Math.sin(time + i * speed) * cellWidth * 0.2;
          offsetY = Math.cos(time + j * speed) * cellHeight * 0.2;
        }
        
        // Larger, more connected clouds for overcast conditions
        ctx.beginPath();
        const baseRadius = isOvercast ? 0.7 : 0.5;
        const radius = cellWidth * (baseRadius + coverage / 200);
        ctx.arc(
          x + cellWidth/2 + offsetX,
          y + cellHeight/2 + offsetY,
          radius,
          0,
          Math.PI * 2
        );
        
        // Add extra cloud layers for overcast conditions
        if (isOvercast && coverage > 60) {
          ctx.arc(
            x + cellWidth/2 + offsetX - radius * 0.5,
            y + cellHeight/2 + offsetY,
            radius * 0.7,
            0,
            Math.PI * 2
          );
        }
        
        ctx.fill();
      }
    }
  }
}

export function drawRaindrops(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  // Draw raindrop streak
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + size * 8); // Longer streaks
  
  const gradient = ctx.createLinearGradient(x, y, x, y + size * 8);
  gradient.addColorStop(0, 'rgba(200, 220, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(200, 220, 255, 0.8)');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  
  // Create cloud gradient
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
  
  // Draw main cloud body
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
  ctx.arc(size * 0.3, -size * 0.2, size * 0.4, 0, Math.PI * 2);
  ctx.arc(-size * 0.3, -size * 0.1, size * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.restore();
}
function getTemperatureColor(temp: number): string {
  // Enhanced temperature color scale
  if (temp <= -10) {
    return 'rgba(200, 233, 255, 0.6)'; // Very cold: ice blue
  } else if (temp <= 0) {
    const ratio = (temp + 10) / 10;
    return `rgba(${200 + Math.round(55 * ratio)}, ${233 + Math.round(22 * ratio)}, 255, 0.6)`;
  } else if (temp <= 15) {
    const ratio = temp / 15;
    return `rgba(255, ${255 - Math.round(100 * ratio)}, ${255 - Math.round(150 * ratio)}, 0.6)`;
  } else if (temp <= 30) {
    const ratio = (temp - 15) / 15;
    return `rgba(255, ${155 - Math.round(155 * ratio)}, ${105 - Math.round(105 * ratio)}, 0.6)`;
  } else {
    return 'rgba(255, 0, 0, 0.6)'; // Very hot: pure red
  }
}

