import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalizedId = id.replace(/\\/g, '/')

                    if (normalizedId.includes('commonjsHelpers')) return 'vendor-react'
                    if (!normalizedId.includes('node_modules')) return undefined

                    if (normalizedId.includes('@tiptap') || normalizedId.includes('prosemirror') || normalizedId.includes('linkifyjs') || normalizedId.includes('rope-sequence')) return 'vendor-tiptap'
                    if (normalizedId.includes('@clerk')) return 'vendor-clerk'
                    if (normalizedId.includes('/react-dom/') || normalizedId.includes('/react/') || normalizedId.includes('/scheduler/')) return 'vendor-react'
                    if (normalizedId.includes('react-router')) return 'vendor-router'
                    if (normalizedId.includes('lucide-react')) return 'vendor-icons'
                    if (normalizedId.includes('@mux') || normalizedId.includes('mux-player')) return 'vendor-mux'
                    if (normalizedId.includes('@stripe')) return 'vendor-stripe'
                    if (normalizedId.includes('@hello-pangea')) return 'vendor-dnd'
                    if (normalizedId.includes('axios')) return 'vendor-network'

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
                target: 'http://127.0.0.1:3000',
                changeOrigin: true
            }
        }
    }
})
