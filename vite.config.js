import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Note: project frontend files live in `fontend/` but static assets are in
// the repository `public/` directory. When `root` is set to `fontend`, Vite's
// `publicDir` resolves relative to that root, so we point it one level up.
export default defineConfig({
  // set project root to the `fontend` folder which contains the React app
  root: 'fontend',
  // serve static files from repository-level public/ (../public from fontend)
  publicDir: '../public',
  plugins: [react(), tailwindcss],
  // dev server proxy so frontend can call /api and reach backend
  server: {
    port: 5173,
    proxy: {
      '/api': {
  // default backend port: 3002. You can override with BACKEND_URL env var.
  target: process.env.BACKEND_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
