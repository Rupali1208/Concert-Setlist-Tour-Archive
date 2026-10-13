import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

class Config:
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'concert_archive')
    SECRET_KEY = os.getenv('SECRET_KEY', 'concert_tour_archive_secret_key_2026')
    PORT = int(os.getenv('PORT', 5000))

def get_db_connection():
    """
    Establishes and returns a connection to the MySQL database.
    Returns PyMySQL Connection with DictCursor for easy JSON serialization.
    """
    return pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        charset='utf8mb4',
        cursorclass=DictCursor,
        autocommit=True
    )
