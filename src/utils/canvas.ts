export function drawWindArrows(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  speed: number,
  alpha: number = 0.6
) {
  const length = Math.min(20, speed * 5);
  const headLength = length * 0.3;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Draw arrow body
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  
  // Draw arrow head
  ctx.lineTo(length - headLength, headLength);
  ctx.moveTo(length, 0);
  ctx.lineTo(length - headLength, -headLength);

  // Style
  ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
  ctx.lineWidth = 2;
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

export function drawWeatherEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weatherType: string
) {
  switch (weatherType) {
    case 'Thunderstorm':
      drawLightning(ctx, width, height);
      break;
    case 'Snow':
      drawSnowfall(ctx, width, height);
      break;
    case 'Clear':
      drawSunshine(ctx, width, height);
      break;
  }
}

function drawLightning(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const time = Date.now() / 1000;
  if (Math.sin(time) > 0.95) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw lightning bolt
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const x = width * (0.4 + Math.random() * 0.2);
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 20, height * 0.3);
    ctx.lineTo(x + 10, height * 0.5);
    ctx.lineTo(x - 30, height);
    ctx.stroke();
  }
}

function drawSnowfall(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const time = Date.now() / 1000;
  const snowflakes = 100;
  
  for (let i = 0; i < snowflakes; i++) {
    const x = (i * width / snowflakes + time * 50) % width;
    const y = (i * height / snowflakes + time * 100) % height;
    const size = 2 + Math.sin(time + i) * 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
}

function drawSunshine(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const time = Date.now() / 1000;
  const centerX = width / 2;
  const centerY = height / 4;
  const radius = 40;
  
  // Draw sun
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  );
  gradient.addColorStop(0, 'rgba(255, 255, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Draw rays
  const rayCount = 12;
  const rayLength = radius * 0.5;
  
  ctx.strokeStyle = 'rgba(255, 200, 0, 0.2)';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + time;
    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + rayLength + Math.sin(time * 2) * 10);
    const y2 = centerY + Math.sin(angle) * (radius + rayLength + Math.sin(time * 2) * 10);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}