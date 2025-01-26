import { randomInt } from './utils';

interface Point {
  x: number;
  y: number;
}

export function generateBlobPoints(edges: number, smoothness: number, radius = 60): Point[] {
  const points: Point[] = [];
  const angleStep = (Math.PI * 2) / edges;
  const startAngle = Math.random() * Math.PI * 2;

  const baseOffset = 1 - smoothness;
  const radiusVariation = 0.8 * (1 - smoothness);
  const angleVariation = angleStep * 0.8 * (1 - smoothness);

  // Generate initial points
  for (let i = 0; i < edges; i++) {
    const angle = startAngle + i * angleStep;

    const radiusFactor = 1 + (Math.random() - 0.5) * radiusVariation * 2.2;
    const randomRadius = radius * radiusFactor * (1 + (Math.random() - 0.5) * baseOffset);
    const randomAngle = angle + (Math.random() - 0.5) * angleVariation;

    const perfectX = Math.cos(angle) * radius + 150;
    const perfectY = Math.sin(angle) * radius + 150;

    const randomX = Math.cos(randomAngle) * randomRadius + 150;
    const randomY = Math.sin(randomAngle) * randomRadius + 150;

    points.push({
      x: perfectX * smoothness + randomX * (1 - smoothness),
      y: perfectY * smoothness + randomY * (1 - smoothness),
    });
  }

  return points;
}

export function pointsToPath(points: Point[]): string {
  if (points.length < 3) return '';

  const firstPoint = points[0];
  let path = `M ${firstPoint.x} ${firstPoint.y}`;

  // Enhanced smoothing with tension control
  const tension = 0.2; // Controls how "tight" the curves are

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const afterNext = points[(i + 2) % points.length];
    const prev = points[(i - 1 + points.length) % points.length];

    // Calculate improved control points using four points for better curve prediction
    const dx1 = next.x - prev.x;
    const dy1 = next.y - prev.y;
    const dx2 = afterNext.x - current.x;
    const dy2 = afterNext.y - current.y;

    const smoothness = 1;

    // Calculate control points with enhanced smoothing
    const controlPoint1 = {
      x: current.x + dx1 * smoothness * tension,
      y: current.y + dy1 * smoothness * tension,
    };

    const controlPoint2 = {
      x: next.x - dx2 * smoothness * tension,
      y: next.y - dy2 * smoothness * tension,
    };

    // Use cubic Bezier curves with improved control points
    path += ` C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${next.x} ${next.y}`;
  }

  return path + ' Z';
}

// Add noise to make shapes more organic
export function addNoiseToPoints(points: Point[], noiseAmount: number): Point[] {
  return points.map((point) => ({
    x: point.x + (Math.random() - 0.5) * noiseAmount,
    y: point.y + (Math.random() - 0.5) * noiseAmount,
  }));
}
