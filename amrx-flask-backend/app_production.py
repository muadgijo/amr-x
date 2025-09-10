from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
import jwt
import hashlib
import secrets
from supabase_config import SupabaseService

# Load environment variables
load_dotenv()

# Production logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration for production
CORS(app, origins=[
    'http://localhost:5173',
    'https://your-frontend-domain.com',
    'https://amrx-app.vercel.app'  # Replace with your actual domain
])

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
JWT_EXPIRATION = 24 * 60 * 60  # 24 hours

# Initialize Supabase service
supabase_service = SupabaseService()

def hash_password(password: str) -> str:
    """Hash password with salt"""
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
    """Authentication decorator"""
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        request.user_id = payload['user_id']
        return f(*args, **kwargs)
    return decorated

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'environment': os.getenv('FLASK_ENV', 'production')
    })

# Public data submission
@app.route('/api/public', methods=['POST'])
def submit_public_data():
    try:
        data = request.json or {}
        
        # Validation
        required_fields = ['symptoms', 'medication', 'duration', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Prepare data for Supabase
        submission_data = {
            'symptoms': data.get('symptoms'),
            'medication': data.get('medication'),
            'duration': int(data.get('duration', 0)),
            'location': data.get('location'),
            'created_at': datetime.now().isoformat(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        }
        
        # Save to Supabase
        result = supabase_service.save_public_submission(submission_data)
        
        return jsonify({
            'success': True,
            'message': 'Data submitted successfully',
            'id': result.get('id'),
            'timestamp': submission_data['created_at']
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
        
        # Validation
        required_fields = ['medicineName', 'category', 'quantity', 'region']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Prepare data for Supabase
        submission_data = {
            'medicine_name': data.get('medicineName'),
            'category': data.get('category'),
            'quantity': int(data.get('quantity', 0)),
            'region': data.get('region'),
            'pharmacist_id': request.user_id,
            'created_at': datetime.now().isoformat(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        }
        
        # Save to Supabase
        result = supabase_service.save_pharmacist_submission(submission_data)
        
        return jsonify({
            'success': True,
            'message': 'Prescription logged successfully',
            'id': result.get('id'),
            'timestamp': submission_data['created_at']
        })
    
    except Exception as e:
        logger.error(f"Error in pharmacist submission: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Dashboard data
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    try:
        stats = supabase_service.get_dashboard_stats()
        stats['lastUpdated'] = datetime.now().isoformat()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

# Authentication
@app.route('/api/auth/pharmacist/login', methods=['POST'])
def pharmacist_login():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Authenticate with Supabase
        pharmacist = supabase_service.authenticate_pharmacist(email, password)
        
        if pharmacist:
            token = generate_token(pharmacist['id'])
            return jsonify({
                'success': True,
                'token': token,
                'pharmacist': pharmacist
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
        
        # Validation
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Prepare data for Supabase
        pharmacist_data = {
            'name': data.get('name'),
            'email': email,
            'password_hash': hash_password(password),  # Hash the password
            'institution': data.get('institution'),
            'created_at': datetime.now().isoformat(),
            'active': True
        }
        
        # Register in Supabase
        success = supabase_service.register_pharmacist(pharmacist_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Registration successful. Please login.'
            }), 201
        else:
            return jsonify({'error': 'Registration failed'}), 500
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

# Pharmacist dashboard
@app.route('/api/pharmacist/dashboard', methods=['GET'])
@require_auth
def get_pharmacist_dashboard():
    try:
        # In production, fetch pharmacist-specific data from Supabase
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
    except Exception as e:
        logger.error(f"Error getting pharmacist dashboard: {e}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
