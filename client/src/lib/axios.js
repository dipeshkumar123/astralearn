import axios from 'axios'

// Set base URL for all axios requests
// Prefer same-origin so Vite's dev proxy can handle `/api` without cross-origin issues.
// Override with VITE_API_URL when deploying or when you want to hit a separate API host.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''
axios.defaults.timeout = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000)

// Add request interceptor to include auth token from Clerk if available
axios.interceptors.request.use(
  (config) => {
    // Headers will be added by individual components using useAuth
    // Log request for debugging
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const responseError = error?.response?.data?.error
    const fallbackMessage = error.code === 'ECONNABORTED'
      ? 'Request timed out. Please try again.'
      : 'Something went wrong. Please try again.'
    error.userMessage = responseError || fallbackMessage

    if (error.response) {
      // Server responded with error status
      console.error('[API Error]', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
    } else if (error.request) {
      // Request made but no response
      console.error('[Network Error]', error.message)
    } else {
      // Something else happened
      console.error('[Error]', error.message)
    }
    return Promise.reject(error)
  }
)

export default axios
