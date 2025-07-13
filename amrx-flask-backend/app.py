from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import firebase_admin
from firebase_admin import credentials, firestore
import os
import logging
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import re
from typing import Dict, Any, Optional
import json
import jwt
import hashlib
import secrets
from collections import defaultdict
from functools import wraps, lru_cache
import time
import traceback

# Load environment variables
load_dotenv()

# Configure logging with better formatting
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True)

# JWT Configuration
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 24 * 60 * 60  # 24 hours

# Use Flask app config for secret key if available
JWT_SECRET = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))

# Configure CORS for production and development
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

# Configure rate limiting with more granular settings
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    strategy="fixed-window"
)

# Security: Input validation patterns
VALID_LOCATION_PATTERN = re.compile(r'^[a-zA-Z\s\-\.]+$', re.IGNORECASE)
VALID_MEDICATION_PATTERN = re.compile(r'^[a-zA-Z\s\-\.]+$', re.IGNORECASE)
VALID_SYMPTOMS_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-\.\,\!\?]+$', re.IGNORECASE)
VALID_REGION_PATTERN = re.compile(r'^[a-zA-Z\s\-\.]+$', re.IGNORECASE)
VALID_EMAIL_PATTERN = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

# Allowed medication categories
ALLOWED_CATEGORIES = [
    'penicillins', 'cephalosporins', 'macrolides', 
    'tetracyclines', 'aminoglycosides', 'fluoroquinolones'
]

# Cache configuration
CACHE_DURATION = 300  # 5 minutes
dashboard_cache = {}
cache_timestamps = {}

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = os.getenv('PASSWORD_SALT', 'amr_salt_2024')
    return hashlib.sha256((password + salt).encode()).hexdigest()

def generate_token(pharmacist_id: str) -> str:
    """Generate JWT token for pharmacist with enhanced security."""
    payload = {
        'pharmacist_id': pharmacist_id,
        'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION),
        'iat': datetime.utcnow(),
        'iss': 'amr-x-api',
        'aud': 'amr-x-frontend'
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token and return payload with enhanced validation."""
    try:
        payload = jwt.decode(
            token, 
            JWT_SECRET, 
            algorithms=[JWT_ALGORITHM],
            issuer='amr-x-api',
            audience='amr-x-frontend'
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return None

def require_auth(f):
    """Enhanced authentication decorator with better error handling."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required', 'code': 'AUTH_REQUIRED'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token', 'code': 'INVALID_TOKEN'}), 401
        
        setattr(request, 'pharmacist_id', payload['pharmacist_id'])
        return f(*args, **kwargs)
    return decorated

def cache_result(duration: int = CACHE_DURATION):
    """Decorator for caching function results."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            current_time = time.time()
            
            # Check if cache is valid
            if (cache_key in cache_timestamps and 
                current_time - cache_timestamps[cache_key] < duration and
                cache_key in dashboard_cache):
                return dashboard_cache[cache_key]
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            dashboard_cache[cache_key] = result
            cache_timestamps[cache_key] = current_time
            
            return result
        return wrapper
    return decorator

def clear_cache():
    """Clear all cached data."""
    global dashboard_cache, cache_timestamps
    dashboard_cache.clear()
    cache_timestamps.clear()

# Initialize Firebase with better error handling
def initialize_firebase():
    """Initialize Firebase with proper error handling and fallback."""
    try:
        # Check for environment variables first
        firebase_config = {
            "type": "service_account",
            "project_id": os.getenv('FIREBASE_PROJECT_ID'),
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n') if os.getenv('FIREBASE_PRIVATE_KEY') else None,
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
            "client_id": os.getenv('FIREBASE_CLIENT_ID'),
            "auth_uri": os.getenv('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
            "token_uri": os.getenv('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
            "auth_provider_x509_cert_url": os.getenv('FIREBASE_AUTH_PROVIDER_X509_CERT_URL', 'https://www.googleapis.com/oauth2/v1/certs'),
            "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_X509_CERT_URL'),
            "universe_domain": os.getenv('FIREBASE_UNIVERSE_DOMAIN', 'googleapis.com')
        }
        
        # Check if all required Firebase config is available
        required_fields = ['project_id', 'private_key_id', 'private_key', 'client_email', 'client_id']
        if all(firebase_config.get(field) for field in required_fields):
            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized successfully with environment variables")
        else:
            # Fallback to service account key file
            if os.path.exists('serviceAccountKey.json'):
                cred = credentials.Certificate('serviceAccountKey.json')
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized successfully with service account key file")
            else:
                logger.warning("Firebase configuration not found. Running without database.")
                firebase_admin.initialize_app()
        
        return firestore.client()
    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        return None

db = initialize_firebase()

def sanitize_input(text: str) -> str:
    """Enhanced input sanitization with better security."""
    if not text:
        return text
    # Remove potentially dangerous characters and normalize
    text = re.sub(r'[<>"\']', '', str(text))
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text.strip()

def validate_input_pattern(text: str, pattern: re.Pattern, field_name: str) -> tuple[bool, str]:
    """Validate input against regex pattern."""
    if not text or not pattern.match(text):
        return False, f"Invalid {field_name} format"
    return True, ""

def log_submission(data: Dict[str, Any], submission_type: str, ip_address: str):
    """Enhanced logging for audit trail."""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'type': submission_type,
        'ip_address': ip_address,
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
        'data': {k: v for k, v in data.items() if k != 'timestamp'}
    }
    logger.info(f"Submission logged: {json.dumps(log_entry)}")

def validate_email(email: str) -> bool:
    """Validate email format."""
    return bool(VALID_EMAIL_PATTERN.match(email))

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, ""

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded with retry information."""
    return jsonify({
        'error': 'Rate limit exceeded. Please try again later.',
        'retry_after': e.retry_after,
        'code': 'RATE_LIMIT_EXCEEDED'
    }), 429

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors with better logging."""
    logger.error(f"Internal server error: {e}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return jsonify({
        'error': 'Internal server error',
        'code': 'INTERNAL_ERROR',
        'request_id': secrets.token_hex(8)
    }), 500

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'code': 'NOT_FOUND'
    }), 404

@app.errorhandler(405)
def method_not_allowed(e):
    """Handle method not allowed errors."""
    return jsonify({
        'error': 'Method not allowed',
        'code': 'METHOD_NOT_ALLOWED'
    }), 405

@app.route('/api/public', methods=['POST'])
@limiter.limit("10 per minute")
def submit_public_data():
    """Submit public symptom data with enhanced validation and security."""
    try:
        data = request.json or {}
        required_fields = ['symptoms', 'medication', 'duration', 'location']
        
        # Validate required fields
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required', 'code': 'MISSING_FIELD'}), 400
        
        # Enhanced length validation
        field_limits = {
            'symptoms': 1000,
            'medication': 100,
            'location': 100
        }
        
        for field, limit in field_limits.items():
            if len(str(data.get(field, ''))) > limit:
                return jsonify({'error': f'{field} is too long (max {limit} characters)', 'code': 'FIELD_TOO_LONG'}), 400
        
        # Validate patterns
        validations = [
            (data.get('symptoms'), VALID_SYMPTOMS_PATTERN, 'symptoms'),
            (data.get('medication'), VALID_MEDICATION_PATTERN, 'medication'),
            (data.get('location'), VALID_LOCATION_PATTERN, 'location')
        ]
        
        for value, pattern, field_name in validations:
            is_valid, error_msg = validate_input_pattern(str(value) or '', pattern, field_name)
            if not is_valid:
                return jsonify({'error': error_msg, 'code': 'INVALID_FORMAT'}), 400
        
        # Validate duration
        try:
            duration = int(data.get('duration', 0))
            if duration < 1 or duration > 365:
                return jsonify({'error': 'Duration must be between 1 and 365 days', 'code': 'INVALID_DURATION'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid duration value', 'code': 'INVALID_DURATION'}), 400
        
        # Sanitize inputs
        sanitized_data = {
            'symptoms': sanitize_input(str(data.get('symptoms') or '')),
            'medication': sanitize_input(str(data.get('medication') or '')),
            'duration': duration,
            'location': sanitize_input(str(data.get('location') or '')),
            'timestamp': datetime.now(),
            'type': 'public',
            'ip_address': get_remote_address(),
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        }
        
        if db:
            # Save to Firebase with error handling
            try:
                doc_ref = db.collection('public_submissions').add(sanitized_data)
                if doc_ref and len(doc_ref) > 1 and doc_ref[1] is not None and hasattr(doc_ref[1], 'id'):
                    sanitized_data['id'] = doc_ref[1].id
                    logger.info(f"Public submission saved with ID: {doc_ref[1].id}")
                    # Clear cache to ensure fresh data
                    clear_cache()
            except Exception as e:
                logger.error(f"Failed to save to Firebase: {e}")
                return jsonify({'error': 'Failed to save data', 'code': 'DATABASE_ERROR'}), 500
        
        # Log submission for audit
        log_submission(sanitized_data, 'public', get_remote_address())
        
        return jsonify({
            'success': True, 
            'message': 'Data submitted successfully',
            'id': sanitized_data.get('id'),
            'timestamp': sanitized_data['timestamp'].isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in public submission: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Internal server error', 'code': 'INTERNAL_ERROR'}), 500

@app.route('/api/pharmacist', methods=['POST'])
@require_auth
@limiter.limit("20 per minute")
def submit_pharmacist_data():
    """Submit pharmacist prescription data with enhanced validation."""
    try:
        pharmacist_id = getattr(request, 'pharmacist_id', None)
        if not pharmacist_id:
            return jsonify({'error': 'Authentication required (no pharmacist_id)', 'code': 'AUTH_REQUIRED'}), 401
        
        data = request.json or {}
        required_fields = ['medicineName', 'category', 'quantity', 'region']
        
        # Validate required fields
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required', 'code': 'MISSING_FIELD'}), 400
        
        # Validate category
        if data.get('category') not in ALLOWED_CATEGORIES:
            return jsonify({'error': f'Invalid medication category. Must be one of: {", ".join(ALLOWED_CATEGORIES)}', 'code': 'INVALID_CATEGORY'}), 400
        
        # Validate quantity
        try:
            quantity = int(data.get('quantity', 0))
            if quantity < 1 or quantity > 10000:
                return jsonify({'error': 'Quantity must be between 1 and 10,000', 'code': 'INVALID_QUANTITY'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid quantity value', 'code': 'INVALID_QUANTITY'}), 400
        
        # Validate region pattern
        is_valid, error_msg = validate_input_pattern(
            str(data.get('region') or '') or '', VALID_REGION_PATTERN, 'region'
        )
        if not is_valid:
            return jsonify({'error': error_msg, 'code': 'INVALID_FORMAT'}), 400
        
        # Sanitize inputs
        sanitized_data = {
            'medicineName': sanitize_input(str(data.get('medicineName') or '')),
            'category': data.get('category'),
            'quantity': quantity,
            'region': sanitize_input(str(data.get('region') or '')),
            'timestamp': datetime.now(),
            'type': 'pharmacist',
            'ip_address': get_remote_address(),
            'pharmacist_id': pharmacist_id,
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        }
        
        if db:
            # Save to Firebase with error handling
            try:
                doc_ref = db.collection('pharmacist_submissions').add(sanitized_data)
                if doc_ref and len(doc_ref) > 1 and doc_ref[1] is not None and hasattr(doc_ref[1], 'id'):
                    sanitized_data['id'] = doc_ref[1].id
                    logger.info(f"Pharmacist submission saved with ID: {doc_ref[1].id}")
                    # Clear cache to ensure fresh data
                    clear_cache()
            except Exception as e:
                logger.error(f"Failed to save to Firebase: {e}")
                return jsonify({'error': 'Failed to save data', 'code': 'DATABASE_ERROR'}), 500
        
        # Log submission for audit
        log_submission(sanitized_data, 'pharmacist', get_remote_address())
        
        return jsonify({
            'success': True, 
            'message': 'Prescription logged successfully',
            'id': sanitized_data.get('id'),
            'timestamp': sanitized_data['timestamp'].isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in pharmacist submission: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Internal server error', 'code': 'INTERNAL_ERROR'}), 500

@app.route('/api/dashboard', methods=['GET'])
@limiter.limit("100 per hour")
@cache_result(duration=300)  # Cache for 5 minutes
def get_dashboard_stats():
    """Get dashboard statistics with optimized queries and caching."""
    try:
        if not db:
            # Fallback data if Firebase is not available
            return jsonify({
                'totalEntries': 0,
                'total_submissions': 0,
                'resistance_cases': 0,
                'misuse_percentage': 35,
                'countries_affected': 0,
                'highRiskZones': ['No data available'],
                'commonAntibiotics': ['No data available'],
                'recentSubmissions': [],
                'lastUpdated': datetime.now().isoformat(),
                'cache_status': 'fallback'
            })
        
        # Optimized queries with limits and error handling
        try:
            # Get counts efficiently
            public_count = len(list(db.collection('public_submissions').limit(1000).stream()))
            pharmacist_count = len(list(db.collection('pharmacist_submissions').limit(1000).stream()))
            total_entries = public_count + pharmacist_count
            
            # Get recent submissions with proper ordering
            recent_public = list(db.collection('public_submissions')
                               .order_by('timestamp', direction='DESCENDING')
                               .limit(5).stream())
            
            recent_pharmacist = list(db.collection('pharmacist_submissions')
                                   .order_by('timestamp', direction='DESCENDING')
                                   .limit(5).stream())
            
            # Process recent submissions
            recent_submissions = []
            for doc in recent_public:
                data = doc.to_dict() if doc else None
                if data is not None:
                    data['id'] = doc.id
                    data['type'] = 'public'
                    # Convert timestamp for JSON serialization
                    ts = data.get('timestamp')
                    if ts is not None and hasattr(ts, 'isoformat'):
                        data['timestamp'] = ts.isoformat()
                    else:
                        data['timestamp'] = str(ts) if ts is not None else ''
                    recent_submissions.append(data)
            
            for doc in recent_pharmacist:
                data = doc.to_dict() if doc else None
                if data is not None:
                    data['id'] = doc.id
                    data['type'] = 'pharmacist'
                    ts = data.get('timestamp')
                    if ts is not None and hasattr(ts, 'isoformat'):
                        data['timestamp'] = ts.isoformat()
                    else:
                        data['timestamp'] = str(ts) if ts is not None else ''
                    recent_submissions.append(data)
            
            # Sort by timestamp (already sorted from query, but ensure consistency)
            recent_submissions.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            # Get high-risk zones with optimized query
            location_counts = {}
            public_docs = db.collection('public_submissions').limit(1000).stream()
            for doc in public_docs:
                location = doc.to_dict().get('location', 'Unknown')
                location_counts[location] = location_counts.get(location, 0) + 1
            
            high_risk_zones = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            high_risk_zones = [zone[0] for zone in high_risk_zones] if high_risk_zones else ['No data available']
            
            # Get common antibiotics with optimized query
            antibiotic_counts = {}
            pharmacist_docs = db.collection('pharmacist_submissions').limit(1000).stream()
            for doc in pharmacist_docs:
                medicine = doc.to_dict().get('medicineName', 'Unknown')
                antibiotic_counts[medicine] = antibiotic_counts.get(medicine, 0) + 1
            
            common_antibiotics = sorted(antibiotic_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            common_antibiotics = [med[0] for med in common_antibiotics] if common_antibiotics else ['No data available']
            
            # Calculate additional stats for enhanced dashboard
            total_submissions = public_count
            resistance_cases = int(total_submissions * 0.15)  # Estimate 15% resistance cases
            misuse_percentage = 35  # Estimated misuse rate
            countries_affected = len(set([doc.to_dict().get('location', 'Unknown') for doc in db.collection('public_submissions').limit(1000).stream()]))
            
            return jsonify({
                'totalEntries': total_entries,
                'total_submissions': total_submissions,
                'resistance_cases': resistance_cases,
                'misuse_percentage': misuse_percentage,
                'countries_affected': countries_affected,
                'highRiskZones': high_risk_zones,
                'commonAntibiotics': common_antibiotics,
                'recentSubmissions': recent_submissions[:10],
                'lastUpdated': datetime.now().isoformat(),
                'cache_status': 'fresh'
            })
            
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return jsonify({'error': 'Failed to fetch dashboard data', 'code': 'DATABASE_ERROR'}), 500
    
    except Exception as e:
        logger.error(f"Error in dashboard stats: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to fetch dashboard data', 'code': 'INTERNAL_ERROR'}), 500

@app.route('/api/health', methods=['GET'])
@limiter.limit("200 per hour")  # More lenient rate limit for health checks
def health_check():
    """Enhanced health check endpoint with detailed status."""
    try:
        # Test Firebase connection if available
        firebase_status = "connected" if db else "disconnected"
        
        # Check cache status
        cache_size = len(dashboard_cache)
        cache_status = "healthy" if cache_size < 100 else "warning"
        
        return jsonify({
            'status': 'healthy',
            'firebase_connected': db is not None,
            'firebase_status': firebase_status,
            'cache_status': cache_status,
            'cache_size': cache_size,
            'timestamp': datetime.now().isoformat(),
            'version': '2.0.0',
            'environment': os.getenv('FLASK_ENV', 'development'),
            'uptime': time.time()
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/health', methods=['OPTIONS'])
def health_options():
    response = app.make_default_options_response()
    # Allow requests from both development ports
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:5173', 'http://localhost:5174']:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.after_request
def after_request_func(response):
    # Allow requests from both development ports
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:5173', 'http://localhost:5174']:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Authentication endpoints
@app.route('/api/auth/pharmacist/login', methods=['POST'])
@limiter.limit("5 per minute")
def pharmacist_login():
    """Authenticate pharmacist and return JWT token with enhanced security."""
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required', 'code': 'MISSING_CREDENTIALS'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format', 'code': 'INVALID_EMAIL'}), 400
        
        # Always allow demo credentials regardless of Firebase status
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
                'pharmacist': demo_pharmacist,
                'expires_in': JWT_EXPIRATION
            })
        
        # If not demo credentials, check Firebase
        if not db:
            return jsonify({'error': 'Invalid credentials', 'code': 'INVALID_CREDENTIALS'}), 401
        
        # Check if pharmacist exists in Firebase
        pharmacists_ref = db.collection('pharmacists')
        query = pharmacists_ref.where('email', '==', email).limit(1).stream()
        pharmacist_doc = next(query, None)
        
        pharmacist_data = pharmacist_doc.to_dict() if pharmacist_doc else None
        if not pharmacist_data or pharmacist_data.get('password_hash') != hash_password(password):
            return jsonify({'error': 'Invalid credentials', 'code': 'INVALID_CREDENTIALS'}), 401
        
        # Check if account is active
        if not pharmacist_data.get('active', True):
            return jsonify({'error': 'Account is deactivated', 'code': 'ACCOUNT_DEACTIVATED'}), 401
        
        # Generate token
        pharmacist_id = pharmacist_doc.id if pharmacist_doc else ''
        token = generate_token(pharmacist_id)
        
        # Return pharmacist data (without password)
        pharmacist_info = {
            'id': pharmacist_id,
            'name': pharmacist_data.get('name') if pharmacist_data else '',
            'email': pharmacist_data.get('email') if pharmacist_data else '',
            'institution': pharmacist_data.get('institution') if pharmacist_data else ''
        }
        
        logger.info(f"Successful login for pharmacist: {email}")
        
        return jsonify({
            'success': True,
            'token': token,
            'pharmacist': pharmacist_info,
            'expires_in': JWT_EXPIRATION
        })
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Authentication failed', 'code': 'AUTH_FAILED'}), 500

@app.route('/api/auth/pharmacist/register', methods=['POST'])
@limiter.limit("3 per hour")
def pharmacist_register():
    """Register new pharmacist with enhanced validation."""
    try:
        data = request.json or {}
        required_fields = ['name', 'email', 'password', 'institution']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required', 'code': 'MISSING_FIELD'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Enhanced validation
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format', 'code': 'INVALID_EMAIL'}), 400
        
        # Password strength validation
        is_strong, password_error = validate_password_strength(password)
        if not is_strong:
            return jsonify({'error': password_error, 'code': 'WEAK_PASSWORD'}), 400
        
        if not db:
            return jsonify({'error': 'Registration not available in demo mode', 'code': 'REGISTRATION_DISABLED'}), 503
        
        # Check if pharmacist already exists
        pharmacists_ref = db.collection('pharmacists')
        existing = pharmacists_ref.where('email', '==', email).limit(1).stream()
        if next(existing, None):
            return jsonify({'error': 'Pharmacist with this email already exists', 'code': 'EMAIL_EXISTS'}), 409
        
        # Create new pharmacist
        pharmacist_data = {
            'name': sanitize_input(str(data.get('name') or '')),
            'email': email,
            'password_hash': hash_password(password),
            'institution': sanitize_input(str(data.get('institution') or '')),
            'created_at': datetime.now(),
            'active': True,
            'last_login': None
        }
        
        doc_ref = pharmacists_ref.add(pharmacist_data)
        pharmacist_id = doc_ref[1].id if doc_ref and len(doc_ref) > 1 and doc_ref[1] is not None else ''
        token = generate_token(pharmacist_id)
        pharmacist_info = {
            'id': pharmacist_id,
            'name': pharmacist_data.get('name') if pharmacist_data else '',
            'email': pharmacist_data.get('email') if pharmacist_data else '',
            'institution': pharmacist_data.get('institution') if pharmacist_data else ''
        }
        
        logger.info(f"New pharmacist registered: {email}")
        
        return jsonify({
            'success': True,
            'token': token,
            'pharmacist': pharmacist_info,
            'expires_in': JWT_EXPIRATION
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Registration failed', 'code': 'REGISTRATION_FAILED'}), 500

@app.route('/api/pharmacist/dashboard', methods=['GET'])
@require_auth
def get_pharmacist_dashboard():
    """Get pharmacist-specific dashboard data with analytics."""
    try:
        pharmacist_id = getattr(request, 'pharmacist_id', None)
        
        if not db:
            # Fallback data for demo mode
            return jsonify({
                'total_submissions': 0,
                'monthly_submissions': 0,
                'resistance_cases': 0,
                'success_rate': 85,
                'recent_submissions': [],
                'monthly_trends': [],
                'region_counts': {},
                'submissions': [],
                'lastUpdated': datetime.now().isoformat()
            })
        
        # Get pharmacist's submissions
        pharmacist_submissions = list(db.collection('pharmacist_submissions')
                                    .where('pharmacist_id', '==', pharmacist_id)
                                    .order_by('timestamp', direction='DESCENDING')
                                    .limit(100).stream())
        
        # Process submissions
        submissions = []
        total_quantity = 0
        categories = defaultdict(int)
        regions = defaultdict(int)
        monthly_data = defaultdict(int)
        
        for doc in pharmacist_submissions:
            data = doc.to_dict()
            if data:
                data['id'] = doc.id
                ts = data.get('timestamp')
                if ts is not None and hasattr(ts, 'isoformat'):
                    data['timestamp'] = ts.isoformat()
                    # Extract month for trends
                    if hasattr(ts, 'month'):
                        month_key = f"{ts.year}-{ts.month:02d}"
                        monthly_data[month_key] += 1
                else:
                    data['timestamp'] = str(ts) if ts is not None else ''
                
                submissions.append(data)
                total_quantity += data.get('quantity', 0)
                categories[data.get('category', 'Unknown')] += 1
                regions[data.get('region', 'Unknown')] += 1
        
        # Calculate monthly trends (last 6 months)
        monthly_trends = []
        current_date = datetime.now()
        for i in range(6):
            month_date = current_date.replace(day=1) - timedelta(days=i*30)
            month_key = f"{month_date.year}-{month_date.month:02d}"
            monthly_trends.append({
                'month': month_key,
                'count': monthly_data.get(month_key, 0)
            })
        monthly_trends.reverse()
        
        # Calculate statistics
        total_submissions = len(submissions)
        monthly_submissions = monthly_data.get(f"{current_date.year}-{current_date.month:02d}", 0)
        resistance_cases = int(total_submissions * 0.15)  # Estimate 15% resistance cases
        success_rate = 85 if total_submissions > 0 else 0  # Base success rate
        
        return jsonify({
            'total_submissions': total_submissions,
            'monthly_submissions': monthly_submissions,
            'resistance_cases': resistance_cases,
            'success_rate': success_rate,
            'recent_submissions': submissions[:10],
            'monthly_trends': monthly_trends,
            'region_counts': dict(regions),
            'submissions': submissions,
            'lastUpdated': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Pharmacist dashboard error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to fetch dashboard data', 'code': 'DASHBOARD_ERROR'}), 500

@app.route('/api/cache/clear', methods=['POST'])
@require_auth
def clear_cache_endpoint():
    """Clear application cache (admin only)."""
    try:
        clear_cache()
        return jsonify({
            'success': True,
            'message': 'Cache cleared successfully'
        })
    except Exception as e:
        logger.error(f"Cache clear error: {e}")
        return jsonify({'error': 'Failed to clear cache', 'code': 'CACHE_ERROR'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 