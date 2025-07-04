from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Basic security: Input validation patterns
VALID_LOCATION_PATTERN = re.compile(r'^[a-zA-Z\s\-\.]+$')
VALID_MEDICATION_PATTERN = re.compile(r'^[a-zA-Z\s\-\.]+$')
VALID_SYMPTOMS_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-\.\,\!\?]+$')

# Allowed medication categories
ALLOWED_CATEGORIES = ['penicillins', 'cephalosporins', 'macrolides', 'tetracyclines', 'aminoglycosides', 'fluoroquinolones']

# Initialize Firebase
try:
    # Use environment variables for Firebase configuration
    firebase_config = {
        "type": "service_account",
        "project_id": os.getenv('FIREBASE_PROJECT_ID'),
        "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
        "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n') if os.getenv('FIREBASE_PRIVATE_KEY') else None,
        "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
        "client_id": os.getenv('FIREBASE_CLIENT_ID'),
        "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
        "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
        "auth_provider_x509_cert_url": os.getenv('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
        "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_X509_CERT_URL'),
        "universe_domain": os.getenv('FIREBASE_UNIVERSE_DOMAIN')
    }
    
    # Check if all required Firebase config is available
    if all(firebase_config.values()):
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully with environment variables")
    else:
        # Fallback to service account key file if environment variables are not set
        if os.path.exists('serviceAccountKey.json'):
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized successfully with service account key file")
        else:
            print("⚠️ Firebase configuration not found. Running without database.")
            firebase_admin.initialize_app()
    
    db = firestore.client()
except Exception as e:
    print(f"❌ Firebase initialization failed: {e}")
    db = None

def sanitize_input(text):
    """Basic input sanitization"""
    if not text:
        return text
    # Remove potentially dangerous characters
    text = re.sub(r'[<>"\']', '', str(text))
    return text.strip()

@app.route('/api/public', methods=['POST'])
def submit_public_data():
    try:
        data = request.json or {}
        required_fields = ['symptoms', 'medication', 'duration', 'location']
        
        # Validate required fields
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Basic length validation
        for field in required_fields:
            if len(str(data.get(field))) > 500:  # Reasonable limit
                return jsonify({'error': f'{field} is too long'}), 400
        
        # Validate duration
        try:
            duration = int(data.get('duration', 0))
            if duration < 1 or duration > 365:
                return jsonify({'error': 'Duration must be between 1 and 365 days'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid duration value'}), 400
        
        # Sanitize inputs
        sanitized_data = {
            'symptoms': sanitize_input(data.get('symptoms')),
            'medication': sanitize_input(data.get('medication')),
            'duration': duration,
            'location': sanitize_input(data.get('location')),
            'timestamp': datetime.now(),
            'type': 'public'
        }
        
        if db:
            # Save to Firebase
            doc_ref = db.collection('public_submissions').add(sanitized_data)
            sanitized_data['id'] = doc_ref[1].id
        
        return jsonify({'success': True, 'message': 'Data submitted successfully'})
    
    except Exception as e:
        print(f"Error in public submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/pharmacist', methods=['POST'])
def submit_pharmacist_data():
    try:
        data = request.json or {}
        required_fields = ['medicineName', 'category', 'quantity', 'region']
        
        # Validate required fields
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate category
        if data.get('category') not in ALLOWED_CATEGORIES:
            return jsonify({'error': 'Invalid medication category'}), 400
        
        # Validate quantity
        try:
            quantity = int(data.get('quantity', 0))
            if quantity < 1 or quantity > 10000:
                return jsonify({'error': 'Quantity must be between 1 and 10,000'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid quantity value'}), 400
        
        # Sanitize inputs
        sanitized_data = {
            'medicineName': sanitize_input(data.get('medicineName')),
            'category': data.get('category'),
            'quantity': quantity,
            'region': sanitize_input(data.get('region')),
            'timestamp': datetime.now(),
            'type': 'pharmacist'
        }
        
        if db:
            # Save to Firebase
            doc_ref = db.collection('pharmacist_submissions').add(sanitized_data)
            sanitized_data['id'] = doc_ref[1].id
        
        return jsonify({'success': True, 'message': 'Prescription logged successfully'})
    
    except Exception as e:
        print(f"Error in pharmacist submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    try:
        if not db:
            # Fallback data if Firebase is not available
            return jsonify({
                'totalEntries': 0,
                'highRiskZones': ['No data available'],
                'commonAntibiotics': ['No data available'],
                'recentSubmissions': []
            })
        
        # Get counts from Firebase
        public_count = len(list(db.collection('public_submissions').stream()))
        pharmacist_count = len(list(db.collection('pharmacist_submissions').stream()))
        total_entries = public_count + pharmacist_count
        
        # Get recent submissions
        recent_public = list(db.collection('public_submissions').order_by('timestamp', direction=firestore.DESCENDING).limit(5).stream())
        recent_pharmacist = list(db.collection('pharmacist_submissions').order_by('timestamp', direction=firestore.DESCENDING).limit(5).stream())
        
        # Process recent submissions
        recent_submissions = []
        for doc in recent_public:
            data = doc.to_dict()
            data['id'] = doc.id
            data['type'] = 'public'
            recent_submissions.append(data)
        
        for doc in recent_pharmacist:
            data = doc.to_dict()
            data['id'] = doc.id
            data['type'] = 'pharmacist'
            recent_submissions.append(data)
        
        # Sort by timestamp
        recent_submissions.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Get high-risk zones (locations with most submissions)
        location_counts = {}
        public_docs = db.collection('public_submissions').stream()
        for doc in public_docs:
            location = doc.to_dict().get('location', 'Unknown')
            location_counts[location] = location_counts.get(location, 0) + 1
        
        high_risk_zones = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        high_risk_zones = [zone[0] for zone in high_risk_zones] if high_risk_zones else ['No data available']
        
        # Get common antibiotics
        antibiotic_counts = {}
        pharmacist_docs = db.collection('pharmacist_submissions').stream()
        for doc in pharmacist_docs:
            medicine = doc.to_dict().get('medicineName', 'Unknown')
            antibiotic_counts[medicine] = antibiotic_counts.get(medicine, 0) + 1
        
        common_antibiotics = sorted(antibiotic_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        common_antibiotics = [med[0] for med in common_antibiotics] if common_antibiotics else ['No data available']
        
        return jsonify({
            'totalEntries': total_entries,
            'highRiskZones': high_risk_zones,
            'commonAntibiotics': common_antibiotics,
            'recentSubmissions': recent_submissions[:10]  # Last 10 submissions
        })
    
    except Exception as e:
        print(f"Error in dashboard stats: {e}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'firebase_connected': db is not None,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 