# AMR-X - Antimicrobial Resistance Tracking Platform

A next-generation platform to track, analyze, and combat Antimicrobial Resistance (AMR) worldwide.

## Features

- 🌍 **Public Form**: Submit symptom and medication data
- 💊 **Pharmacist Upload**: Log prescriptions and batch uploads
- 📊 **Dynamic Dashboard**: Real-time statistics and visualizations
- 🌙 **Light/Dark Mode**: Modern theme switching
- 📱 **Responsive Design**: Works on all devices
- 🔄 **Real-time Updates**: Live data from backend API

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup
```bash
cd amrx
npm install
npm run dev
```
Frontend will run at: http://localhost:5173

### Backend Setup
```bash
cd amrx-backend
npm install
npm start
```
Backend will run at: http://localhost:4000

## Deployment Guide

### Frontend Deployment Options

#### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from amrx directory
cd amrx
vercel

# Follow prompts and deploy
```

#### 2. Netlify
```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
# Or connect GitHub repository for auto-deploy
```

#### 3. GitHub Pages
```bash
# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run build
npm run deploy
```

### Backend Deployment Options

#### 1. Railway
- Connect GitHub repository
- Set environment variables
- Auto-deploys on push

#### 2. Render
- Connect GitHub repository
- Set build command: `npm install`
- Set start command: `npm start`

#### 3. Heroku
```bash
# Install Heroku CLI
# Create Procfile with: web: node server.js
# Deploy with: git push heroku main
```

### Environment Variables

For production, update the API URL in `src/App.jsx`:
```javascript
// Change from localhost to your backend URL
const API_BASE_URL = 'https://your-backend-url.com';
```

## Project Structure

```
pro/
├── amrx/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx      # Main application
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Global styles
│   ├── public/          # Static assets
│   └── dist/           # Build output
└── amrx-backend/        # Backend (Node.js + Express)
    ├── server.js       # Main server file
    ├── uploads/        # File uploads directory
    └── package.json    # Backend dependencies
```

## API Endpoints

- `POST /api/public` - Submit public form data
- `POST /api/pharmacist` - Submit pharmacist data
- `POST /api/pharmacist/csv` - Upload CSV batch file
- `GET /api/dashboard` - Get dashboard statistics

## Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if port 4000 is available
   - Ensure all dependencies are installed
   - Check Node.js version

2. **Frontend build fails**
   - Clear node_modules and reinstall
   - Check for syntax errors in App.jsx
   - Ensure all imports are correct

3. **API connection issues**
   - Verify backend is running on port 4000
   - Check CORS settings
   - Update API URLs for production

### Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
npm start            # Start with nodemon
node server.js       # Start without nodemon
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2025 AMR-X. All rights reserved.

---

**Note**: This platform does not provide medical advice. For prescriptions, please consult a registered doctor.
