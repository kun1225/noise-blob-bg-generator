'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Canvas } from '@/components/canvas';
import { BlobEditor, type BlobConfig } from '@/components/blob-editor';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [blobs, setBlobs] = useState<BlobConfig[]>([]);

  const handleAddBlob = (config: BlobConfig) => {
    setBlobs((prev) => [...prev, config]);
    setIsOpen(false);
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Blob Canvas</h1>
        <Button onClick={() => setIsOpen(true)}>Add Blob</Button>
      </div>

      <Canvas blobs={blobs} />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-w-4xl'>
          <BlobEditor onAdd={handleAddBlob} onCancel={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
