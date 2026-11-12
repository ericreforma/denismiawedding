/**
 * The site is served from its own domain, denisandmiaarrforever.site, so it
 * lives at the root and needs no path prefix.
 *
 * It began as a GitHub Pages project site, where everything sat under
 * `ericreforma.github.io/denismiawedding` and this had to be "/denismiawedding".
 * The custom domain is still published by Pages out of the same repo — the
 * domain just points at it — and `public/CNAME` is what tells Pages so.
 * Set this back to "/denismiawedding" if the domain is ever dropped.
 */
const basePath = "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
  reactStrictMode: true,
  /**
   * `basePath` prefixes the URLs Next generates itself — the JS bundle, the
   * CSS, the fonts — but not the plain `<img src="/…">` paths written by hand
   * in `src/data/wedding.ts`. Handing it to the app lets those prefix
   * themselves from this same single source, so there is only ever one place
   * to change. Empty now, but the plumbing stays: it costs nothing and it is
   * what makes moving the site a one-line change.
   */
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
