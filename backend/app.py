from flask import send_from_directory
import os



from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration (example)
db_config = {
    'host': 'localhost',
    'user': 'malariaguard',
    'password': 'password',
    'database': 'malariaguard_db'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/api/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    try:
        data = request.json
        symptoms = data.get('symptoms', '')
        
        # In a real application, you would call the Hugging Face API here
        # For this example, we'll simulate analysis
        
        # Simple keyword matching (same as frontend for consistency)
        malaria_keywords = {
            'high': ['fever', 'chills', 'sweating', 'headache', 'nausea', 'vomiting', 'body aches', 'fatigue'],
            'medium': ['diarrhea', 'abdominal pain', 'muscle pain', 'jaundice'],
            'low': ['cough', 'mild headache', 'tiredness']
        }
        
        risk_score = 0
        found_symptoms = []
        
        # Check for high risk keywords
        for keyword in malaria_keywords['high']:
            if keyword in symptoms.lower():
                risk_score += 3
                found_symptoms.append(keyword)
        
        # Check for medium risk keywords
        for keyword in malaria_keywords['medium']:
            if keyword in symptoms.lower():
                risk_score += 2
                found_symptoms.append(keyword)
        
        # Check for low risk keywords
        for keyword in malaria_keywords['low']:
            if keyword in symptoms.lower():
                risk_score += 1
                found_symptoms.append(keyword)
        
        # Calculate risk percentage (cap at 95%)
        risk_percentage = min(95, (risk_score / 15) * 100)
        
        # Determine risk level
        if risk_percentage < 30:
            risk_level = "Low Risk"
        elif risk_percentage < 70:
            risk_level = "Medium Risk"
        else:
            risk_level = "High Risk"
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "INSERT INTO symptom_checks (symptoms, risk_score, risk_level, created_at) VALUES (%s, %s, %s, %s)"
        values = (symptoms, risk_percentage, risk_level, datetime.now())
        
        cursor.execute(query, values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'risk_score': risk_percentage,
            'risk_level': risk_level,
            'found_symptoms': found_symptoms
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/symptom-history', methods=['GET'])
def get_symptom_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM symptom_checks ORDER BY created_at DESC LIMIT 10"
        cursor.execute(query)
        
        history = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for entry in history:
            entry['created_at'] = entry['created_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'history': history
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
    # Serve the main page
@app.route('/')
def serve_frontend():
    return send_from_directory('../', 'index.html')

# Serve static files (CSS, JS, images)
@app.route('/<path:path>')
def serve_static_files(path):
    # Check if the file exists in any of the folders
    if os.path.exists(f'../{path}'):
        return send_from_directory('../', path)
    elif os.path.exists(f'../styles/{path}'):
        return send_from_directory('../styles/', path)
    elif os.path.exists(f'../scripts/{path}'):
        return send_from_directory('../scripts/', path)
    elif os.path.exists(f'../assets/{path}'):
        return send_from_directory('../assets/', path)
    else:
        return "Not Found", 404

if __name__ == '__main__':
    app.run(debug=True)