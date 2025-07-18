import {NextConfig} from 'next';

const nextConfig: NextConfig = {  
  images: {
    domains: ['image.tmdb.org'],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*/',
      },
    ];
  },
};

export default nextConfig;
