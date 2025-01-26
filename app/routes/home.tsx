import type { Route } from './+types/home';
import { PageHome } from '@/pages/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Noise Blob Background Generator' },
    { name: 'description', content: 'Noise Blob Background Generator' },
  ];
}

export default function Home() {
  return <PageHome />;
}
