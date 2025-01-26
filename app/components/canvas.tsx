'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCw } from 'lucide-react';
import type { BlobConfig } from './blob-editor';
import { Button } from './ui/button';

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
    <div className='w-full aspect-video bg-gray-50 rounded-lg relative overflow-hidden'>
      <svg ref={svgRef} className='w-full h-full' viewBox='0 0 1000 600'>
        {blobsWithPosition.map((blob, index) => (
          <motion.g key={index} onClick={() => handleBlobClick(index)}>
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
              dragConstraints={svgRef}
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
          }}
        >
          <Button size='icon' variant='outline' onClick={() => handleRotate(selectedBlobIndex, -1)}>
            <RotateCw className='w-4 h-4' />
          </Button>
          <Button size='icon' variant='outline' onClick={() => handleRotate(selectedBlobIndex, 1)}>
            <RotateCw className='w-4 h-4 scale-x-[-1]' />
          </Button>
          <Button size='icon' variant='destructive' onClick={() => handleDelete(selectedBlobIndex)}>
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
