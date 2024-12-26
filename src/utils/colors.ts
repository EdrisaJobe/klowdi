export function getTemperatureColor(temp: number, alpha: number = 0.6): string {
  // Enhanced temperature color scale
  if (temp <= -10) {
    return `rgba(68, 140, 255, ${alpha})`; // Deep cold blue
  } else if (temp <= 0) {
    const ratio = (temp + 10) / 10;
    return `rgba(${68 + Math.round(87 * ratio)}, ${140 + Math.round(115 * ratio)}, 255, ${alpha})`;
  } else if (temp <= 15) {
    const ratio = temp / 15;
    return `rgba(${155 + Math.round(100 * ratio)}, ${255 - Math.round(100 * ratio)}, ${255 - Math.round(255 * ratio)}, ${alpha})`;
  } else if (temp <= 30) {
    const ratio = (temp - 15) / 15;
    return `rgba(255, ${155 - Math.round(100 * ratio)}, ${0}, ${alpha})`;
  } else {
    return `rgba(255, 55, 0, ${alpha})`; // Hot orange-red
  }
}