import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silences the workspace-root inference warning caused by the mobile
  // app's own package-lock.json one directory up.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
