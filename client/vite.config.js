import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined

                    if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('linkifyjs') || id.includes('rope-sequence')) return 'vendor-tiptap'
                    if (id.includes('@clerk')) return 'vendor-clerk'
                    if (id.includes('react-dom') || id.includes('/react/') || id.includes('\\react\\') || id.includes('scheduler')) return 'vendor-react'
                    if (id.includes('react-router')) return 'vendor-router'
                    if (id.includes('lucide-react')) return 'vendor-icons'
                    if (id.includes('@mux') || id.includes('mux-player')) return 'vendor-mux'
                    if (id.includes('@stripe')) return 'vendor-stripe'
                    if (id.includes('@hello-pangea')) return 'vendor-dnd'
                    if (id.includes('axios')) return 'vendor-network'

                    return 'vendor'
                }
            }
        }
    },
    server: {
        port: 5173,
        allowedHosts: ["pagodalike-dannielle-stageably.ngrok-free.dev"],
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
