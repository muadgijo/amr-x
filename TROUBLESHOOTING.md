# AMR-X Troubleshooting Guide

## Common Issues and Solutions

### 1. Authentication Problems

**Symptoms:**
- Multiple "AuthProvider render" messages in console
- Login not working
- User state not persisting

**Solutions:**
- Clear browser cache and localStorage
- Check if backend is running on port 5000
- Verify JWT token expiration
- Use the new `start-fixed.bat` script

### 2. Port/Connectivity Issues

**Symptoms:**
- "Connection Lost" indicator appears
- API calls failing
- Backend not responding

**Solutions:**
- Ensure backend is running: `python app.py` in `amrx-flask-backend`
- Check if port 5000 is available: `netstat -ano | findstr :5000`
- Kill conflicting processes: `taskkill /F /PID <PID>`
- Use the new startup script: `start-fixed.bat`

### 3. Multiple Render Cycles

**Symptoms:**
- Performance issues
- Excessive console logging
- UI lag

**Solutions:**
- Updated components use `useCallback` and `useMemo`
- AuthProvider now prevents multiple initializations
- Background components are memoized

### 4. Data Management Issues

**Symptoms:**
- Form data not saving
- Dashboard not loading
- File uploads failing

**Solutions:**
- Check Firebase configuration
- Verify API endpoints are working
- Clear browser cache
- Check network connectivity

## Quick Fix Commands

### Windows
```batch
# Kill all Python processes
taskkill /F /IM python.exe

# Kill all Node processes
taskkill /F /IM node.exe

# Check ports
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Start fresh
start-fixed.bat
```

### Linux/Mac
```bash
# Kill processes on ports
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Check ports
lsof -i :5000
lsof -i :5173
```

## Environment Setup

### Required Software
- Python 3.8+
- Node.js 16+
- npm or yarn

### Environment Variables
Create `.env` file in `amrx/`:
```
VITE_API_URL=http://localhost:5000
```

### Backend Dependencies
```bash
cd amrx-flask-backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Frontend Dependencies
```bash
cd amrx
npm install
```

## Debug Mode

Enable debug logging by setting in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Health Check Endpoints

- Backend Health: `http://localhost:5000/api/health`
- Frontend: `http://localhost:5173`

## Common Error Codes

- `401`: Authentication required
- `403`: Forbidden
- `404`: Not found
- `429`: Rate limit exceeded
- `500`: Internal server error
- `503`: Service unavailable

## Performance Optimization

1. **Use the new startup script** - `start-fixed.bat`
2. **Clear browser cache** regularly
3. **Monitor connection status** indicator
4. **Check console for errors** in browser dev tools

## Support

If issues persist:
1. Check the console logs
2. Verify both services are running
3. Test API endpoints directly
4. Clear all browser data
5. Restart both services

## Recent Fixes Applied

1. **AuthProvider**: Fixed multiple render cycles with `useCallback` and `useMemo`
2. **API Service**: Added connection health checks and better error handling
3. **App Component**: Improved state management and memoization
4. **Startup Script**: Created `start-fixed.bat` with proper dependency checking
5. **Connection Status**: Added visual indicator for connectivity issues 