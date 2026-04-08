export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0f766e', // Teal 700
                    dark: '#115e59', // Teal 800
                    light: '#2dd4bf', // Teal 400
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    900: '#134e4a',
                },
                secondary: {
                    DEFAULT: '#f59e0b', // Amber 500
                    dark: '#d97706', // Amber 600
                    light: '#fbbf24', // Amber 400
                    50: '#fffbeb',
                    100: '#fef3c7',
                    900: '#78350f',
                },
                accent: {
                    DEFAULT: '#0ea5e9', // Sky 500
                    dark: '#0284c7', // Sky 600
                    light: '#38bdf8', // Sky 400
                },
                dark: {
                    DEFAULT: '#0f172a', // Slate 900
                    lighter: '#1e293b', // Slate 800
                    card: '#1e293b',
                    border: '#334155',
                },
                light: {
                    DEFAULT: '#f8fafc', // Slate 50
                    darker: '#f1f5f9', // Slate 100
                    card: '#ffffff',
                    border: '#e2e8f0',
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['Sora', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'slide-down': 'slideDown 0.6s ease-out forwards',
                'slide-left': 'slideLeft 0.6s ease-out forwards',
                'slide-right': 'slideRight 0.6s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'bounce-slow': 'bounce 3s infinite',
                'spin-slow': 'spin 3s linear infinite',
                'glow': 'glowPulse 3.2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideLeft: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(15, 118, 110, 0.15)' },
                    '50%': { boxShadow: '0 0 0 16px rgba(15, 118, 110, 0)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': "url('/patterns/hero.svg')",
            }
        },
    },
    plugins: [],
}
