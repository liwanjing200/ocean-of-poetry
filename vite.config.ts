import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// On GitHub Pages the site is served from /<repo>/, so use a sub-path base in
// production. Override with BASE_PATH if the repo name differs.
const base = process.env.BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/ocean-of-poetry/' : '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
