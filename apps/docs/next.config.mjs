// A static site: `next build` writes plain HTML to out/, which any static host can serve.
export default {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The showcase demos are reused as the docs' live examples; they ship as JSX source
  transpilePackages: ["showcase", "@truvar-ai/design-system"],
  // One 404 page for the whole site (the two languages have separate root layouts)
  experimental: { globalNotFound: true },
};
