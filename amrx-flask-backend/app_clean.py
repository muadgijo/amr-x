from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
import jwt
import hashlib
import secrets

# Load environment variables
load_dotenv()

# Simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'https://your-domain.com'])

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
JWT_EXPIRATION = 24 * 60 * 60  # 24 hours

def hash_password(password: str) -> str:
    """Simple password hashing"""
    salt = os.getenv('PASSWORD_SALT', 'amr_salt_2024')
    return hashlib.sha256((password + salt).encode()).hexdigest()

def generate_token(user_id: str) -> str:
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow().timestamp() + JWT_EXPIRATION,
        'iat': datetime.utcnow().timestamp()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token: str) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except:
        return None

def require_auth(f):
    """Simple auth decorator"""
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        request.user_id = payload['user_id']
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# Public data submission
@app.route('/api/public', methods=['POST'])
def submit_public_data():
    try:
        data = request.json or {}
        
        # Simple validation
        required_fields = ['symptoms', 'medication', 'duration', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Log the submission (in production, save to Supabase)
        logger.info(f"Public submission: {data}")
        
        return jsonify({
            'success': True,
            'message': 'Data submitted successfully',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in public submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Pharmacist data submission
@app.route('/api/pharmacist', methods=['POST'])
@require_auth
def submit_pharmacist_data():
    try:
        data = request.json or {}
        
        # Simple validation
        required_fields = ['medicineName', 'category', 'quantity', 'region']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Log the submission (in production, save to Supabase)
        logger.info(f"Pharmacist submission from {request.user_id}: {data}")
        
        return jsonify({
            'success': True,
            'message': 'Prescription logged successfully',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in pharmacist submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Dashboard data
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    # Simple mock data (in production, fetch from Supabase)
    return jsonify({
        'totalEntries': 150,
        'total_submissions': 120,
        'resistance_cases': 18,
        'misuse_percentage': 25,
        'countries_affected': 8,
        'highRiskZones': ['North America', 'Europe', 'Asia'],
        'commonAntibiotics': ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin'],
        'recentSubmissions': [],
        'lastUpdated': datetime.now().isoformat()
    })

# Authentication
@app.route('/api/auth/pharmacist/login', methods=['POST'])
def pharmacist_login():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Demo credentials (in production, check Supabase)
        if email == 'demo@amrx.com' and password == 'demo123':
            demo_pharmacist = {
                'id': 'demo_pharmacist',
                'name': 'Demo Pharmacist',
                'email': email,
                'institution': 'Demo Hospital'
            }
            token = generate_token(demo_pharmacist['id'])
            return jsonify({
                'success': True,
                'token': token,
                'pharmacist': demo_pharmacist
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Authentication failed'}), 500

@app.route('/api/auth/pharmacist/register', methods=['POST'])
def pharmacist_register():
    try:
        data = request.json or {}
        required_fields = ['name', 'email', 'password', 'institution']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Simple validation
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # In production, save to Supabase
        logger.info(f"New pharmacist registration: {email}")
        
        # For demo, just return success
        return jsonify({
            'success': True,
            'message': 'Registration successful. Please login.'
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

# Pharmacist dashboard
@app.route('/api/pharmacist/dashboard', methods=['GET'])
@require_auth
def get_pharmacist_dashboard():
    # Simple mock data (in production, fetch from Supabase)
    return jsonify({
        'total_submissions': 25,
        'monthly_submissions': 8,
        'resistance_cases': 4,
        'success_rate': 85,
        'recent_submissions': [],
        'monthly_trends': [],
        'region_counts': {},
        'submissions': [],
        'lastUpdated': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
