import axios from 'axios'

// Set base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
