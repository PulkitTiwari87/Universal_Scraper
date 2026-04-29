from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uuid
import json

from .tasks import run_crawl
from .database import create_job, get_db, get_recent_extractions

app = FastAPI(title="Universal Web Crawler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrawlRequest(BaseModel):
    start_url: str
    max_depth: int = 2
    concurrency_limit: int = 1
    politeness_delay: float = 1.0
    css_selectors: dict = {}

@app.post("/api/crawl")
async def start_crawl(request: CrawlRequest):
    job_id = str(uuid.uuid4())
    create_job(job_id, request.start_url)
    
    config = {
        'max_depth': request.max_depth,
        'politeness_delay': request.politeness_delay,
        'css_selectors': request.css_selectors if request.css_selectors else {"content": "body"}
    }
    
    run_crawl.delay(job_id, request.start_url, config)
    
    return {"status": "job_queued", "job_id": job_id, "message": f"Crawling {request.start_url} started."}

@app.get("/api/status")
async def get_status():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM jobs WHERE status = 'running'")
    active_jobs = c.fetchone()[0]
    conn.close()
    return {"status": "running", "active_jobs": active_jobs}

@app.get("/api/extractions")
async def fetch_extractions():
    return get_recent_extractions()

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    last_log_id = 0
    try:
        while True:
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT id, time, status, message FROM logs WHERE id > ? ORDER BY id ASC", (last_log_id,))
            logs = c.fetchall()
            conn.close()
            
            for log in logs:
                await websocket.send_json(dict(log))
                last_log_id = log['id']
                
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
