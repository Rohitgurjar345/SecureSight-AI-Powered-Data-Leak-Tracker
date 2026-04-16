import sqlite3
import os
from datetime import datetime

DB_PATH = 'securesight.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            query_type TEXT NOT NULL, 
            query_term TEXT NOT NULL,
            unified_risk_score TEXT NOT NULL,
            breach_count INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def log_search(query_type, query_term, unified_risk_score, breach_count):
    conn = get_db_connection()
    if query_type == "password" or query_type == "hybrid":
        # Keep emails visible, but passwords hidden
        if "@" not in query_term:
            query_term = "********"
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn.execute('''
        INSERT INTO search_history (timestamp, query_type, query_term, unified_risk_score, breach_count)
        VALUES (?, ?, ?, ?, ?)
    ''', (timestamp, query_type, query_term, unified_risk_score, breach_count))
    conn.commit()
    conn.close()

def get_recent_history(limit=50):
    conn = get_db_connection()
    recent = conn.execute('''
        SELECT * FROM search_history ORDER BY id DESC LIMIT ?
    ''', (limit,)).fetchall()
    conn.close()
    return [dict(row) for row in recent]

def clear_history():
    conn = get_db_connection()
    conn.execute('DELETE FROM search_history')
    conn.commit()
    conn.close()
