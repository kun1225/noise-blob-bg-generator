'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCw, Maximize2 } from 'lucide-react';
import type { BlobConfig } from './blob-editor';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface BlobWithPosition extends BlobConfig {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface CanvasBackground {
  type: 'solid' | 'gradient';
  color1: string;
  color2: string;
  angle: number;
}

interface CanvasProps {
  blobs: BlobConfig[];
  onBlobsChange?: (blobs: BlobConfig[]) => void;
}

export function Canvas({ blobs, onBlobsChange }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const blobRefs = useRef<(SVGGElement | null)[]>([]);
  const [blobsWithPosition, setBlobsWithPosition] = useState<BlobWithPosition[]>(() =>
    blobs.map((blob) => ({
      ...blob,
      x: 500,
      y: 300,
      scale: 1,
      rotation: 0,
    })),
  );
  const [selectedBlobIndex, setSelectedBlobIndex] = useState<number | null>(null);
  const [blurAmount, setBlurAmount] = useState(0);
  const [background, setBackground] = useState<CanvasBackground>({
    type: 'solid',
    color1: '#ffffff',
    color2: '#f0f0f0',
    angle: 90,
  });

  useEffect(() => {
    blobRefs.current = blobRefs.current.slice(0, blobsWithPosition.length);
  }, [blobsWithPosition.length]);

  const getDragConstraints = (index: number) => {
    const svg = svgRef.current;
    const blob = blobRefs.current[index];
    if (!svg || !blob) return { top: 0, left: 0, right: 0, bottom: 0 };

    const blobBounds = blob.getBBox();

    return {
      left: -blobBounds.x,
      top: -blobBounds.y,
      right: svg.clientWidth - blobBounds.width,
      bottom: svg.clientHeight - blobBounds.height,
    };
  };

  if (blobs.length !== blobsWithPosition.length) {
    setBlobsWithPosition((prev) => [
      ...prev,
      ...blobs.slice(prev.length).map((blob) => ({
        ...blob,
        x: 500,
        y: 300,
        scale: 1,
        rotation: 0,
      })),
    ]);
  }

  const handleRotate = (index: number, direction: 1 | -1) => {
    setBlobsWithPosition((prev) =>
      prev.map((blob, i) =>
        i === index
          ? {
              ...blob,
              rotation: blob.rotation + 45 * direction,
            }
          : blob,
      ),
    );
  };

  const handleDelete = (index: number) => {
    setBlobsWithPosition((prev) => prev.filter((_, i) => i !== index));
    setSelectedBlobIndex(null);
  };

  const handleBlobClick = (index: number) => {
    setSelectedBlobIndex(selectedBlobIndex === index ? null : index);
  };

  const handleScale = (index: number, scaleFactor: number) => {
    setBlobsWithPosition((prev) =>
      prev.map((blob, i) =>
        i === index
          ? {
              ...blob,
              scale: Math.max(0.2, Math.min(3, blob.scale * scaleFactor)),
            }
          : blob,
      ),
    );
  };

  const getBackgroundStyle = () => {
    if (background.type === 'solid') {
      return { backgroundColor: background.color1 };
    }

    const angle = background.angle;
    return {
      background: `linear-gradient(${angle}deg, ${background.color1}, ${background.color2})`,
    };
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <span className='text-sm font-medium'>Blur Amount</span>
        <Slider
          value={[blurAmount]}
          onValueChange={([value]) => setBlurAmount(value)}
          min={0}
          max={100}
          step={0.5}
          className='w-48'
        />
      </div>

      <div className='space-y-4 p-4 border rounded-lg'>
        <h3 className='font-medium'>Background</h3>
        <RadioGroup
          value={background.type}
          onValueChange={(value: 'solid' | 'gradient') =>
            setBackground((prev) => ({ ...prev, type: value }))
          }
          className='flex gap-4'
        >
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='solid' id='solid' />
            <Label htmlFor='solid'>Solid</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='gradient' id='gradient' />
            <Label htmlFor='gradient'>Gradient</Label>
          </div>
        </RadioGroup>

        <div className='flex gap-4'>
          <div className='flex-1'>
            <Label className='block mb-2'>
              {background.type === 'gradient' ? 'Start Color' : 'Color'}
            </Label>
            <div className='flex gap-2'>
              <div
                className='w-10 h-10 rounded-lg border'
                style={{ backgroundColor: background.color1 }}
              />
              <Input
                type='color'
                value={background.color1}
                onChange={(e) => setBackground((prev) => ({ ...prev, color1: e.target.value }))}
                className='h-10 w-full'
              />
            </div>
          </div>

          {background.type === 'gradient' && (
            <>
              <div className='flex-1'>
                <Label className='block mb-2'>End Color</Label>
                <div className='flex gap-2'>
                  <div
                    className='w-10 h-10 rounded-lg border'
                    style={{ backgroundColor: background.color2 }}
                  />
                  <Input
                    type='color'
                    value={background.color2}
                    onChange={(e) => setBackground((prev) => ({ ...prev, color2: e.target.value }))}
                    className='h-10 w-full'
                  />
                </div>
              </div>

              <div className='flex-1'>
                <Label className='block mb-2'>Angle</Label>
                <div className='flex gap-4 items-center'>
                  <Slider
                    value={[background.angle]}
                    onValueChange={([value]) =>
                      setBackground((prev) => ({ ...prev, angle: value }))
                    }
                    min={0}
                    max={360}
                    step={1}
                    className='flex-1'
                  />
                  <span className='w-12 text-sm'>{background.angle}°</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className='w-full aspect-video bg-gray-50 rounded-lg relative overflow-hidden'
        style={getBackgroundStyle()}
      >
        <svg width='0' height='0'>
          <defs>
            <filter id='canvas-blur'>
              <feGaussianBlur stdDeviation={blurAmount} />
            </filter>
          </defs>
        </svg>

        <svg
          ref={svgRef}
          className='w-full h-full'
          viewBox='0 0 1000 600'
          style={{ filter: 'url(#canvas-blur)' }}
        >
          {blobsWithPosition.map((blob, index) => (
            <motion.g
              key={index}
              ref={(el: SVGGElement | null) => {
                blobRefs.current[index] = el;
              }}
              onClick={() => handleBlobClick(index)}
            >
              {blob.fillType === 'gradient' && (
                <defs>
                  <linearGradient
                    id={`blob-gradient-${index}`}
                    gradientUnits='userSpaceOnUse'
                    x1={`${50 - Math.cos((blob.gradientAngle * Math.PI) / 180) * 50}%`}
                    y1={`${50 - Math.sin((blob.gradientAngle * Math.PI) / 180) * 50}%`}
                    x2={`${50 + Math.cos((blob.gradientAngle * Math.PI) / 180) * 50}%`}
                    y2={`${50 + Math.sin((blob.gradientAngle * Math.PI) / 180) * 50}%`}
                  >
                    <stop offset='0%' stopColor={blob.color1} />
                    <stop offset='100%' stopColor={blob.color2} />
                  </linearGradient>
                </defs>
              )}
              <motion.path
                d={blob.path}
                fill={
                  blob.fillType === 'gradient'
                    ? `url(#blob-gradient-${index})`
                    : blob.fillType === 'solid'
                    ? blob.color1
                    : 'none'
                }
                stroke={
                  selectedBlobIndex === index
                    ? '#000'
                    : blob.fillType === 'outline'
                    ? blob.color1
                    : 'none'
                }
                strokeWidth={selectedBlobIndex === index ? 1 : blob.fillType === 'outline' ? 2 : 0}
                strokeDasharray={selectedBlobIndex === index ? '5,5' : 'none'}
                initial={{ scale: 0, x: 500, y: 300 }}
                animate={{
                  scale: blob.scale * (selectedBlobIndex === index ? 1.05 : 1),
                  x: blob.x,
                  y: blob.y,
                  rotate: blob.rotation,
                }}
                transition={{
                  type: 'spring',
                  duration: 0.5,
                }}
                drag={selectedBlobIndex === index}
                dragMomentum={false}
                whileHover={{ scale: blob.scale * 1.05 }}
                whileDrag={{ scale: blob.scale * 1.05 }}
                style={{ cursor: selectedBlobIndex === index ? 'grab' : 'pointer' }}
              />

              {selectedBlobIndex === index && (
                <g>
                  <motion.circle
                    cx={blob.x + 50}
                    cy={blob.y + 50}
                    r={6}
                    fill='white'
                    stroke='black'
                    strokeWidth={1}
                    style={{ cursor: 'nw-resize' }}
                    drag
                    dragMomentum={false}
                    onDrag={(_, info) => {
                      const center = { x: blob.x, y: blob.y };
                      const point = { x: info.point.x, y: info.point.y };

                      const originalDistance = Math.sqrt(50 * 50 + 50 * 50);
                      const newDistance = Math.sqrt(
                        Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2),
                      );

                      const scaleFactor = newDistance / originalDistance;
                      handleScale(index, scaleFactor);
                    }}
                  />
                </g>
              )}
            </motion.g>
          ))}
        </svg>

        {selectedBlobIndex !== null && (
          <div
            className='absolute flex gap-2 p-2 bg-white rounded-lg shadow-lg'
            style={{
              left: `${(blobsWithPosition[selectedBlobIndex].x / 1000) * 100}%`,
              top: `${(blobsWithPosition[selectedBlobIndex].y / 600) * 100}%`,
              transform: 'translate(-50%, -150%)',
              zIndex: 10,
            }}
          >
            <Button
              size='icon'
              variant='outline'
              onClick={() => handleScale(selectedBlobIndex, 1.1)}
            >
              <Maximize2 className='w-4 h-4' />
            </Button>
            <Button
              size='icon'
              variant='outline'
              onClick={() => handleScale(selectedBlobIndex, 0.9)}
            >
              <Maximize2 className='w-4 h-4 scale-75' />
            </Button>
            <Button
              size='icon'
              variant='outline'
              onClick={() => handleRotate(selectedBlobIndex, -1)}
            >
              <RotateCw className='w-4 h-4' />
            </Button>
            <Button
              size='icon'
              variant='outline'
              onClick={() => handleRotate(selectedBlobIndex, 1)}
            >
              <RotateCw className='w-4 h-4 scale-x-[-1]' />
            </Button>
            <Button
              size='icon'
              variant='destructive'
              onClick={() => handleDelete(selectedBlobIndex)}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
