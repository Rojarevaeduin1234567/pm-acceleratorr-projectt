import { useState, useEffect } from 'react'
import { getCurrentWeather, getWeatherForecast, getGoogleMaps, getAllWeatherQueries, createWeatherQuery, updateWeatherQuery, deleteWeatherQuery, exportData } from '../api/weatherApi'
import YouTubeSection from '../components/YouTubeSection'
import './Dashboard.css'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('weather')
  const [location, setLocation] = useState('')
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [mapsData, setMapsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  
  // CRUD states
  const [queries, setQueries] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    location: '',
    date_from: '',
    date_to: '',
    output_temperature: ''
  })

  useEffect(() => {
    loadQueries()
    loadRecentSearches()
  }, [])

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    setRecentSearches(recent)
  }

  const saveRecentSearch = (loc) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    const updated = [loc, ...recent.filter(l => l !== loc)].slice(0, 5)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    setRecentSearches(updated)
  }

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location')
      return
    }

    setLoading(true)
    setError(null)
    setActiveTab('weather')

    try {
      const current = await getCurrentWeather(location)
      setCurrentWeather(current)
      saveRecentSearch(location)

      const forecastData = await getWeatherForecast(location)
      setForecast(forecastData)

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

  const loadQueries = async () => {
    try {
      const data = await getAllWeatherQueries()
      setQueries(data)
    } catch (err) {
      console.error('Failed to load queries:', err)
    }
  }

  const handleCreateQuery = async (e) => {
    e.preventDefault()
    try {
      await createWeatherQuery({
        location: formData.location,
        date_from: formData.date_from,
        date_to: formData.date_to,
        output_temperature: parseFloat(formData.output_temperature)
      })
      setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' })
      setShowCreateForm(false)
      loadQueries()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create query')
    }
  }

  const handleUpdateQuery = async (id) => {
    try {
      const updateData = {}
      if (formData.location) updateData.location = formData.location
      if (formData.date_from) updateData.date_from = formData.date_from
      if (formData.date_to) updateData.date_to = formData.date_to
      if (formData.output_temperature) updateData.output_temperature = parseFloat(formData.output_temperature)
      await updateWeatherQuery(id, updateData)
      setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' })
      setEditingId(null)
      loadQueries()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update query')
    }
  }

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await deleteWeatherQuery(id)
      loadQueries()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete query')
    }
  }

  const handleExport = async (format) => {
    try {
      setError(null)
      
      // Determine MIME type
      const mimeTypes = {
        'json': 'application/json',
        'csv': 'text/csv',
        'xml': 'application/xml',
        'pdf': 'application/pdf',
        'markdown': 'text/markdown'
      }
      
      const mimeType = mimeTypes[format] || 'application/octet-stream'
      
      // Fetch the data
      const response = await fetch(`http://127.0.0.1:8000/api/export/${format}`)
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }
      
      // Get the blob
      const blob = await response.blob()
      
      // Create a new blob with the correct MIME type
      const typedBlob = new Blob([blob], { type: mimeType })
      
      // Create download link
      const url = window.URL.createObjectURL(typedBlob)
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.download = `weather_queries.${format}`
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
        window.URL.revokeObjectURL(url)
      }, 200)
      
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message || `Failed to export as ${format.toUpperCase()}`)
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
    <div className="dashboard">
      {/* Header with Search */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Weather Dashboard</h1>
          </div>
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search location (City, Zip, Coordinates...)"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button onClick={handleSearch} disabled={loading} className="search-btn">
                {loading ? 'Loading...' : 'Search'}
              </button>
              <button onClick={handleGetCurrentLocation} className="location-btn" title="View on Google Maps">
                🗺️
              </button>
            </div>
            {recentSearches.length > 0 && (
              <div className="recent-searches">
                <span>Recent:</span>
                {recentSearches.map((search, idx) => (
                  <button key={idx} onClick={() => { setLocation(search); handleSearch(); }} className="recent-tag">
                    {search}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          🌡️ Weather
        </button>
        <button 
          className={`tab ${activeTab === 'queries' ? 'active' : ''}`}
          onClick={() => setActiveTab('queries')}
        >
          📊 My Queries
        </button>
        <button 
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          📤 Export
        </button>
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          ℹ️ About
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Tab Content */}
      <main className="dashboard-content">
        {activeTab === 'weather' && (
          <div className="weather-tab">
            {currentWeather ? (
              <>
                <div className="weather-main-card">
                  <div className="weather-header">
                    <div className="weather-icon-large">{getWeatherIcon(currentWeather.description)}</div>
                    <div className="weather-info">
                      <h2>{currentWeather.location}</h2>
                      <div className="temp-large">{currentWeather.temperature.toFixed(1)}°C</div>
                      <div className="description">{currentWeather.description}</div>
                    </div>
                  </div>
                  <div className="weather-stats">
                    <div className="stat-item">
                      <span className="stat-label">Feels Like</span>
                      <span className="stat-value">{currentWeather.feels_like.toFixed(1)}°C</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Humidity</span>
                      <span className="stat-value">{currentWeather.humidity}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Wind Speed</span>
                      <span className="stat-value">{currentWeather.wind_speed} m/s</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Pressure</span>
                      <span className="stat-value">{currentWeather.pressure} hPa</span>
                    </div>
                    {currentWeather.visibility && (
                      <div className="stat-item">
                        <span className="stat-label">Visibility</span>
                        <span className="stat-value">{currentWeather.visibility.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>
                </div>

                {forecast.length > 0 && (
                  <div className="forecast-section">
                    <h3>5-Day Forecast</h3>
                    <div className="forecast-grid">
                      {forecast.map((day, idx) => (
                        <div key={idx} className="forecast-card">
                          <div className="forecast-date">{day.date}</div>
                          <div className="forecast-icon">{getWeatherIcon(day.description)}</div>
                          <div className="forecast-temp">{day.temperature.toFixed(1)}°C</div>
                          <div className="forecast-desc">{day.description}</div>
                          <div className="forecast-details">
                            <div>💧 {day.humidity}%</div>
                            <div>💨 {day.wind_speed.toFixed(1)} m/s</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mapsData && (
                  <div className="maps-section">
                    <h3>📍 Location Map</h3>
                    <div className="map-container">
                      {mapsData.api_key_configured ? (
                        <iframe
                          src={mapsData.embed_url}
                          width="100%"
                          height="400"
                          style={{ border: 0, borderRadius: '12px' }}
                          allowFullScreen
                          loading="lazy"
                        />
                      ) : (
                        <div className="map-fallback">
                          <a href={mapsData.embed_url} target="_blank" rel="noopener noreferrer" className="map-link-btn">
                            View {mapsData.location} on Google Maps →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentWeather && (
                  <YouTubeSection location={location} />
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🌤️</div>
                <h3>Search for Weather</h3>
                <p>Enter a location above to get started</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="queries-tab">
            <div className="queries-header">
              <h2>Weather Query Management</h2>
              <button onClick={() => { setShowCreateForm(!showCreateForm); setEditingId(null); setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' }); }} className="btn-primary">
                {showCreateForm ? '✕ Cancel' : '+ New Query'}
              </button>
            </div>

            {(showCreateForm || editingId) && (
              <div className="form-card">
                <h3>{editingId ? 'Edit Query' : 'Create New Query'}</h3>
                <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdateQuery(editingId); } : handleCreateQuery}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Location *</label>
                      <input type="text" name="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required={!editingId} />
                    </div>
                    <div className="form-group">
                      <label>Output Temperature *</label>
                      <input type="number" step="0.1" name="output_temperature" value={formData.output_temperature} onChange={(e) => setFormData({...formData, output_temperature: e.target.value})} required={!editingId} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date From *</label>
                      <input type="date" name="date_from" value={formData.date_from} onChange={(e) => setFormData({...formData, date_from: e.target.value})} required={!editingId} />
                    </div>
                    <div className="form-group">
                      <label>Date To *</label>
                      <input type="date" name="date_to" value={formData.date_to} onChange={(e) => setFormData({...formData, date_to: e.target.value})} required={!editingId} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' }); }} className="btn-secondary">Cancel</button>}
                  </div>
                </form>
              </div>
            )}

            <div className="queries-table-container">
              <div className="table-header">
                <span>Total Queries: {queries.length}</span>
                <button onClick={loadQueries} className="btn-refresh">🔄 Refresh</button>
              </div>
              {queries.length === 0 ? (
                <div className="empty-state">
                  <p>No queries yet. Create your first one!</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Location</th>
                        <th>Date From</th>
                        <th>Date To</th>
                        <th>Temperature</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.map((query) => (
                        <tr key={query.id}>
                          <td>{query.id}</td>
                          <td>{query.location}</td>
                          <td>{query.date_from}</td>
                          <td>{query.date_to}</td>
                          <td>{query.output_temperature}°C</td>
                          <td>{new Date(query.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => { setEditingId(query.id); setFormData({ location: query.location, date_from: query.date_from, date_to: query.date_to, output_temperature: query.output_temperature.toString() }); setShowCreateForm(false); }} className="btn-edit">✏️</button>
                              <button onClick={() => handleDeleteQuery(query.id)} className="btn-delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="export-tab">
            <h2>Export Weather Data</h2>
            <p className="export-description">Export all your weather queries in various formats</p>
            <div className="export-grid">
              {['json', 'csv', 'xml', 'pdf', 'markdown'].map((format) => (
                <div key={format} className="export-card">
                  <div className="export-icon">
                    {format === 'json' && '📄'}
                    {format === 'csv' && '📊'}
                    {format === 'xml' && '📋'}
                    {format === 'pdf' && '📑'}
                    {format === 'markdown' && '📝'}
                  </div>
                  <h3>{format.toUpperCase()}</h3>
                  <button onClick={() => handleExport(format)} className="export-btn">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-tab">
            <div className="about-card">
              <h2>About Weather Dashboard</h2>
              <p>Professional weather dashboard built for PM Accelerator Tech Assessment 1 & 2</p>
              <div className="about-features">
                <div className="feature-box">
                  <h3>🌡️ Real-time Weather</h3>
                  <p>Get current weather and 5-day forecasts for any location</p>
                </div>
                <div className="feature-box">
                  <h3>📊 Query Management</h3>
                  <p>Store and manage your weather queries with full CRUD operations</p>
                </div>
                <div className="feature-box">
                  <h3>📤 Data Export</h3>
                  <p>Export your data in JSON, CSV, XML, PDF, and Markdown formats</p>
                </div>
                <div className="feature-box">
                  <h3>🗺️ Location Services</h3>
                  <p>Maps integration and location-based features</p>
                </div>
              </div>
              <div className="about-tech">
                <h3>Built With</h3>
                <div className="tech-tags">
                  <span>React</span>
                  <span>FastAPI</span>
                  <span>SQLite</span>
                  <span>OpenWeatherMap</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard

