# 🚀 AMR-X Deployment Guide

This guide will help you deploy your AMR-X application to production.

## 📋 Prerequisites

- GitHub repository with your code
- Firebase project set up
- Environment variables ready

## 🎯 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

#### Frontend Deployment (Vercel)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `amrx`
   - Add environment variable:
     - Name: `VITE_API_URL`
     - Value: `https://your-backend-url.railway.app` (you'll get this after backend deployment)
   - Click "Deploy"

#### Backend Deployment (Railway)

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `amrx-flask-backend`

2. **Add Environment Variables**
   - Go to your project settings
   - Add all Firebase environment variables from your `config.env` file
   - Add: `FLASK_ENV=production`

3. **Deploy**
   - Railway will automatically detect it's a Python app
   - It will install dependencies and start the server

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)

1. **Build your React app**
   ```bash
   cd amrx
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `amrx/dist` folder
   - Or connect your GitHub repository
   - Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`

#### Backend Deployment (Render)

1. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Set root directory to `amrx-flask-backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
   - Add environment variables

### Option 3: Heroku (Both Frontend & Backend)

1. **Install Heroku CLI**
   ```bash
   # Download from heroku.com
   ```

2. **Deploy Backend**
   ```bash
   cd amrx-flask-backend
   heroku create your-amrx-backend
   heroku config:set FIREBASE_PROJECT_ID=your-project-id
   # Add all other Firebase environment variables
   git push heroku main
   ```

3. **Deploy Frontend**
   ```bash
   cd amrx
   heroku create your-amrx-frontend
   heroku config:set VITE_API_URL=https://your-amrx-backend.herokuapp.com
   git push heroku main
   ```

## 🔧 Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
FLASK_ENV=production
SECRET_KEY=your-secret-key
```

## 🌐 Custom Domain Setup

1. **Buy a domain** (GoDaddy, Namecheap, etc.)
2. **Configure DNS** to point to your deployment URLs
3. **Add custom domain** in your hosting platform settings

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real user metrics
- Error tracking

### Firebase Analytics
- User behavior tracking
- Performance monitoring
- Crash reporting

## 🔒 Security Checklist

- [ ] Environment variables are set
- [ ] Firebase security rules configured
- [ ] CORS settings updated for production
- [ ] HTTPS enabled
- [ ] API rate limiting implemented
- [ ] Input validation active

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS settings in backend
   - Check environment variables

2. **Firebase Connection Issues**
   - Verify environment variables
   - Check Firebase project settings

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Railway: [railway.app/docs](https://railway.app/docs)
- Render: [render.com/docs](https://render.com/docs)

## 🎉 Success!

Once deployed, your AMR-X app will be available at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`

Share these URLs with your team and start collecting AMR data! 🦠📊 