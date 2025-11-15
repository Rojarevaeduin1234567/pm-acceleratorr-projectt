# Weather App - PM Accelerator Project

A full-stack weather application built for PM Accelerator Tech Assessment 1 & 2, featuring real-time weather data, CRUD operations, API integrations, and data export capabilities.

## 🌟 Features

### Tech Assessment 1 (Basic Weather App)
- ✅ Search weather by any location type (Zip Code, Postal Code, GPS Coordinates, Landmark, Town, City)
- ✅ Real-time weather data from OpenWeatherMap API
- ✅ Display current weather (temperature, humidity, description, wind speed, pressure, visibility)
- ✅ 5-day weather forecast
- ✅ Auto-detect current location using GPS
- ✅ Weather icons and visual representation

### Tech Assessment 2 (Advanced Weather App)
- ✅ FastAPI backend with SQLite database
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Data validation for location and date ranges
- ✅ **YouTube API Integration:**
  - Fetches up to 5 weather-related videos per location
  - Embeds videos directly in the dashboard with iframe players
  - Shows video thumbnails, titles, and direct links
  - API key pre-configured in the code (`AIzaSyDHzxcoQuwGYC3ZxgbWeh9gE8OILVo-V_I`)
  - Searches for "weather {location}" queries automatically
- ✅ **Google Maps Integration:**
  - Interactive map display for searched locations
  - Embedded maps or direct Google Maps links
  - Location visualization with coordinates
  - 🗺️ Button in search bar for quick map access
- ✅ Data export in multiple formats (JSON, CSV, XML, PDF, Markdown)

## 📁 Project Structure

```
weather-app/
├── backend/
│   ├── main.py              # FastAPI application with all endpoints
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic schemas for validation
│   ├── database.py          # Database configuration
│   ├── crud.py              # CRUD operations
│   ├── weather_service.py   # OpenWeatherMap API integration
│   ├── export_service.py    # Data export functionality
│   ├── requirements.txt     # Python dependencies
│   └── weather_app.db       # SQLite database (created automatically)
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   └── YouTubeSection.jsx  # YouTube video integration component
    │   ├── pages/           # Page components
    │   │   ├── Dashboard.jsx  # Main dashboard with all features
    │   ├── api/             # API client
    │   │   └── weatherApi.js
    │   ├── App.jsx          # Main app component
    │   ├── App.css
    │   ├── main.jsx         # Entry point
    │   └── index.css       # Global styles
    ├── package.json         # Node dependencies
    ├── vite.config.js       # Vite configuration
    └── index.html
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

## ⚡ Quick Start Commands

### Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run backend server
uvicorn main:app --reload
```

**Backend will run on:** `http://localhost:8000`

### Frontend (Terminal 2 - Open a new terminal)

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Run frontend server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

---

### Detailed Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **API Keys Setup:**
   
   **✅ OpenWeatherMap API (Already Configured):**
   - The OpenWeatherMap API key is already set in the code
   - **You don't need to get this API key** - it's ready to use!
   
   **⚠️ Optional API Keys (Only if you want full features):**
   
   The app works without these, but some features will be limited:
   
   - **YouTube API Key** (Optional but Recommended): 
     - **Already configured in the code:** `AIzaSyDHzxcoQuwGYC3ZxgbWeh9gE8OILVo-V_I`
     - Fetches and displays up to 5 weather-related YouTube videos for each location
     - Videos are embedded directly in the dashboard
     - If API key is not available, shows a direct search link to YouTube
     - Get your own free key: https://console.cloud.google.com/apis/library/youtube.googleapis.com
   
   - **Google Maps API Key** (Optional): 
     - Only needed for embedded interactive maps
     - Without it: Maps will show a direct link to Google Maps instead of embedded map
     - Get it free: https://console.cloud.google.com/apis/library/maps-embed-backend.googleapis.com
   
   If you want to use the optional APIs, set environment variables:
   ```bash
   # Windows
   set YOUTUBE_API_KEY=your_youtube_api_key_here
   set GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

   # macOS/Linux
   export YOUTUBE_API_KEY=your_youtube_api_key_here
   export GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```
   
   **Summary:** You can run the app immediately without any additional API keys! The weather features work perfectly. YouTube and Google Maps are nice-to-have extras.

5. **Run the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`
   API documentation (Swagger UI) will be available at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## 📖 Usage

### Search Weather
1. Navigate to the "Weather" tab (default)
2. Enter any location in the search bar (e.g., "New York", "10001", "40.7128,-74.0060")
3. Click "Search" button or press Enter
4. Use the 🗺️ button to get your current location using GPS
5. View current weather and 5-day forecast
6. **YouTube Videos:** Automatically fetches and displays up to 5 weather-related YouTube videos embedded in the page
7. **Google Maps:** View the location on an interactive map (or direct link if API key not configured)

### My Queries (CRUD Operations)
1. Navigate to the "My Queries" tab
2. **Interface Features:**
   - Header shows "Weather Query Management" with a "+ New Query" button
   - Table displays "Total Queries" count with a refresh button
   - Empty state message: "No queries yet. Create your first one!" when no data exists
3. **Create:** Click "+ New Query" button and fill in the form
   - Location (required)
   - Date From (required, format: YYYY-MM-DD)
   - Date To (required, must be after Date From)
   - Output Temperature (required, in Celsius)
4. **Read:** All queries are displayed in a professional table with columns:
   - ID, Location, Date From, Date To, Temperature, Created At, Actions
5. **Update:** Click "✏️ Edit" button on any query, modify fields, and click "Update"
6. **Delete:** Click "🗑️ Delete" button on any query (with confirmation dialog)

### Export Data
1. Navigate to the "Export" tab
2. **Interface Features:**
   - Section title: "Export Weather Data"
   - Subtitle: "Export all your weather queries in various formats"
   - Five export format cards displayed in a grid:
     - **JSON** - Document icon, download button
     - **CSV** - Bar chart icon, download button
     - **XML** - Clipboard icon, download button
     - **PDF** - Document with bookmark icon, download button
     - **Markdown** - Document with pencil icon, download button
3. Click any "Download" button to export data in that format
4. Files are automatically downloaded to your computer

### About Section
1. Navigate to the "About" tab
2. **Interface Features:**
   - Title: "About Weather Dashboard"
   - Description: "Professional weather dashboard built for PM Accelerator Tech Assessment 1 & 2"
   - Four feature cards displayed:
     - **🌡️ Real-time Weather** - Get current weather and 5-day forecasts
     - **📊 Query Management** - Store and manage weather queries with CRUD operations
     - **📤 Data Export** - Export data in multiple formats (JSON, CSV, XML, PDF, Markdown)
     - **🗺️ Location Services** - Maps integration and location-based features
   - **Built With** section showing technology tags:
     - React, FastAPI, SQLite, OpenWeatherMap

## 🔌 API Endpoints

### Weather Endpoints
- `GET /api/weather/current?location={location}` - Get current weather
- `GET /api/weather/forecast?location={location}` - Get 5-day forecast

### CRUD Endpoints
- `POST /api/queries` - Create a weather query
- `GET /api/queries` - Get all weather queries
- `GET /api/queries/{id}` - Get a specific query
- `PUT /api/queries/{id}` - Update a query
- `DELETE /api/queries/{id}` - Delete a query

### Integration Endpoints
- `GET /api/youtube?location={location}` - Get YouTube videos
  - Returns up to 5 weather-related videos for the location
  - Videos are embedded with thumbnails, titles, and direct links
  - Uses YouTube Data API v3
  - API key: Already configured in the code
  
- `GET /api/maps?location={location}` - Get Google Maps embed
  - Returns Google Maps embed URL for the location
  - Can be embedded as an iframe or opened as a direct link
  - Requires Google Maps API key for embedded maps

### Export Endpoints
- `GET /api/export/json` - Export as JSON
- `GET /api/export/csv` - Export as CSV
- `GET /api/export/xml` - Export as XML
- `GET /api/export/pdf` - Export as PDF
- `GET /api/export/markdown` - Export as Markdown

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### APIs
- **OpenWeatherMap API** - Weather data
  - Current weather conditions
  - 5-day weather forecast
  - API key: Already configured in the code
  
- **YouTube Data API v3** - Video search and embedding
  - Fetches weather-related videos for locations
  - Embeds videos directly in the dashboard
  - API key: Already configured (`AIzaSyDHzxcoQuwGYC3ZxgbWeh9gE8OILVo-V_I`)
  - Searches for "weather {location}" queries
  
- **Google Maps API** - Map embeds
  - Interactive map display for searched locations
  - Embed or direct link options
  - Optional API key for embedded maps

## 🖥️ User Interface Features

### Dashboard Layout
- **Header Section:**
  - Application title: "Weather Dashboard"
  - Prominent search bar with location input
  - Search button and Google Maps button (🗺️)
  - Recent searches displayed as clickable tags below search bar

- **Navigation Tabs:**
  - **🌡️ Weather** - Main weather search and display
  - **📊 My Queries** - CRUD operations for weather queries
  - **📤 Export** - Data export in multiple formats
  - **ℹ️ About** - Project information and features

- **Responsive Design:**
  - Works seamlessly on desktop, tablet, and mobile devices
  - Professional color scheme with light gray background
  - Modern card-based layout with shadows and rounded corners
  - Smooth transitions and hover effects

### Visual Elements
- **Weather Display:**
  - Large weather icons (☀️, ☁️, 🌧️, etc.)
  - Temperature displayed prominently
  - Weather statistics in organized cards
  - 5-day forecast in gradient cards

- **YouTube Integration:**
  - Embedded video players
  - Video thumbnails and titles
  - Direct links to watch on YouTube

- **Google Maps:**
  - Interactive embedded maps (if API key configured)
  - Direct links to Google Maps (fallback)

## 📝 Notes

- The SQLite database (`weather_app.db`) is created automatically in the backend directory on first run
- All date validations ensure `date_to` is after `date_from`
- Location validation supports fuzzy matching through OpenWeatherMap API
- The app includes error handling and user-friendly error messages
- CORS is configured to allow frontend-backend communication

## 👤 Developer

**Name:** Roja  
**Program:** PM Accelerator  
**Project:** Weather App - Tech Assessment 1 & 2

## 📄 License

This project is created for educational purposes as part of the PM Accelerator program.

