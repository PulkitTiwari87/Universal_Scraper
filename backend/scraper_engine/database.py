import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'scraper.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            job_id TEXT PRIMARY KEY,
            start_url TEXT,
            status TEXT,
            started_at DATETIME,
            completed_at DATETIME
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS extractions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT,
            source_url TEXT,
            data TEXT,
            extracted_at DATETIME
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT,
            time TEXT,
            status TEXT,
            message TEXT
        )
    ''')
    conn.commit()
    conn.close()

def create_job(job_id, start_url):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO jobs (job_id, start_url, status, started_at) VALUES (?, ?, ?, ?)",
        (job_id, start_url, 'queued', datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def update_job_status(job_id, status):
    conn = get_db()
    c = conn.cursor()
    if status in ('completed', 'failed'):
        c.execute("UPDATE jobs SET status = ?, completed_at = ? WHERE job_id = ?", (status, datetime.now().isoformat(), job_id))
    else:
        c.execute("UPDATE jobs SET status = ? WHERE job_id = ?", (status, job_id))
    conn.commit()
    conn.close()

def save_extraction(job_id, source_url, data):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO extractions (job_id, source_url, data, extracted_at) VALUES (?, ?, ?, ?)",
        (job_id, source_url, json.dumps(data), datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def add_log(job_id, status, message):
    conn = get_db()
    c = conn.cursor()
    time_str = datetime.now().strftime("%H:%M:%S")
    c.execute(
        "INSERT INTO logs (job_id, time, status, message) VALUES (?, ?, ?, ?)",
        (job_id, time_str, status, message)
    )
    conn.commit()
    conn.close()
    return {"time": time_str, "status": status, "message": message}

def get_recent_extractions(limit=10):
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        SELECT source_url, status, COUNT(e.id) as items_found, MAX(e.extracted_at) as time
        FROM jobs j
        LEFT JOIN extractions e ON j.job_id = e.job_id
        GROUP BY j.job_id
        ORDER BY j.started_at DESC
        LIMIT ?
    ''', (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Initialize DB on import
init_db()
