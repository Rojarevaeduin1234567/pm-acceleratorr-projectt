from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class WeatherQueryBase(BaseModel):
    location: str = Field(..., min_length=1, description="Location (Zip, Postal, GPS, Landmark, Town, City)")
    date_from: str = Field(..., description="Start date (YYYY-MM-DD)")
    date_to: str = Field(..., description="End date (YYYY-MM-DD)")
    output_temperature: float = Field(..., description="Output temperature value")

    @validator('date_from', 'date_to')
    def validate_date_format(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @validator('date_to')
    def validate_date_range(cls, v, values):
        if 'date_from' in values:
            date_from = datetime.strptime(values['date_from'], '%Y-%m-%d')
            date_to = datetime.strptime(v, '%Y-%m-%d')
            if date_to < date_from:
                raise ValueError('date_to must be after date_from')
        return v

class WeatherQueryCreate(WeatherQueryBase):
    pass

class WeatherQueryUpdate(BaseModel):
    location: Optional[str] = Field(None, min_length=1)
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    output_temperature: Optional[float] = None

    @validator('date_from', 'date_to')
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v

class WeatherQueryResponse(WeatherQueryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WeatherCurrent(BaseModel):
    location: str
    temperature: float
    humidity: float
    description: str
    feels_like: float
    wind_speed: float
    pressure: float
    visibility: Optional[float] = None

class WeatherForecast(BaseModel):
    date: str
    temperature: float
    humidity: float
    description: str
    feels_like: float
    wind_speed: float

