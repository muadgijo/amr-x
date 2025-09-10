-- AMR-X Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create public_submissions table
CREATE TABLE IF NOT EXISTS public_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symptoms TEXT NOT NULL,
    medication TEXT NOT NULL,
    duration INTEGER NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pharmacist_submissions table
CREATE TABLE IF NOT EXISTS pharmacist_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    region TEXT NOT NULL,
    pharmacist_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pharmacists table
CREATE TABLE IF NOT EXISTS pharmacists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    institution TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_submissions_created_at ON public_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_public_submissions_location ON public_submissions(location);
CREATE INDEX IF NOT EXISTS idx_pharmacist_submissions_created_at ON pharmacist_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_pharmacist_submissions_pharmacist_id ON pharmacist_submissions(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_pharmacist_submissions_region ON pharmacist_submissions(region);
CREATE INDEX IF NOT EXISTS idx_pharmacists_email ON pharmacists(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Public submissions are readable by everyone
CREATE POLICY "Public submissions are viewable by everyone" ON public_submissions
    FOR SELECT USING (true);

-- Public submissions can be inserted by anyone
CREATE POLICY "Anyone can insert public submissions" ON public_submissions
    FOR INSERT WITH CHECK (true);

-- Pharmacist submissions are only viewable by the pharmacist who created them
CREATE POLICY "Pharmacist submissions are viewable by owner" ON pharmacist_submissions
    FOR SELECT USING (pharmacist_id = current_setting('app.current_user_id', true));

-- Pharmacist submissions can be inserted by authenticated users
CREATE POLICY "Authenticated users can insert pharmacist submissions" ON pharmacist_submissions
    FOR INSERT WITH CHECK (pharmacist_id = current_setting('app.current_user_id', true));

-- Pharmacists can only view their own data
CREATE POLICY "Pharmacists can view own data" ON pharmacists
    FOR SELECT USING (id::text = current_setting('app.current_user_id', true));

-- Pharmacists can insert their own data
CREATE POLICY "Pharmacists can insert own data" ON pharmacists
    FOR INSERT WITH CHECK (true);

-- Create a function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalEntries', (
            SELECT COUNT(*) FROM public_submissions
        ) + (
            SELECT COUNT(*) FROM pharmacist_submissions
        ),
        'total_submissions', (
            SELECT COUNT(*) FROM public_submissions
        ),
        'resistance_cases', (
            SELECT COUNT(*) FROM public_submissions
        ) / 6, -- Estimate 1 in 6 cases show resistance
        'misuse_percentage', 25, -- Static estimate
        'countries_affected', (
            SELECT COUNT(DISTINCT location) FROM public_submissions
        ),
        'highRiskZones', (
            SELECT json_agg(location ORDER BY count DESC)
            FROM (
                SELECT location, COUNT(*) as count
                FROM public_submissions
                GROUP BY location
                ORDER BY count DESC
                LIMIT 3
            ) t
        ),
        'commonAntibiotics', (
            SELECT json_agg(medicine_name ORDER BY count DESC)
            FROM (
                SELECT medicine_name, COUNT(*) as count
                FROM pharmacist_submissions
                GROUP BY medicine_name
                ORDER BY count DESC
                LIMIT 3
            ) t
        ),
        'recentSubmissions', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'type', 'public',
                    'symptoms', symptoms,
                    'medication', medication,
                    'location', location,
                    'timestamp', created_at
                )
            )
            FROM (
                SELECT * FROM public_submissions
                ORDER BY created_at DESC
                LIMIT 5
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get pharmacist dashboard data
CREATE OR REPLACE FUNCTION get_pharmacist_dashboard(p_pharmacist_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_submissions', (
            SELECT COUNT(*) FROM pharmacist_submissions
            WHERE pharmacist_id = p_pharmacist_id
        ),
        'monthly_submissions', (
            SELECT COUNT(*) FROM pharmacist_submissions
            WHERE pharmacist_id = p_pharmacist_id
            AND created_at >= date_trunc('month', CURRENT_DATE)
        ),
        'resistance_cases', (
            SELECT COUNT(*) FROM pharmacist_submissions
            WHERE pharmacist_id = p_pharmacist_id
        ) / 6, -- Estimate
        'success_rate', 85, -- Static estimate
        'recent_submissions', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'medicine_name', medicine_name,
                    'category', category,
                    'quantity', quantity,
                    'region', region,
                    'timestamp', created_at
                )
            )
            FROM (
                SELECT * FROM pharmacist_submissions
                WHERE pharmacist_id = p_pharmacist_id
                ORDER BY created_at DESC
                LIMIT 10
            ) t
        ),
        'monthly_trends', (
            SELECT json_agg(
                json_build_object(
                    'month', month,
                    'count', count
                )
            )
            FROM (
                SELECT 
                    to_char(created_at, 'YYYY-MM') as month,
                    COUNT(*) as count
                FROM pharmacist_submissions
                WHERE pharmacist_id = p_pharmacist_id
                AND created_at >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY to_char(created_at, 'YYYY-MM')
                ORDER BY month
            ) t
        ),
        'region_counts', (
            SELECT json_object_agg(region, count)
            FROM (
                SELECT region, COUNT(*) as count
                FROM pharmacist_submissions
                WHERE pharmacist_id = p_pharmacist_id
                GROUP BY region
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert demo data
INSERT INTO pharmacists (name, email, password_hash, institution) VALUES
('Demo Pharmacist', 'demo@amrx.com', 'demo123', 'Demo Hospital')
ON CONFLICT (email) DO NOTHING;

-- Insert some sample public submissions
INSERT INTO public_submissions (symptoms, medication, duration, location) VALUES
('Fever, cough, chest pain', 'Amoxicillin', 7, 'North America'),
('Sore throat, difficulty swallowing', 'Azithromycin', 5, 'Europe'),
('Skin infection, redness', 'Ciprofloxacin', 10, 'Asia'),
('Urinary tract infection', 'Trimethoprim', 3, 'North America'),
('Respiratory infection', 'Penicillin', 7, 'Europe')
ON CONFLICT DO NOTHING;

-- Insert some sample pharmacist submissions
INSERT INTO pharmacist_submissions (medicine_name, category, quantity, region, pharmacist_id) VALUES
('Amoxicillin', 'penicillins', 100, 'North America', 'demo_pharmacist'),
('Azithromycin', 'macrolides', 50, 'Europe', 'demo_pharmacist'),
('Ciprofloxacin', 'fluoroquinolones', 75, 'Asia', 'demo_pharmacist')
ON CONFLICT DO NOTHING;
