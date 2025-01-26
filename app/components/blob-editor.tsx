'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { generateBlobPoints, pointsToPath } from '@/lib/generate-blob';

export interface BlobConfig {
  edges: number;
  smoothness: number;
  fillType: 'gradient' | 'solid' | 'outline';
  color1: string;
  color2: string;
  gradientAngle: number;
  path: string;
  width: number;
  height: number;
}

interface BlobEditorProps {
  onAdd?: (config: BlobConfig) => void;
  onCancel?: () => void;
}

type FillType = 'gradient' | 'solid' | 'outline';

export function BlobEditor({ onAdd, onCancel }: BlobEditorProps) {
  const [edges, setEdges] = useState(5);
  const [smoothness, setSmoothness] = useState(0.5);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [fillType, setFillType] = useState<FillType>('gradient');
  const [color1, setColor1] = useState('#D3E1EB');
  const [color2, setColor2] = useState('#FFFFFF');
  const [path, setPath] = useState(() => {
    const points = generateBlobPoints(edges, smoothness, 60, { width, height });
    return pointsToPath(points);
  });
  const [gradientAngle, setGradientAngle] = useState(90);

  const regenerateBlob = useCallback(() => {
    const points = generateBlobPoints(edges, smoothness, 60, { width, height });
    setPath(pointsToPath(points));
  }, [edges, smoothness, width, height]);

  const getFillValue = () => {
    if (fillType === 'gradient') {
      return `url(#blob-gradient)`;
    }
    return fillType === 'solid' ? color1 : 'none';
  };

  const downloadSVG = () => {
    const svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', path);

    if (fillType === 'gradient') {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', 'gradient');

      const angle = (gradientAngle * Math.PI) / 180;
      const x1 = 50 - Math.cos(angle) * 50;
      const y1 = 50 - Math.sin(angle) * 50;
      const x2 = 50 + Math.cos(angle) * 50;
      const y2 = 50 + Math.sin(angle) * 50;

      gradient.setAttribute('x1', `${x1}%`);
      gradient.setAttribute('y1', `${y1}%`);
      gradient.setAttribute('x2', `${x2}%`);
      gradient.setAttribute('y2', `${y2}%`);

      gradient.innerHTML = `
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        `;
      defs.appendChild(gradient);
      svg.appendChild(defs);
      pathElement.setAttribute('fill', 'url(#gradient)');
    } else if (fillType === 'solid') {
      pathElement.setAttribute('fill', color1);
    } else {
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', color1);
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

  const handleAdd = () => {
    onAdd?.({
      edges,
      smoothness,
      fillType,
      color1,
      color2,
      gradientAngle,
      path,
      width,
      height,
    });
  };

  return (
    <div className='max-w-4xl mx-auto p-6 grid gap-8 md:grid-cols-2'>
      <div className='aspect-square relative bg-gray-50 rounded-lg p-8 flex items-center justify-center'>
        <motion.svg
          key={path}
          viewBox='0 0 300 300'
          className='w-full h-full'
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {fillType === 'gradient' && (
            <defs>
              <linearGradient
                id='blob-gradient'
                gradientUnits='userSpaceOnUse'
                x1={`${50 - Math.cos((gradientAngle * Math.PI) / 180) * 50}%`}
                y1={`${50 - Math.sin((gradientAngle * Math.PI) / 180) * 50}%`}
                x2={`${50 + Math.cos((gradientAngle * Math.PI) / 180) * 50}%`}
                y2={`${50 + Math.sin((gradientAngle * Math.PI) / 180) * 50}%`}
              >
                <stop offset='0%' stopColor={color1} />
                <stop offset='100%' stopColor={color2} />
              </linearGradient>
            </defs>
          )}
          <motion.path
            d={path}
            fill={getFillValue()}
            stroke={fillType === 'outline' ? color1 : 'none'}
            strokeWidth={fillType === 'outline' ? 2 : 0}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        </motion.svg>
      </div>

      <div className='space-y-8'>
        <div>
          <h2 className='text-lg font-semibold mb-4'>Edges</h2>
          <p className='text-sm text-muted-foreground mb-4'>
            Adjust the number of edges in the shape
          </p>
          <Slider
            value={[edges]}
            onValueChange={([value]) => {
              setEdges(value);
              regenerateBlob();
            }}
            min={3}
            max={30}
            step={1}
            className='w-full'
          />
        </div>

        <div>
          <h2 className='text-lg font-semibold mb-4'>Smoothness</h2>
          <p className='text-sm text-muted-foreground mb-4'>Make the shape more sharp or smooth</p>
          <Slider
            value={[smoothness]}
            onValueChange={([value]) => {
              setSmoothness(value);
              regenerateBlob();
            }}
            min={0}
            max={0.8}
            step={0.05}
            className='w-full'
          />
        </div>

        <div>
          <h2 className='text-lg font-semibold mb-4'>Size</h2>
          <div className='space-y-6'>
            <div>
              <div className='flex justify-between mb-2'>
                <Label>Width</Label>
                <span className='text-sm text-muted-foreground'>{(width * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[width]}
                onValueChange={([value]) => {
                  setWidth(value);
                  regenerateBlob();
                }}
                min={0.5}
                max={2}
                step={0.1}
                className='w-full'
              />
            </div>

            <div>
              <div className='flex justify-between mb-2'>
                <Label>Height</Label>
                <span className='text-sm text-muted-foreground'>{(height * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[height]}
                onValueChange={([value]) => {
                  setHeight(value);
                  regenerateBlob();
                }}
                min={0.5}
                max={2}
                step={0.1}
                className='w-full'
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className='text-lg font-semibold mb-4'>Colors</h2>
          <p className='text-sm text-muted-foreground mb-4'>
            Choose the fill type and color of the shape
          </p>
          <RadioGroup
            value={fillType}
            onValueChange={(value) => setFillType(value as FillType)}
            className='flex gap-4 mb-4'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='gradient' id='gradient' />
              <Label htmlFor='gradient'>Gradient</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='solid' id='solid' />
              <Label htmlFor='solid'>Solid</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='outline' id='outline' />
              <Label htmlFor='outline'>Outline</Label>
            </div>
          </RadioGroup>

          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <Label htmlFor='color1' className='block mb-2'>
                  {fillType === 'gradient' ? 'Start Color' : 'Color'}
                </Label>
                <div className='flex gap-2'>
                  <div
                    className='w-10 h-10 rounded-lg border'
                    style={{ backgroundColor: color1 }}
                  />
                  <Input
                    id='color1'
                    type='color'
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className='h-10 w-full'
                  />
                </div>
              </div>

              {fillType === 'gradient' && (
                <div className='flex-1'>
                  <Label htmlFor='color2' className='block mb-2'>
                    End Color
                  </Label>
                  <div className='flex gap-2'>
                    <div
                      className='w-10 h-10 rounded-lg border'
                      style={{ backgroundColor: color2 }}
                    />
                    <Input
                      id='color2'
                      type='color'
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      className='h-10 w-full'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {fillType === 'gradient' && (
            <div className='mt-4'>
              <Label htmlFor='angle' className='block mb-2'>
                Gradient Angle
              </Label>
              <div className='flex gap-4 items-center'>
                <Slider
                  id='angle'
                  value={[gradientAngle]}
                  onValueChange={([value]) => setGradientAngle(value)}
                  min={0}
                  max={360}
                  step={1}
                  className='flex-1'
                />
                <span className='w-12 text-sm'>{gradientAngle}°</span>
              </div>
            </div>
          )}
        </div>

        <div className='flex gap-4'>
          <Button onClick={handleAdd} className='flex-1'>
            Add to Canvas
          </Button>
          <Button onClick={downloadSVG} className='flex-1'>
            Download SVG
          </Button>
          <Button onClick={regenerateBlob} variant='outline' className='flex-1'>
            Random
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant='outline' className='flex-1'>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
