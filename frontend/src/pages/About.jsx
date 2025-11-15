import './About.css'

const About = () => {
  return (
    <div className="about">
      <div className="about-card">
        <h1>About Weather App</h1>
        
        <div className="about-section">
          <h2>Project Information</h2>
          <p>
            This is a full-stack Weather Application built as part of the PM Accelerator program.
            The application demonstrates both basic and advanced features including real-time weather
            data, CRUD operations, API integrations, and data export capabilities.
          </p>
        </div>

        <div className="about-section">
          <h2>Developer</h2>
          <p>
            <strong>Name:</strong> [Your Name]<br />
            <strong>Program:</strong> PM Accelerator<br />
            <strong>Project:</strong> Weather App - Tech Assessment 1 & 2
          </p>
        </div>

        <div className="about-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>🌤️ Weather Search</h3>
              <p>Search weather by location (Zip, Postal, GPS, Landmark, Town, City)</p>
            </div>
            <div className="feature-item">
              <h3>📅 5-Day Forecast</h3>
              <p>View detailed 5-day weather forecast</p>
            </div>
            <div className="feature-item">
              <h3>📍 Location Services</h3>
              <p>Auto-detect current location using GPS</p>
            </div>
            <div className="feature-item">
              <h3>🗄️ CRUD Operations</h3>
              <p>Create, Read, Update, and Delete weather queries</p>
            </div>
            <div className="feature-item">
              <h3>📺 YouTube Integration</h3>
              <p>View related YouTube videos for locations</p>
            </div>
            <div className="feature-item">
              <h3>🗺️ Google Maps</h3>
              <p>Interactive maps for searched locations</p>
            </div>
            <div className="feature-item">
              <h3>📤 Data Export</h3>
              <p>Export data in JSON, CSV, XML, PDF, and Markdown formats</p>
            </div>
            <div className="feature-item">
              <h3>💾 Database Storage</h3>
              <p>SQLite database for persistent data storage</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-category">
              <h3>Frontend</h3>
              <ul>
                <li>React 18</li>
                <li>Vite</li>
                <li>React Router</li>
                <li>Axios</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Backend</h3>
              <ul>
                <li>FastAPI</li>
                <li>SQLAlchemy</li>
                <li>SQLite</li>
                <li>Pydantic</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>APIs</h3>
              <ul>
                <li>OpenWeatherMap API</li>
                <li>YouTube Data API</li>
                <li>Google Maps API</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>PM Accelerator</h2>
          <p>
            This project was developed as part of the PM Accelerator program, demonstrating
            proficiency in full-stack development, API integration, database management, and
            modern web development practices.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About

