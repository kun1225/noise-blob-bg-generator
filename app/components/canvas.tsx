'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCw } from 'lucide-react';
import type { BlobConfig } from './blob-editor';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface BlobWithPosition extends BlobConfig {
  x: number;
  y: number;
  scale: number;
  rotation: number;
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

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <span className='text-sm font-medium'>Blur Amount</span>
        <Slider
          value={[blurAmount]}
          onValueChange={([value]) => setBlurAmount(value)}
          min={0}
          max={20}
          step={0.5}
          className='w-48'
        />
      </div>

      <div className='w-full aspect-video bg-gray-50 rounded-lg relative overflow-hidden'>
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
                dragConstraints={getDragConstraints(index)}
              />
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
