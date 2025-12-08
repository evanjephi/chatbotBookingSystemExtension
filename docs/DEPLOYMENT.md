# Firebase & Deployment Guide

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `psw-booking-system`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose location (closest to your users)
4. Start in "Production mode"
5. Create database

**Security Rules (initial):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /clients/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /psws/{pswId} {
      allow read: if true;
      allow write: if request.auth.uid == pswId;
    }
    
    match /bookings/{bookingId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }
    
    match /conversations/{conversationId} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

### 3. Enable Firebase Authentication

1. Go to "Build" → "Authentication"
2. Click "Get started"
3. Enable sign-in methods:
   - Email/Password
   - Google (optional)
   - Phone (optional)

### 4. Create Service Account

1. Go to "Project Settings" → "Service Accounts"
2. Click "Generate new private key"
3. Save JSON file securely
4. Extract values for `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 5. Initialize Firestore Collections

Create empty collections:
- `clients`
- `psws`
- `bookings`
- `conversations`

### 6. Add Sample Data

**Sample PSW Profile:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "555-0123",
  "location": {
    "latitude": 43.6532,
    "longitude": -79.3832,
    "postalCode": "M5H 2N2",
    "address": "123 King St W, Toronto"
  },
  "certifications": ["CPR Certification", "First Aid", "Dementia Care"],
  "ratings": 4.8,
  "reviewCount": 45,
  "availableTimeSlots": [
    {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "date": "2024-01-16",
      "startTime": "10:00",
      "endTime": "14:00"
    }
  ],
  "serviceTypes": ["General Support", "Companion Care", "Personal Hygiene"]
}
```

## Deployment

### Frontend Deployment (Vercel/Netlify)

#### Using Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import GitHub repository
5. Set environment variables:
   - `VITE_API_URL`
   - `VITE_GOOGLE_MAPS_API_KEY`
6. Deploy

#### Using Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect GitHub and select repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables
7. Deploy

### Backend Deployment (Firebase Cloud Run / Heroku)

#### Using Firebase Cloud Run

```bash
# Login to Firebase
firebase login

# Initialize Cloud Run
firebase init functions

# Deploy
firebase deploy --only functions
```

#### Using Heroku

1. Create Heroku account at [heroku.com](https://heroku.com)

```bash
# Login to Heroku CLI
heroku login

# Create app
heroku create psw-booking-api

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_PRIVATE_KEY="$(cat path/to/key.json | grep private_key | cut -d '"' -f 4)"
heroku config:set FIREBASE_CLIENT_EMAIL=your-email
heroku config:set OPENAI_API_KEY=your-api-key
heroku config:set GOOGLE_MAPS_API_KEY=your-maps-key

# Deploy
git push heroku main
```

#### Using Google Cloud Run

```bash
# Authenticate
gcloud auth login

# Build Docker image
docker build -t psw-booking-api .

# Push to Container Registry
docker tag psw-booking-api gcr.io/PROJECT_ID/psw-booking-api
docker push gcr.io/PROJECT_ID/psw-booking-api

# Deploy to Cloud Run
gcloud run deploy psw-booking-api \
  --image gcr.io/PROJECT_ID/psw-booking-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars "FIREBASE_PROJECT_ID=your-id,..."
```

### Docker Deployment

**Backend Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist ./dist

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]
```

**Build and run:**

```bash
docker build -t psw-booking-api .
docker run -p 5000:5000 -e FIREBASE_PROJECT_ID=... psw-booking-api
```

### Environment Variables for Production

**Backend (.env.production):**
```env
FIREBASE_PROJECT_ID=production-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIzaSy...
BACKEND_PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

## Continuous Integration / Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install Backend Dependencies
      working-directory: ./backend
      run: npm install

    - name: Build Backend
      working-directory: ./backend
      run: npm run build

    - name: Install Frontend Dependencies
      working-directory: ./frontend
      run: npm install

    - name: Build Frontend
      working-directory: ./frontend
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
      run: npm run build

    - name: Deploy to Production
      env:
        FIREBASE_CREDENTIALS: ${{ secrets.FIREBASE_CREDENTIALS }}
      run: |
        echo $FIREBASE_CREDENTIALS | base64 -d > credentials.json
        firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

## Monitoring & Logging

### Firebase Console Monitoring

1. Go to "Build" → "Firestore Database"
2. Monitor:
   - Database usage
   - Read/write operations
   - Storage size

### Backend Logging

Use Firebase Cloud Logging:

```typescript
import admin from 'firebase-admin';

const logging = admin.logging();

function logEvent(message: string, severity = 'INFO') {
  const entry = logging.entry({ severity }, message);
  logging.write(entry);
}
```

### Error Tracking

Use Sentry for error tracking:

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Vite automatically does this
2. **Image Optimization**: Use WebP format
3. **Lazy Loading**: Implement for components
4. **Caching**: Set appropriate cache headers

### Backend Optimization

1. **Database Indexing**: Create Firestore indexes
2. **Connection Pooling**: Use connection pools
3. **Caching**: Implement Redis for frequent queries
4. **Load Balancing**: Use load balancers for multiple instances

### Firestore Indexes

Create composite indexes in Firebase Console:
- `psws`: Filter by location and serviceTypes
- `bookings`: Filter by clientId and status
- `conversations`: Filter by clientId and status

## Scaling Considerations

1. **Database**: Firestore auto-scales; no manual intervention needed
2. **API**: Deploy multiple backend instances behind load balancer
3. **AI Calls**: Implement request queuing for OpenAI API
4. **Geolocation**: Consider caching geocoding results
5. **Real-time Updates**: Firestore handles real-time subscriptions

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regular backups enabled
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Sensitive data encrypted
- [ ] Security headers set
- [ ] OWASP recommendations followed
- [ ] Regular security audits
- [ ] Incident response plan documented
