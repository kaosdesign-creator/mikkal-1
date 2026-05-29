/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net'],
  },
  serverExternalPackages: ['next-auth'],
}
module.exports = nextConfig
