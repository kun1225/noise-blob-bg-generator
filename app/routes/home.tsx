'use client';

import type { Route } from './+types/home';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { generateBlobPoints, pointsToPath } from '@/lib/generate-blob';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

type FillType = 'gradient' | 'solid' | 'outline';

const colors = [
  ['#FFA500', '#FF6347'],
  ['#00FFF0', '#0066FF'],
  ['#FF69B4', '#FF1493'],
  ['#FF4B4B', '#FF0000'],
  ['#90EE90', '#32CD32'],
  ['#9370DB', '#4B0082'],
];

export default function Home() {
  const [edges, setEdges] = useState(5);
  const [smoothness, setSmoothness] = useState(0.5);
  const [fillType, setFillType] = useState<FillType>('gradient');
  const [selectedColors, setSelectedColors] = useState(colors[0]);
  const [path, setPath] = useState(() => {
    const points = generateBlobPoints(5, 0.5);
    return pointsToPath(points);
  });

  const regenerateBlob = useCallback(() => {
    const points = generateBlobPoints(edges, smoothness);
    setPath(pointsToPath(points));
  }, [edges, smoothness]);

  const downloadSVG = () => {
    const svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const pathElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    pathElement.setAttribute('d', path);

    if (fillType === 'gradient') {
      const defs = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'defs'
      );
      const gradient = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'linearGradient'
      );
      gradient.setAttribute('id', 'gradient');
      gradient.innerHTML = `
        <stop offset="0%" stop-color="${selectedColors[0]}" />
        <stop offset="100%" stop-color="${selectedColors[1]}" />
      `;
      defs.appendChild(gradient);
      svg.appendChild(defs);
      pathElement.setAttribute('fill', 'url(#gradient)');
    } else if (fillType === 'solid') {
      pathElement.setAttribute('fill', selectedColors[0]);
    } else {
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', selectedColors[0]);
      pathElement.setAttribute('stroke-width', '2');
    }

    svg.appendChild(pathElement);

    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'blob.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid gap-8 md:grid-cols-2">
      <div className="aspect-square relative bg-gray-50 rounded-lg p-8 flex items-center justify-center">
        <motion.svg
          key={path}
          viewBox="0 0 200 200"
          className="w-full h-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {fillType === 'gradient' && (
            <defs>
              <linearGradient id="blob-gradient">
                <stop offset="0%" stopColor={selectedColors[0]} />
                <stop offset="100%" stopColor={selectedColors[1]} />
              </linearGradient>
            </defs>
          )}
          <motion.path
            d={path}
            fill={
              fillType === 'gradient'
                ? 'url(#blob-gradient)'
                : fillType === 'solid'
                ? selectedColors[0]
                : 'none'
            }
            stroke={fillType === 'outline' ? selectedColors[0] : 'none'}
            strokeWidth={fillType === 'outline' ? 2 : 0}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        </motion.svg>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Edges</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust the number of edges in the shape
          </p>
          <Slider
            value={[edges]}
            onValueChange={([value]) => setEdges(value)}
            min={3}
            max={12}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Smoothness</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Make the shape more sharp or smooth
          </p>
          <Slider
            value={[smoothness]}
            onValueChange={([value]) => setSmoothness(value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Colors</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the fill type and color of the shape
          </p>
          <RadioGroup
            value={fillType}
            onValueChange={(value) => setFillType(value as FillType)}
            className="flex gap-4 mb-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gradient" id="gradient" />
              <Label htmlFor="gradient">Gradient</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="solid" id="solid" />
              <Label htmlFor="solid">Solid</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outline" id="outline" />
              <Label htmlFor="outline">Outline</Label>
            </div>
          </RadioGroup>

          <div className="grid grid-cols-3 gap-2">
            {colors.map((colorPair, i) => (
              <button
                key={i}
                onClick={() => setSelectedColors(colorPair)}
                className={`h-12 rounded-lg transition-transform hover:scale-105 ${
                  selectedColors === colorPair ? 'ring-2 ring-primary' : ''
                }`}
                style={{
                  background: `linear-gradient(to right, ${colorPair[0]}, ${colorPair[1]})`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={downloadSVG} className="flex-1">
            Download SVG
          </Button>
          <Button onClick={regenerateBlob} variant="outline" className="flex-1">
            Random (S)
          </Button>
        </div>
      </div>
    </div>
  );
}
