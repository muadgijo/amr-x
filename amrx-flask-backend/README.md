# AMR-X Flask Backend with Firebase

A Flask-based backend for the AMR-X application with Firebase Firestore database integration.

## Features

- 🔥 **Firebase Firestore Integration**: Real-time database
- 🐍 **Flask API**: RESTful endpoints
- 🔒 **Data Validation**: Input validation and error handling
- 📊 **Dashboard Analytics**: Real-time statistics
- 🌐 **CORS Support**: Cross-origin requests
- 📝 **Logging**: Comprehensive error logging

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Firebase Setup

#### Option A: Service Account Key (Recommended for Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file and rename it to `serviceAccountKey.json`
6. Place it in the `amrx-flask-backend/` directory

#### Option B: Environment Variables (Recommended for Production)

Set these environment variables:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
export FIREBASE_PROJECT_ID="your-project-id"
```

### 3. Environment Variables

Create a `.env` file:
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

### 4. Run the Server

```bash
python app.py
```

The server will run on: http://localhost:5000

## API Endpoints

### Public Form Submission
```
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
```
POST /api/pharmacist
Content-Type: application/json

{
  "medicineName": "string",
  "category": "string",
  "quantity": "number",
  "region": "string"
}
```

### Dashboard Statistics
```
GET /api/dashboard
```

Returns:
```json
{
  "totalEntries": 123,
  "highRiskZones": ["New York", "Delhi", "Lagos"],
  "commonAntibiotics": ["Amoxicillin", "Ciprofloxacin", "Azithromycin"],
  "recentSubmissions": [...]
}
```

### Health Check
```
GET /api/health
```

## Database Structure

### Collections

#### public_submissions
- symptoms (string)
- medication (string)
- duration (number)
- location (string)
- timestamp (datetime)
- type (string) = "public"

#### pharmacist_submissions
- medicineName (string)
- category (string)
- quantity (number)
- region (string)
- timestamp (datetime)
- type (string) = "pharmacist"

## Deployment

### Local Development
```bash
python app.py
```

### Production (Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Error Handling

The API includes comprehensive error handling:
- Input validation
- Database connection errors
- Firebase authentication errors
- Graceful fallbacks when Firebase is unavailable

## Security

- Input validation on all endpoints
- CORS configuration
- Environment variable management
- Service account key protection

## Monitoring

- Health check endpoint
- Firebase connection status
- Error logging
- Request/response logging 