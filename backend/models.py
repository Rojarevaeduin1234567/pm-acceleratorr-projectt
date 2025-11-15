from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class WeatherQuery(Base):
    __tablename__ = "weather_queries"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False, index=True)
    date_from = Column(String, nullable=False)
    date_to = Column(String, nullable=False)
    output_temperature = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

