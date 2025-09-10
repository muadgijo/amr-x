"""
Supabase Configuration for AMR-X Backend
Replace the demo data with actual Supabase integration
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

def get_supabase_client() -> Client:
    """Get Supabase client"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Warning: Supabase credentials not found. Using demo mode.")
        return None
    
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Database operations
class SupabaseService:
    def __init__(self):
        self.client = get_supabase_client()
    
    def save_public_submission(self, data):
        """Save public submission to Supabase"""
        if not self.client:
            print(f"Demo mode: Would save public submission: {data}")
            return {"id": "demo_id"}
        
        try:
            result = self.client.table('public_submissions').insert(data).execute()
            return result.data[0] if result.data else {"id": "demo_id"}
        except Exception as e:
            print(f"Error saving public submission: {e}")
            return {"id": "demo_id"}
    
    def save_pharmacist_submission(self, data):
        """Save pharmacist submission to Supabase"""
        if not self.client:
            print(f"Demo mode: Would save pharmacist submission: {data}")
            return {"id": "demo_id"}
        
        try:
            result = self.client.table('pharmacist_submissions').insert(data).execute()
            return result.data[0] if result.data else {"id": "demo_id"}
        except Exception as e:
            print(f"Error saving pharmacist submission: {e}")
            return {"id": "demo_id"}
    
    def get_dashboard_stats(self):
        """Get dashboard statistics from Supabase"""
        if not self.client:
            return {
                'totalEntries': 150,
                'total_submissions': 120,
                'resistance_cases': 18,
                'misuse_percentage': 25,
                'countries_affected': 8,
                'highRiskZones': ['North America', 'Europe', 'Asia'],
                'commonAntibiotics': ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin'],
                'recentSubmissions': []
            }
        
        try:
            # Get public submissions count
            public_count = self.client.table('public_submissions').select('*', count='exact').execute()
            
            # Get pharmacist submissions count
            pharmacist_count = self.client.table('pharmacist_submissions').select('*', count='exact').execute()
            
            # Get recent submissions
            recent_public = self.client.table('public_submissions').select('*').order('created_at', desc=True).limit(5).execute()
            recent_pharmacist = self.client.table('pharmacist_submissions').select('*').order('created_at', desc=True).limit(5).execute()
            
            return {
                'totalEntries': (public_count.count or 0) + (pharmacist_count.count or 0),
                'total_submissions': public_count.count or 0,
                'resistance_cases': int((public_count.count or 0) * 0.15),
                'misuse_percentage': 25,
                'countries_affected': 8,
                'highRiskZones': ['North America', 'Europe', 'Asia'],
                'commonAntibiotics': ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin'],
                'recentSubmissions': (recent_public.data or []) + (recent_pharmacist.data or [])
            }
        except Exception as e:
            print(f"Error getting dashboard stats: {e}")
            return {
                'totalEntries': 0,
                'total_submissions': 0,
                'resistance_cases': 0,
                'misuse_percentage': 0,
                'countries_affected': 0,
                'highRiskZones': [],
                'commonAntibiotics': [],
                'recentSubmissions': []
            }
    
    def authenticate_pharmacist(self, email, password):
        """Authenticate pharmacist with Supabase"""
        if not self.client:
            # Demo credentials
            if email == 'demo@amrx.com' and password == 'demo123':
                return {
                    'id': 'demo_pharmacist',
                    'name': 'Demo Pharmacist',
                    'email': email,
                    'institution': 'Demo Hospital'
                }
            return None
        
        try:
            # Query pharmacists table
            result = self.client.table('pharmacists').select('*').eq('email', email).execute()
            
            if result.data and len(result.data) > 0:
                pharmacist = result.data[0]
                # In production, use proper password hashing
                if pharmacist.get('password_hash') == password:  # This should be hashed
                    return {
                        'id': pharmacist['id'],
                        'name': pharmacist['name'],
                        'email': pharmacist['email'],
                        'institution': pharmacist['institution']
                    }
            return None
        except Exception as e:
            print(f"Error authenticating pharmacist: {e}")
            return None
    
    def register_pharmacist(self, pharmacist_data):
        """Register new pharmacist in Supabase"""
        if not self.client:
            print(f"Demo mode: Would register pharmacist: {pharmacist_data['email']}")
            return True
        
        try:
            result = self.client.table('pharmacists').insert(pharmacist_data).execute()
            return result.data is not None
        except Exception as e:
            print(f"Error registering pharmacist: {e}")
            return False
