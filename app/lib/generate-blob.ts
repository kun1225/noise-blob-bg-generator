interface Point {
    x: number
    y: number
  }
  
  export function generateBlobPoints(edges: number, smoothness: number, radius = 100): Point[] {
    const points: Point[] = []
    const angleStep = (Math.PI * 2) / edges
  
    for (let i = 0; i < edges; i++) {
      const angle = i * angleStep
      const randomRadius = radius * (1 + (Math.random() - 0.5) * (1 - smoothness))
      points.push({
        x: Math.cos(angle) * randomRadius + radius,
        y: Math.sin(angle) * randomRadius + radius,
      })
    }
  
    return points
  }
  
  export function pointsToPath(points: Point[]): string {
    const firstPoint = points[0]
    let path = `M ${firstPoint.x} ${firstPoint.y}`
  
    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]
      const controlPoint1 = {
        x: current.x + (next.x - current.x) * 0.5,
        y: current.y + (next.y - current.y) * 0.5,
      }
      path += ` Q ${controlPoint1.x} ${controlPoint1.y} ${next.x} ${next.y}`
    }
  
    return path + " Z"
  }
  
  