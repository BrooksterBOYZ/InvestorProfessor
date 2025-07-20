from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

# --- Configuration ---
DATABASE_NAME = 'database.db'
app = Flask(__name__)
# Enable CORS for all origins. In a production environment, you'd restrict this
# to your frontend's domain (e.g., origins=["http://localhost:3000"]).
CORS(app) 

# --- Database Initialization (using SQLite for simplicity) ---
def init_db():
    """Initializes the SQLite database and creates the 'items' table."""
    with sqlite3.connect(DATABASE_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT
            )
        ''')
        # Insert some sample data if the table is empty
        cursor.execute("SELECT COUNT(*) FROM items")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO items (name, description) VALUES (?, ?)", ('Item A', 'This is the first sample item.'))
            cursor.execute("INSERT INTO items (name, description) VALUES (?, ?)", ('Item B', 'This is the second sample item.'))
            conn.commit()
    print(f"Database '{DATABASE_NAME}' initialized with sample data.")

# --- API Endpoints ---
@app.route('/')
def home():
    """Root route for basic server check."""
    return "Backend server is running!"

@app.route('/api/items', methods=['GET'])
def get_items():
    """Fetches all items from the database."""
    items = []
    try:
        with sqlite3.connect(DATABASE_NAME) as conn:
            conn.row_factory = sqlite3.Row # Allows accessing columns by name
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM items")
            items = [dict(row) for row in cursor.fetchall()]
        return jsonify(items), 200
    except Exception as e:
        print(f"Error fetching items: {e}")
        return jsonify({"error": "Failed to retrieve items"}), 500

@app.route('/api/items', methods=['POST'])
def add_item():
    """Adds a new item to the database."""
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Name is required"}), 400
    
    name = data['name']
    description = data.get('description', '')

    try:
        with sqlite3.connect(DATABASE_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO items (name, description) VALUES (?, ?)", (name, description))
            conn.commit()
            new_item_id = cursor.lastrowid
            return jsonify({"id": new_item_id, "name": name, "description": description}), 201 # 201 Created
    except Exception as e:
        print(f"Error adding item: {e}")
        return jsonify({"error": "Failed to add item"}), 500

# --- Run the application ---
if __name__ == '__main__':
    # Initialize the database when the application starts
    init_db()
    # Run in debug mode during development. Set debug=False for production!
    app.run(debug=True, port=5000)
