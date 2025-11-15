from sqlalchemy.orm import Session
from models import WeatherQuery
from schemas import WeatherQueryCreate, WeatherQueryUpdate
from typing import List, Optional

def create_weather_query(db: Session, weather_query: WeatherQueryCreate) -> WeatherQuery:
    db_query = WeatherQuery(
        location=weather_query.location,
        date_from=weather_query.date_from,
        date_to=weather_query.date_to,
        output_temperature=weather_query.output_temperature
    )
    db.add(db_query)
    db.commit()
    db.refresh(db_query)
    return db_query

def get_weather_query(db: Session, query_id: int) -> Optional[WeatherQuery]:
    return db.query(WeatherQuery).filter(WeatherQuery.id == query_id).first()

def get_all_weather_queries(db: Session, skip: int = 0, limit: int = 100) -> List[WeatherQuery]:
    return db.query(WeatherQuery).offset(skip).limit(limit).all()

def update_weather_query(db: Session, query_id: int, weather_query: WeatherQueryUpdate) -> Optional[WeatherQuery]:
    db_query = db.query(WeatherQuery).filter(WeatherQuery.id == query_id).first()
    if not db_query:
        return None
    
    update_data = weather_query.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_query, field, value)
    
    db.commit()
    db.refresh(db_query)
    return db_query

def delete_weather_query(db: Session, query_id: int) -> bool:
    db_query = db.query(WeatherQuery).filter(WeatherQuery.id == query_id).first()
    if not db_query:
        return False
    
    db.delete(db_query)
    db.commit()
    return True

