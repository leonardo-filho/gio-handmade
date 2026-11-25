import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem o selo "N" do modo de desenvolvimento: a apresentação roda no next dev
  // e o selo cobria parte da página no celular.
  devIndicators: false,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
