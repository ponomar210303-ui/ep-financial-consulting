/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Phase 1: scaffolding only. Pages will be migrated in Phase 2.
  // Vite continues to serve the live site via index.html + src/main.jsx
  // until Phase 4 removes the Vite infra.
};

export default nextConfig;
