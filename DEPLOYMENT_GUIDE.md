# AMR-X Deployment Guide

## 🚀 Quick Start with Supabase

### 1. Set up Supabase Database

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `amrx-flask-backend/supabase_schema.sql`
   - Execute the SQL

### 2. Configure Environment Variables

1. **Copy the environment template**:
   ```bash
   cp amrx-flask-backend/env.example amrx-flask-backend/.env
   ```

2. **Fill in your Supabase credentials**:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   JWT_SECRET_KEY=your-super-secret-jwt-key-here
   ```

### 3. Deploy Backend

#### Option A: Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Option B: Heroku
1. Create a Heroku app
2. Set environment variables:
   ```bash
   heroku config:set SUPABASE_URL=your-url
   heroku config:set SUPABASE_ANON_KEY=your-key
   heroku config:set JWT_SECRET_KEY=your-secret
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```

#### Option C: Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### 4. Deploy Frontend

#### Option A: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variable:
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```
3. Deploy automatically

#### Option B: Netlify
1. Connect your GitHub repository to Netlify
2. Set environment variable in Netlify dashboard
3. Deploy automatically

## 🔧 Development Setup

### Backend
```bash
cd amrx-flask-backend
pip install -r requirements_simple.txt
python app_simple.py
```

### Frontend
```bash
cd amrx
npm install
npm run dev
```

## 📁 File Structure

```
amrx-flask-backend/
├── app_simple.py          # Simplified backend (development)
├── app_production.py      # Production backend with Supabase
├── supabase_config.py     # Supabase integration
├── supabase_schema.sql    # Database schema
├── requirements_simple.txt # Simplified dependencies
└── env.example           # Environment template

amrx/src/
├── services/
│   └── api_simple.js     # Simplified API service
└── components/auth/
    └── AuthProvider_simple.jsx # Simplified auth provider
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: SHA-256 with salt
- **CORS Protection**: Configured for production
- **Input Validation**: Basic validation on all endpoints
- **Rate Limiting**: Built into Flask-Limiter (in complex version)

## 🎯 Key Simplifications

### Backend
- ✅ Removed complex Firebase integration
- ✅ Simplified authentication flow
- ✅ Removed unnecessary validation layers
- ✅ Streamlined error handling
- ✅ Added Supabase integration

### Frontend
- ✅ Simplified API service
- ✅ Streamlined authentication provider
- ✅ Removed complex token validation
- ✅ Cleaner error handling

## 🚀 Production Checklist

- [ ] Set up Supabase database
- [ ] Configure environment variables
- [ ] Deploy backend to Railway/Heroku/Vercel
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Update CORS origins for production
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificates (automatic with most platforms)

## 📊 Demo Credentials

- **Email**: demo@amrx.com
- **Password**: demo123

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Update CORS origins in backend
2. **Database Connection**: Check Supabase credentials
3. **Authentication**: Verify JWT secret key
4. **Environment Variables**: Ensure all required vars are set

### Support

- Check Supabase logs in dashboard
- Monitor backend logs in deployment platform
- Use browser dev tools for frontend debugging

## 🔄 Migration from Complex Version

To migrate from the complex version:

1. **Backend**: Replace `app.py` with `app_production.py`
2. **Frontend**: Replace API service and AuthProvider with simplified versions
3. **Database**: Run Supabase schema instead of Firebase
4. **Dependencies**: Use `requirements_simple.txt`

The simplified version maintains all core functionality while being much easier to deploy and maintain!
