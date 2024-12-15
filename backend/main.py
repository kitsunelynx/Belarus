# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional
import sqlite3
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization
def init_db():
    conn = sqlite3.connect('work_logs.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS work_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            hours REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Pydantic models
class WorkLog(BaseModel):
    date: date
    hours: float
    category: str
    description: str

class WorkLogResponse(WorkLog):
    id: int
    created_at: datetime

# API endpoints
@app.post("/api/logs", response_model=WorkLogResponse)
async def create_log(log: WorkLog):
    conn = sqlite3.connect('work_logs.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT INTO work_logs (date, hours, category, description)
            VALUES (?, ?, ?, ?)
        ''', (log.date.isoformat(), log.hours, log.category, log.description))
        
        log_id = c.lastrowid
        conn.commit()
        
        # Fetch the created log
        c.execute('SELECT * FROM work_logs WHERE id = ?', (log_id,))
        result = c.fetchone()
        
        return {
            "id": result[0],
            "date": result[1],
            "hours": result[2],
            "category": result[3],
            "description": result[4],
            "created_at": result[5]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@app.get("/api/logs", response_model=List[WorkLogResponse])
async def get_logs():
    conn = sqlite3.connect('work_logs.db')
    c = conn.cursor()
    
    try:
        c.execute('SELECT * FROM work_logs ORDER BY date DESC')
        logs = c.fetchall()
        
        return [{
            "id": log[0],
            "date": log[1],
            "hours": log[2],
            "category": log[3],
            "description": log[4],
            "created_at": log[5]
        } for log in logs]
    finally:
        conn.close()

@app.get("/api/stats/weekly")
async def get_weekly_stats():
    conn = sqlite3.connect('work_logs.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            SELECT 
                strftime('%Y-%W', date) as week,
                SUM(hours) as total_hours,
                COUNT(*) as log_count,
                AVG(hours) as avg_hours
            FROM work_logs 
            GROUP BY week 
            ORDER BY week DESC 
            LIMIT 8
        ''')
        
        results = c.fetchall()
        return [{
            "week": week,
            "total_hours": round(total_hours, 1),
            "log_count": log_count,
            "avg_hours": round(avg_hours, 1)
        } for week, total_hours, log_count, avg_hours in results]
    finally:
        conn.close()

@app.get("/api/stats/categories")
async def get_category_stats():
    conn = sqlite3.connect('work_logs.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            SELECT 
                category,
                SUM(hours) as total_hours,
                COUNT(*) as log_count,
                AVG(hours) as avg_hours
            FROM work_logs 
            GROUP BY category
        ''')
        
        results = c.fetchall()
        return [{
            "category": category,
            "total_hours": round(total_hours, 1),
            "log_count": log_count,
            "avg_hours": round(avg_hours, 1)
        } for category, total_hours, log_count, avg_hours in results]
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)