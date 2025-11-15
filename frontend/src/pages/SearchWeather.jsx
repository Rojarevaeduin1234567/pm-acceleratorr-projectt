import { useState, useEffect } from 'react'
import { getCurrentWeather, getWeatherForecast, getYouTubeVideos, getGoogleMaps } from '../api/weatherApi'
import './SearchWeather.css'

const SearchWeather = () => {
  const [location, setLocation] = useState('')
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [youtubeVideos, setYoutubeVideos] = useState([])
  const [mapsData, setMapsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch current weather
      const current = await getCurrentWeather(location)
      setCurrentWeather(current)

      // Fetch 5-day forecast
      const forecastData = await getWeatherForecast(location)
      setForecast(forecastData)

      // Fetch YouTube videos
      const videos = await getYouTubeVideos(location)
      setYoutubeVideos(videos.videos || [])

      // Fetch Google Maps
      const maps = await getGoogleMaps(location)
      setMapsData(maps)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch weather data')
      setCurrentWeather(null)
      setForecast([])
    } finally {
      setLoading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`${latitude},${longitude}`)
        },
        (err) => {
          setError('Failed to get current location: ' + err.message)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase()
    if (desc.includes('rain')) return '🌧️'
    if (desc.includes('cloud')) return '☁️'
    if (desc.includes('sun') || desc.includes('clear')) return '☀️'
    if (desc.includes('snow')) return '❄️'
    if (desc.includes('storm')) return '⛈️'
    if (desc.includes('wind')) return '💨'
    return '🌤️'
  }

  return (
    <div className="search-weather">
      <div className="search-container">
        <h1>Search Weather</h1>
        <p className="subtitle">Enter any location: Zip Code, Postal Code, GPS Coordinates, Landmark, Town, or City</p>
        
        <div className="search-box">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., New York, 10001, 40.7128,-74.0060)"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="button-group">
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Loading...' : 'Search Weather'}
            </button>
            <button onClick={handleGetCurrentLocation} className="secondary">
              📍 Use Current Location
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {currentWeather && (
        <div className="weather-results">
          <div className="current-weather-card">
            <h2>Current Weather</h2>
            <div className="weather-main">
              <div className="weather-icon">{getWeatherIcon(currentWeather.description)}</div>
              <div className="weather-info">
                <h3>{currentWeather.location}</h3>
                <div className="temperature">{currentWeather.temperature.toFixed(1)}°C</div>
                <div className="description">{currentWeather.description}</div>
                <div className="weather-details">
                  <div className="detail-item">
                    <span className="label">Feels Like:</span>
                    <span>{currentWeather.feels_like.toFixed(1)}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Humidity:</span>
                    <span>{currentWeather.humidity}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Wind Speed:</span>
                    <span>{currentWeather.wind_speed} m/s</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Pressure:</span>
                    <span>{currentWeather.pressure} hPa</span>
                  </div>
                  {currentWeather.visibility && (
                    <div className="detail-item">
                      <span className="label">Visibility:</span>
                      <span>{currentWeather.visibility.toFixed(1)} km</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {forecast.length > 0 && (
            <div className="forecast-section">
              <h2>5-Day Forecast</h2>
              <div className="forecast-grid">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-card">
                    <div className="forecast-date">{day.date}</div>
                    <div className="forecast-icon">{getWeatherIcon(day.description)}</div>
                    <div className="forecast-temp">{day.temperature.toFixed(1)}°C</div>
                    <div className="forecast-desc">{day.description}</div>
                    <div className="forecast-details">
                      <div>Humidity: {day.humidity}%</div>
                      <div>Wind: {day.wind_speed.toFixed(1)} m/s</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mapsData && (
            <div className="maps-section">
              <h2>Location on Map</h2>
              <div className="map-container">
                {mapsData.api_key_configured ? (
                  <iframe
                    src={mapsData.embed_url}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="map-fallback">
                    <p>Google Maps API key not configured. Click below to view on Google Maps:</p>
                    <a 
                      href={mapsData.embed_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      View {mapsData.location} on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {youtubeVideos.length > 0 && (
            <div className="youtube-section">
              <h2>Related YouTube Videos</h2>
              <div className="youtube-grid">
                {youtubeVideos.map((video, index) => (
                  <div key={index} className="youtube-card">
                    {video.videoId ? (
                      <>
                        <img src={video.thumbnail} alt={video.title} />
                        <h4>{video.title}</h4>
                        <p className="video-description">{video.description.substring(0, 100)}...</p>
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="video-link"
                        >
                          Watch on YouTube
                        </a>
                      </>
                    ) : (
                      <div className="youtube-fallback">
                        <p>{video.message || video.search_query}</p>
                        <a 
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.search_query || location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="video-link"
                        >
                          Search YouTube
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchWeather

