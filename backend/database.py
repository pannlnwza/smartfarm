import mysql.connector
from fastapi import HTTPException
from .config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
from typing import Any, Tuple

class Database:
    @staticmethod
    def get_connection():
        try:
            conn = mysql.connector.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME
            )
            return conn
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

    @staticmethod
    def execute_query(query: str, fetch_all: bool = True):
        conn = Database.get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query)
            
            if fetch_all:
                result = cursor.fetchall()
            else:
                result = cursor.fetchone()
                
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def execute_insert(query: str, params: Tuple[Any, ...] = None):
        conn = Database.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def fetch_one(query: str, params: Tuple[Any, ...]):
        conn = Database.get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
            return cursor.fetchone()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            cursor.close()
            conn.close()
            