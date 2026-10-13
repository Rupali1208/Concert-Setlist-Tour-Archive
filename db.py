import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_db_connection():
    """
    Establishes and returns a MySQL database connection using credentials from .env.
    Raises Error if connection fails.
    """
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "concert_archive"),
            charset="utf8mb4",
            autocommit=True
        )
        return connection
    except Error as e:
        print(f"[ERROR] Database Connection Error: {e}")
        raise e

def execute_query(query, params=None, fetch_all=True, fetch_one=False):
    """
    Helper function to execute SQL queries with parameterized inputs.
    Returns results as dictionary objects.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            result = cursor.lastrowid or cursor.rowcount
            
        return result
    except Error as e:
        print(f"[ERROR] SQL Execution Error: {e}")
        raise e
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
