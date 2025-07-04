# 🦠 AMR-X: Antimicrobial Resistance Tracker

A comprehensive platform to track, analyze, and combat Antimicrobial Resistance (AMR) worldwide.

## 🚀 Features

- **Public Symptom Submission** - Citizens can report symptoms and antibiotic usage
- **Pharmacist Prescription Logging** - Healthcare professionals log prescriptions
- **Real-time Dashboard** - Analytics and insights on AMR trends
- **Firebase Integration** - Secure, scalable data storage
- **Modern UI/UX** - Beautiful, responsive interface with dark/light mode
- **Security Features** - Input validation, rate limiting, and data sanitization

## 🏗️ Architecture

- **Frontend**: React + Vite (localhost:5173)
- **Backend**: Flask + Firebase (localhost:5000)
- **Database**: Firebase Firestore
- **Security**: Rate limiting, input validation, CORS protection

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Firebase account
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd amrx-project
```

### 2. Backend Setup (Flask + Firebase)

```bash
cd amrx-flask-backend

# Install Python dependencies
pip install -r requirements.txt

# Set up Firebase
# 1. Go to Firebase Console: https://console.firebase.google.com/
# 2. Create a new project
# 3. Enable Firestore Database (test mode)
# 4. Download service account key as 'serviceAccountKey.json'
# 5. Place it in amrx-flask-backend/

# Create environment file
echo "FLASK_ENV=development" > .env
echo "FLASK_DEBUG=True" >> .env
echo "PORT=5000" >> .env

# Start backend server
python app.py
```

### 3. Frontend Setup (React)

```bash
cd amrx

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔒 Security Features

### Backend Security
- **Rate Limiting**: Prevents spam and abuse
  - Public submissions: 10 per minute
  - Pharmacist uploads: 20 per minute
  - Dashboard access: 100 per hour
- **Input Validation**: Regex patterns for all inputs
- **Data Sanitization**: Removes dangerous characters
- **CORS Protection**: Restricted origins
- **Length Limits**: Prevents oversized data

### Data Protection
- **Firebase Security Rules**: Database-level protection
- **Environment Variables**: Sensitive config protection
- **Input Sanitization**: XSS prevention
- **IP Logging**: Audit trail for submissions

## 📊 API Endpoints

### Public Form
```http
POST /api/public
Content-Type: application/json

{
  "symptoms": "string",
  "medication": "string",
  "duration": "number",
  "location": "string"
}
```

### Pharmacist Upload
```http
POST /api/pharmacist
Content-Type: application/json

{
  "medicineName": "string",
  "category": "string",
  "quantity": "number",
  "region": "string"
}
```

### Dashboard Stats
```http
GET /api/dashboard
```

### Health Check
```http
GET /api/health
```

## 👥 Team Collaboration

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes & Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

3. **Push & Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### Code Review Checklist
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Error handling implemented
- [ ] Tests added (if applicable)
- [ ] Documentation updated
- [ ] No sensitive data in commits

## 🔧 Development

### Project Structure
```
amrx-project/
├── amrx/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── amrx-flask-backend/   # Flask backend
│   ├── app.py
│   ├── requirements.txt
│   └── serviceAccountKey.json
├── .gitignore
└── README.md
```

### Environment Variables

#### Backend (.env)
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
SECRET_KEY=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Adding New Features

1. **Backend Changes**
   - Add new routes in `app.py`
   - Update validation patterns
   - Add rate limiting if needed
   - Update requirements.txt

2. **Frontend Changes**
   - Add new components in `src/`
   - Update API calls
   - Add form validation
   - Update styling

3. **Database Changes**
   - Update Firebase security rules
   - Add new collections if needed
   - Update data validation

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Set production Firebase project
- [ ] Configure CORS for production domain
- [ ] Set up proper logging
- [ ] Configure monitoring
- [ ] Test all endpoints
- [ ] Update documentation

### Deployment Options
- **Heroku**: Easy deployment with Procfile
- **AWS**: EC2 or Lambda + API Gateway
- **Google Cloud**: App Engine or Cloud Run
- **Vercel**: Frontend deployment
- **Netlify**: Alternative frontend hosting

## 🧪 Testing

### Manual Testing
1. **Public Form**: Submit test data
2. **Pharmacist Upload**: Log prescriptions
3. **Dashboard**: Verify statistics
4. **Security**: Test rate limits and validation

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test public submission
curl -X POST http://localhost:5000/api/public \
  -H "Content-Type: application/json" \
  -d '{"symptoms":"fever","medication":"amoxicillin","duration":7,"location":"New York"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check `serviceAccountKey.json` exists
   - Verify Firebase project settings
   - Check network connectivity

2. **CORS Errors**
   - Verify frontend URL in CORS configuration
   - Check browser console for details

3. **Rate Limiting**
   - Wait for rate limit to reset
   - Check rate limit headers in response

4. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes

### Debug Mode
```bash
# Backend debug
export FLASK_DEBUG=True
python app.py

# Frontend debug
npm run dev -- --debug
```

## 📈 Future Enhancements

### Planned Features
- [ ] User authentication system
- [ ] Advanced analytics dashboard
- [ ] Geographic mapping
- [ ] AI/ML integration for predictions
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Data export functionality
- [ ] Multi-language support

### AI/ML Integration
- Resistance prediction models
- Geographic hotspot detection
- Treatment recommendation engine
- Anomaly detection algorithms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**AMR-X Team** 🦠 | **Version 1.0.0** | **Last Updated: 2025** 