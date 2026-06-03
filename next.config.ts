import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["leaflet", "react-leaflet", "@turf/turf"],
};

export default nextConfig;
