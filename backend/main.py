from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from database import Base, engine, get_db
from models import WeatherQuery
from schemas import (
    WeatherQueryCreate, 
    WeatherQueryUpdate, 
    WeatherQueryResponse,
    WeatherCurrent,
    WeatherForecast
)
from crud import (
    create_weather_query,
    get_weather_query,
    get_all_weather_queries,
    update_weather_query,
    delete_weather_query
)
from weather_service import (
    get_weather_by_location,
    get_5day_forecast,
    parse_current_weather,
    parse_forecast
)
from export_service import (
    export_to_json,
    export_to_csv,
    export_to_xml,
    export_to_pdf,
    export_to_markdown
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Weather App API",
    description="Full-stack Weather App with CRUD operations and API integrations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# YouTube API Key (optional - can use without key for basic searches)
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "AIzaSyDHzxcoQuwGYC3ZxgbWeh9gE8OILVo-V_I")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

@app.get("/")
def root():
    return {"message": "Weather App API", "version": "1.0.0"}

# ========== WEATHER ENDPOINTS ==========

@app.get("/api/weather/current", response_model=WeatherCurrent)
def get_current_weather(location: str = Query(..., description="Location (Zip, Postal, GPS, Landmark, Town, City)")):
    """Get current weather for a location"""
    weather_data = get_weather_by_location(location)
    if not weather_data:
        raise HTTPException(status_code=404, detail="Location not found or invalid")
    
    try:
        return parse_current_weather(weather_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing weather data: {str(e)}")

@app.get("/api/weather/forecast", response_model=List[WeatherForecast])
def get_weather_forecast(location: str = Query(..., description="Location for 5-day forecast")):
    """Get 5-day weather forecast for a location"""
    forecast_data = get_5day_forecast(location)
    if not forecast_data:
        raise HTTPException(status_code=404, detail="Location not found or invalid")
    
    try:
        return parse_forecast(forecast_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing forecast data: {str(e)}")

# ========== CRUD ENDPOINTS ==========

@app.post("/api/queries", response_model=WeatherQueryResponse, status_code=201)
def create_query(weather_query: WeatherQueryCreate, db: Session = Depends(get_db)):
    """Create a new weather query record"""
    return create_weather_query(db, weather_query)

@app.get("/api/queries", response_model=List[WeatherQueryResponse])
def read_queries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Read all weather query records"""
    queries = get_all_weather_queries(db, skip=skip, limit=limit)
    return queries

@app.get("/api/queries/{query_id}", response_model=WeatherQueryResponse)
def read_query(query_id: int, db: Session = Depends(get_db)):
    """Read a specific weather query record"""
    query = get_weather_query(db, query_id)
    if not query:
        raise HTTPException(status_code=404, detail="Weather query not found")
    return query

@app.put("/api/queries/{query_id}", response_model=WeatherQueryResponse)
def update_query(query_id: int, weather_query: WeatherQueryUpdate, db: Session = Depends(get_db)):
    """Update a weather query record"""
    updated_query = update_weather_query(db, query_id, weather_query)
    if not updated_query:
        raise HTTPException(status_code=404, detail="Weather query not found")
    return updated_query

@app.delete("/api/queries/{query_id}", status_code=204)
def delete_query(query_id: int, db: Session = Depends(get_db)):
    """Delete a weather query record"""
    success = delete_weather_query(db, query_id)
    if not success:
        raise HTTPException(status_code=404, detail="Weather query not found")
    return None

# ========== API INTEGRATIONS ==========

@app.get("/api/youtube")
def get_youtube_videos(location: str = Query(..., description="Location to search YouTube videos for")):
    """Get YouTube videos related to a location"""
    import requests
    
    try:
        # Using YouTube Data API v3
        if YOUTUBE_API_KEY:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": f"weather {location}",
                "type": "video",
                "maxResults": 5,
                "key": YOUTUBE_API_KEY
            }
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                videos = []
                for item in data.get('items', []):
                    videos.append({
                        "title": item['snippet']['title'],
                        "description": item['snippet']['description'],
                        "thumbnail": item['snippet']['thumbnails']['default']['url'],
                        "videoId": item['id']['videoId'],
                        "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                    })
                return {"videos": videos}
        
        # Fallback: return embed URL structure
        return {
            "videos": [{
                "message": "YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable.",
                "search_query": f"weather {location}"
            }]
        }
    except Exception as e:
        return {"error": str(e), "videos": []}

@app.get("/api/maps")
def get_google_maps(location: str = Query(..., description="Location for Google Maps embed")):
    """Get Google Maps embed information for a location"""
    return {
        "location": location,
        "embed_url": f"https://www.google.com/maps/embed/v1/place?key={GOOGLE_MAPS_API_KEY}&q={location}" if GOOGLE_MAPS_API_KEY else f"https://www.google.com/maps/search/?api=1&query={location}",
        "api_key_configured": bool(GOOGLE_MAPS_API_KEY)
    }

# ========== EXPORT ENDPOINTS ==========

@app.get("/api/export/json")
def export_json(db: Session = Depends(get_db)):
    """Export all weather queries as JSON"""
    queries = get_all_weather_queries(db)
    data = [{
        "id": q.id,
        "location": q.location,
        "date_from": q.date_from,
        "date_to": q.date_to,
        "output_temperature": q.output_temperature,
        "created_at": str(q.created_at),
        "updated_at": str(q.updated_at) if q.updated_at else None
    } for q in queries]
    
    json_data = export_to_json(data)
    return Response(content=json_data, media_type="application/json")

@app.get("/api/export/csv")
def export_csv(db: Session = Depends(get_db)):
    """Export all weather queries as CSV"""
    queries = get_all_weather_queries(db)
    data = [{
        "id": q.id,
        "location": q.location,
        "date_from": q.date_from,
        "date_to": q.date_to,
        "output_temperature": q.output_temperature,
        "created_at": str(q.created_at),
        "updated_at": str(q.updated_at) if q.updated_at else None
    } for q in queries]
    
    csv_data = export_to_csv(data)
    return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=weather_queries.csv"})

@app.get("/api/export/xml")
def export_xml(db: Session = Depends(get_db)):
    """Export all weather queries as XML"""
    queries = get_all_weather_queries(db)
    data = [{
        "id": q.id,
        "location": q.location,
        "date_from": q.date_from,
        "date_to": q.date_to,
        "output_temperature": q.output_temperature,
        "created_at": str(q.created_at),
        "updated_at": str(q.updated_at) if q.updated_at else None
    } for q in queries]
    
    xml_data = export_to_xml(data)
    return Response(content=xml_data, media_type="application/xml", headers={"Content-Disposition": "attachment; filename=weather_queries.xml"})

@app.get("/api/export/pdf")
def export_pdf(db: Session = Depends(get_db)):
    """Export all weather queries as PDF"""
    queries = get_all_weather_queries(db)
    data = [{
        "id": q.id,
        "location": q.location,
        "date_from": q.date_from,
        "date_to": q.date_to,
        "output_temperature": q.output_temperature,
        "created_at": str(q.created_at),
        "updated_at": str(q.updated_at) if q.updated_at else None
    } for q in queries]
    
    pdf_buffer = export_to_pdf(data)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=weather_queries.pdf"}
    )

@app.get("/api/export/markdown")
def export_markdown(db: Session = Depends(get_db)):
    """Export all weather queries as Markdown"""
    queries = get_all_weather_queries(db)
    data = [{
        "id": q.id,
        "location": q.location,
        "date_from": q.date_from,
        "date_to": q.date_to,
        "output_temperature": q.output_temperature,
        "created_at": str(q.created_at),
        "updated_at": str(q.updated_at) if q.updated_at else None
    } for q in queries]
    
    md_data = export_to_markdown(data)
    return Response(content=md_data, media_type="text/markdown", headers={"Content-Disposition": "attachment; filename=weather_queries.md"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

