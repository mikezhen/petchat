// During dev, Next.js Turbopack handles Tailwind v4 natively — no PostCSS needed.
// During production build (webpack on Linux CI), @tailwindcss/postcss is required.
const config =
  process.env.NODE_ENV === 'development'
    ? { plugins: {} }
    : { plugins: { '@tailwindcss/postcss': {} } };

export default config;
