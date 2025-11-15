import requests
import os
from typing import Optional, Dict, List
from schemas import WeatherCurrent, WeatherForecast
from datetime import datetime, timedelta

# OpenWeatherMap API key - should be set as environment variable
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "c9b2a33e5aa2711aa568d5c7870bb7c5")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

def get_weather_by_location(location: str) -> Optional[Dict]:
    """
    Fetch current weather data for a location.
    Supports: Zip Code, Postal Code, GPS Coordinates, Landmark, Town, City
    """
    try:
        # Try direct location name first
        url = f"{OPENWEATHER_BASE_URL}/weather"
        params = {
            "q": location,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            # Try with country code or as coordinates
            # If location contains comma, might be coordinates
            if ',' in location:
                try:
                    lat, lon = map(float, location.split(','))
                    params = {
                        "lat": lat,
                        "lon": lon,
                        "appid": OPENWEATHER_API_KEY,
                        "units": "metric"
                    }
                    response = requests.get(url, params=params, timeout=10)
                    if response.status_code == 200:
                        return response.json()
                except:
                    pass
        return None
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return None

def get_5day_forecast(location: str) -> Optional[Dict]:
    """Fetch 5-day weather forecast for a location"""
    try:
        url = f"{OPENWEATHER_BASE_URL}/forecast"
        params = {
            "q": location,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404 and ',' in location:
            try:
                lat, lon = map(float, location.split(','))
                params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "metric"
                }
                response = requests.get(url, params=params, timeout=10)
                if response.status_code == 200:
                    return response.json()
            except:
                pass
        return None
    except Exception as e:
        print(f"Error fetching forecast: {e}")
        return None

def parse_current_weather(data: Dict) -> WeatherCurrent:
    """Parse OpenWeatherMap response to WeatherCurrent schema"""
    return WeatherCurrent(
        location=f"{data['name']}, {data.get('sys', {}).get('country', '')}",
        temperature=data['main']['temp'],
        humidity=data['main']['humidity'],
        description=data['weather'][0]['description'].title(),
        feels_like=data['main']['feels_like'],
        wind_speed=data.get('wind', {}).get('speed', 0),
        pressure=data['main']['pressure'],
        visibility=data.get('visibility', 0) / 1000 if data.get('visibility') else None
    )

def parse_forecast(data: Dict) -> List[WeatherForecast]:
    """Parse 5-day forecast response"""
    forecasts = []
    daily_data = {}
    
    for item in data.get('list', []):
        date = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
        if date not in daily_data:
            daily_data[date] = {
                'temps': [],
                'humidity': [],
                'descriptions': [],
                'feels_like': [],
                'wind_speed': []
            }
        
        daily_data[date]['temps'].append(item['main']['temp'])
        daily_data[date]['humidity'].append(item['main']['humidity'])
        daily_data[date]['descriptions'].append(item['weather'][0]['description'])
        daily_data[date]['feels_like'].append(item['main']['feels_like'])
        daily_data[date]['wind_speed'].append(item.get('wind', {}).get('speed', 0))
    
    for date, values in sorted(daily_data.items())[:5]:
        forecasts.append(WeatherForecast(
            date=date,
            temperature=sum(values['temps']) / len(values['temps']),
            humidity=sum(values['humidity']) / len(values['humidity']),
            description=values['descriptions'][0].title(),
            feels_like=sum(values['feels_like']) / len(values['feels_like']),
            wind_speed=sum(values['wind_speed']) / len(values['wind_speed'])
        ))
    
    return forecasts

