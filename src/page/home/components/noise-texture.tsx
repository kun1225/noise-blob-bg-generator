import { useEffect, useRef } from 'react';

interface NoiseTextureProps {
  opacity?: number;
  size?: number;
  intensity?: number;
}

export const NoiseTexture = ({ opacity = 0.05, size = 1, intensity = 1 }: NoiseTextureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth / size;
    canvas.height = window.innerHeight / size;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = 128 + (Math.random() - 0.5) * 255 * intensity;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);
  }, [size, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className='absolute inset-0 w-full h-full pointer-events-none mix-blend-screen'
      style={{
        opacity,
        imageRendering: 'pixelated',
        transform: `scale(${size})`,
        transformOrigin: '0 0',
      }}
    />
  );
};
