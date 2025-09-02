from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
from datetime import datetime

# Initialize the Flask application
# --- MODIFICATION ---
# Tell Flask to look for the template and static files in the parent directory
# relative to this file's location (backend/).
app = Flask(__name__, template_folder='../', static_folder='../')
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Database Configuration ---
# It's good practice to keep your database credentials secure.
# For a real application, consider using environment variables.
db_config = {
    'host': 'localhost',
    'user': 'malariaguard',
    'password': 'password',
    'database': 'malariaguard_db'
}

def get_db_connection():
    """Establishes and returns a connection to the MySQL database."""
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

# --- HTML Rendering Route ---
@app.route('/')
def home():
    """Serves the main HTML page."""
    # This assumes you have an 'index.html' file in a 'templates' folder
    # in the same directory as this script.
    return render_template('index.html')

# --- API Routes ---

@app.route('/api/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    """
    Analyzes user-submitted symptoms, provides a basic diagnosis,
    and logs the entry into the database.
    """
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({'error': 'Missing symptoms data'}), 400

    symptoms = data['symptoms']
    
    # --- Simple Malaria Diagnosis Logic (Placeholder) ---
    # This is a very basic example. A real-world application would require a
    # much more sophisticated model (e.g., machine learning).
    malaria_keywords = ['fever', 'chills', 'headache', 'sweating', 'fatigue', 'nausea']
    symptom_count = sum(1 for symptom in symptoms if symptom.lower() in malaria_keywords)
    
    if symptom_count >= 3:
        diagnosis = "High risk of Malaria. Please consult a doctor immediately."
    elif symptom_count >= 1:
        diagnosis = "Moderate risk of Malaria. Monitor symptoms and consult a doctor if they worsen."
    else:
        diagnosis = "Low risk of Malaria. Symptoms may be related to another condition."

    # --- Database Logging ---
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
        
    cursor = conn.cursor()
    try:
        # --- MODIFICATION ---
        # Changed table name from 'symptom_logs' to 'symptom_checks' to match database.sql
        add_log_query = (
            "INSERT INTO symptom_checks (symptoms, diagnosis, log_date) "
            "VALUES (%s, %s, %s)"
        )
        # Convert list of symptoms to a comma-separated string for storage
        symptoms_str = ','.join(symptoms)
        log_data = (symptoms_str, diagnosis, datetime.now())
        
        cursor.execute(add_log_query, log_data)
        conn.commit()
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return jsonify({'error': 'Failed to save symptom log'}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({'diagnosis': diagnosis})

@app.route('/api/symptom-history', methods=['GET'])
def get_symptom_history():
    """
    Retrieves all symptom log entries from the database.
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    # Using dictionary=True to get results as a list of dicts
    cursor = conn.cursor(dictionary=True)
    try:
        # --- MODIFICATION ---
        # Changed table name from 'symptom_logs' to 'symptom_checks' to match database.sql
        query = "SELECT id, symptoms, diagnosis, log_date FROM symptom_checks ORDER BY log_date DESC"
        cursor.execute(query)
        history = cursor.fetchall()

        # Convert datetime objects to string format for JSON serialization
        for item in history:
            item['log_date'] = item['log_date'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(history)
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return jsonify({'error': 'Failed to retrieve symptom history'}), 500
    finally:
        cursor.close()
        conn.close()

# --- Main Application Runner ---
if __name__ == "__main__":
    # Note: For production, use a proper WSGI server like Gunicorn or uWSGI
    # instead of the Flask development server.
    app.run(host="0.0.0.0", port=5000, debug=True)

