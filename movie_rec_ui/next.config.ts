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
        // destination: `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/api/:path*/`, // For production
        destination: `${process.env.NEXT_PUBLIC_DJANGO_API_ROUTE_TEST}/api/:path*/` // For testing
      },
    ];
  },
};

export default nextConfig;
