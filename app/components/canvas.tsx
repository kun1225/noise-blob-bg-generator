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
import { NoiseTexture } from './noise-texture';

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
  setBlobs: (value: React.SetStateAction<BlobConfig[]>) => void;
  onBlobsChange?: (blobs: BlobConfig[]) => void;
}

export function Canvas({ blobs, setBlobs, onBlobsChange }: CanvasProps) {
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
  const [noiseSettings, setNoiseSettings] = useState({
    opacity: 0.05,
    size: 1,
    intensity: 1,
  });

  useEffect(() => {
    blobRefs.current = blobRefs.current.slice(0, blobsWithPosition.length);
  }, [blobsWithPosition.length]);

  useEffect(() => {
    if (blobs.length < blobsWithPosition.length) {
      setBlobsWithPosition((prev) => prev.filter((_, index) => index < blobs.length));
    } else if (blobs.length > blobsWithPosition.length) {
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
  }, [blobs.length, blobsWithPosition.length]);

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
    setBlobs((prev) => prev.filter((_, i) => i !== index));
    setSelectedBlobIndex(null);
    if (onBlobsChange) {
      const updatedBlobs = blobs.filter((_, i) => i !== index);
      onBlobsChange(updatedBlobs);
    }
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
    <div className='relative w-full h-full space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Canvas Controls */}
        <div className='space-y-6'>
          {/* Blur Control */}
          <div className='rounded-2xl bg-white/50 backdrop-blur-xl p-6 border border-gray-200/50 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <Label className='text-sm font-medium text-gray-700'>Blur</Label>
              <span className='text-xs text-gray-500'>{blurAmount.toFixed(1)}</span>
            </div>
            <Slider
              value={[blurAmount]}
              onValueChange={([value]) => setBlurAmount(value)}
              min={0}
              max={100}
              step={0.5}
              className='w-full'
            />
          </div>

          {/* Background Control */}
          <div className='rounded-2xl bg-white/50 backdrop-blur-xl p-6 border border-gray-200/50 shadow-sm'>
            <h3 className='text-base font-medium text-gray-900 mb-4'>Background</h3>
            <div className='space-y-4'>
              <RadioGroup
                value={background.type}
                onValueChange={(value: 'solid' | 'gradient') =>
                  setBackground((prev) => ({ ...prev, type: value }))
                }
                className='flex gap-4 mb-4'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='solid' id='solid' />
                  <Label htmlFor='solid' className='text-sm text-gray-700'>
                    Solid
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='gradient' id='gradient' />
                  <Label htmlFor='gradient' className='text-sm text-gray-700'>
                    Gradient
                  </Label>
                </div>
              </RadioGroup>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm text-gray-700 mb-2 block'>
                    {background.type === 'gradient' ? 'Start Color' : 'Color'}
                  </Label>
                  <div className='flex gap-2 items-center'>
                    <div
                      className='w-8 h-8 rounded-full border shadow-inner'
                      style={{ backgroundColor: background.color1 }}
                    />
                    <Input
                      type='color'
                      value={background.color1}
                      onChange={(e) =>
                        setBackground((prev) => ({ ...prev, color1: e.target.value }))
                      }
                      className='h-8 w-full rounded-lg'
                    />
                  </div>
                </div>

                {background.type === 'gradient' && (
                  <>
                    <div>
                      <Label className='text-sm text-gray-700 mb-2 block'>End Color</Label>
                      <div className='flex gap-2 items-center'>
                        <div
                          className='w-8 h-8 rounded-full border shadow-inner'
                          style={{ backgroundColor: background.color2 }}
                        />
                        <Input
                          type='color'
                          value={background.color2}
                          onChange={(e) =>
                            setBackground((prev) => ({ ...prev, color2: e.target.value }))
                          }
                          className='h-8 w-full rounded-lg'
                        />
                      </div>
                    </div>

                    <div className='col-span-2'>
                      <div className='flex items-center justify-between mb-2'>
                        <Label className='text-sm text-gray-700'>Angle</Label>
                        <span className='text-xs text-gray-500'>{background.angle}°</span>
                      </div>
                      <Slider
                        value={[background.angle]}
                        onValueChange={([value]) =>
                          setBackground((prev) => ({ ...prev, angle: value }))
                        }
                        min={0}
                        max={360}
                        step={1}
                        className='w-full'
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Noise Controls */}
        <div className='rounded-2xl bg-white/50 backdrop-blur-xl p-6 border border-gray-200/50 shadow-sm'>
          <h3 className='text-base font-medium text-gray-900 mb-4'>Noise</h3>
          <div className='space-y-6'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <Label className='text-sm text-gray-700'>Strength</Label>
                <span className='text-xs text-gray-500'>
                  {(noiseSettings.opacity * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[noiseSettings.opacity * 100]}
                onValueChange={([value]) =>
                  setNoiseSettings((prev) => ({ ...prev, opacity: value / 100 }))
                }
                min={0}
                max={100}
                step={1}
                className='w-full'
              />
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <Label className='text-sm text-gray-700'>Intensity</Label>
                <span className='text-xs text-gray-500'>
                  {(noiseSettings.intensity * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[noiseSettings.intensity * 100]}
                onValueChange={([value]) =>
                  setNoiseSettings((prev) => ({ ...prev, intensity: value / 100 }))
                }
                min={0}
                max={100}
                step={1}
                className='w-full'
              />
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <Label className='text-sm text-gray-700'>Size</Label>
                <span className='text-xs text-gray-500'>{noiseSettings.size.toFixed(1)}x</span>
              </div>
              <Slider
                value={[noiseSettings.size]}
                onValueChange={([value]) => setNoiseSettings((prev) => ({ ...prev, size: value }))}
                min={1}
                max={4}
                step={0.1}
                className='w-full'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        className='w-full aspect-video rounded-2xl relative overflow-hidden shadow-lg'
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

        <div className='absolute inset-0 pointer-events-none'>
          <NoiseTexture {...noiseSettings} />
        </div>
      </div>
    </div>
  );
}
