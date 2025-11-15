import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './YouTubeSection.css'

function YouTubeSection({ location }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!location) {
      setVideos([])
      return
    }

    setLoading(true)
    axios
      .get(`http://127.0.0.1:8000/api/youtube?location=${encodeURIComponent(location)}`)
      .then((res) => {
        setVideos(res.data.videos || [])
      })
      .catch(() => {
        setVideos([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [location])

  if (!location) {
    return (
      <div className="youtube-section">
        <h3>📺 Related Videos</h3>
        <p className="youtube-message">Search a city to see weather videos.</p>
      </div>
    )
  }

  return (
    <div className="youtube-section">
      <h3>📺 Related Videos</h3>
      
      {loading && (
        <p className="youtube-message">Loading videos...</p>
      )}

      {!loading && videos.length === 0 && (
        <div className="youtube-card">
          <p className="youtube-message">No videos found. Try another location.</p>
          <a
            href={`https://www.youtube.com/results?search_query=weather+${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="youtube-search-link"
          >
            🔍 Search YouTube for weather videos →
          </a>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="youtube-grid">
          {videos.map((v, index) => {
            // Handle both backend response formats
            const videoId = v.videoId || v.id?.videoId
            const title = v.title || v.snippet?.title
            const thumbnail = v.thumbnail || v.snippet?.thumbnails?.default?.url
            
            if (!videoId) return null

            return (
              <div key={videoId || index} className="youtube-card">
                <div className="youtube-video-container">
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    allowFullScreen
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                </div>
                <div className="video-info">
                  <h4>{title}</h4>
                  {v.url && (
                    <a 
                      href={v.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="video-link"
                    >
                      Watch on YouTube →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default YouTubeSection

