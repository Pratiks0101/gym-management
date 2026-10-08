import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.3:3000', '192.168.1.3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zghirooyegojovuddbmq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**'
      },
    ],
  },
};

export default nextConfig;
