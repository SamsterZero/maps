import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Atlasify - Interactive Map',
    short_name: 'Atlasify',
    description: 'A gorgeous, high-performance map dashboard built with MapLibre GL and Next.js.',
    start_url: '.',
    display: 'standalone',
    background_color: '#09090b', // zinc-950
    theme_color: '#7c3aed', // violet-600
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
