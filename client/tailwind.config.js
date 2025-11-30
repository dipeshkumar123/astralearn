export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    dark: '#4f46e5', // Indigo 600
                    light: '#818cf8', // Indigo 400
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    900: '#312e81',
                },
                secondary: {
                    DEFAULT: '#ec4899', // Pink 500
                    dark: '#db2777', // Pink 600
                    light: '#f472b6', // Pink 400
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    900: '#831843',
                },
                accent: {
                    DEFAULT: '#14b8a6', // Teal 500
                    dark: '#0d9488', // Teal 600
                    light: '#2dd4bf', // Teal 400
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
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
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
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': "url('/patterns/hero.svg')",
            }
        },
    },
    plugins: [],
}
