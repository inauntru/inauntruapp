/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Interzice încărcarea site-ului în iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Browserul nu ghicește tipul fișierelor (MIME sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nu trimite URL-ul complet către alte site-uri
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Forțează HTTPS timp de 2 ani, inclusiv subdomenii
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // Blochează accesul la senzori/API-uri nefolosite
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
