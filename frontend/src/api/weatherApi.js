import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Weather endpoints
export const getCurrentWeather = async (location) => {
  const response = await api.get('/api/weather/current', {
    params: { location }
  })
  return response.data
}

export const getWeatherForecast = async (location) => {
  const response = await api.get('/api/weather/forecast', {
    params: { location }
  })
  return response.data
}

// CRUD endpoints
export const createWeatherQuery = async (queryData) => {
  const response = await api.post('/api/queries', queryData)
  return response.data
}

export const getAllWeatherQueries = async () => {
  const response = await api.get('/api/queries')
  return response.data
}

export const getWeatherQuery = async (id) => {
  const response = await api.get(`/api/queries/${id}`)
  return response.data
}

export const updateWeatherQuery = async (id, queryData) => {
  const response = await api.put(`/api/queries/${id}`, queryData)
  return response.data
}

export const deleteWeatherQuery = async (id) => {
  await api.delete(`/api/queries/${id}`)
}

// API integrations
export const getYouTubeVideos = async (location) => {
  const response = await api.get('/api/youtube', {
    params: { location }
  })
  return response.data
}

export const getGoogleMaps = async (location) => {
  const response = await api.get('/api/maps', {
    params: { location }
  })
  return response.data
}

// Export endpoints
export const exportData = async (format) => {
  const response = await api.get(`/api/export/${format}`, {
    responseType: format === 'pdf' ? 'blob' : 'blob', // Use blob for all formats to force download
  })
  return response.data
}

export default api

