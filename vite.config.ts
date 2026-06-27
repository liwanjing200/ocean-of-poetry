import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from the root of the custom domain (shihai.snowqin.com), so base is
// '/'. For a project-page URL (github.io/<repo>/) set BASE_PATH=/<repo>/.
const base = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
