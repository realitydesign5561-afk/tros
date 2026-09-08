import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest { return { name: 'TROS — Reality Operation System', short_name: 'TROS', description: 'The Reality Operation System', start_url: '/', display: 'standalone', background_color: '#09090b', theme_color: '#09090b', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }] } }
