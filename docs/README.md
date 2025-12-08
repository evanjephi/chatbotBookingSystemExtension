# PSW Booking System - Setup Guide

An intelligent AI-assisted Personal Support Worker (PSW) booking platform with a natural language chat interface.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Architecture](#architecture)

## Overview

This system enables clients to book PSW appointments through a conversational AI interface. The AI understands natural language requests, extracts booking details, and matches clients with available workers based on location, availability, and preferences.

## Features

- **AI-Powered Chat Interface**: Natural language conversation with GPT-4
- **Intelligent Matching**: Proximity-based PSW matching using geolocation
- **Real-time Availability**: Check PSW schedules in real-time
- **Booking Management**: Create, reschedule, and cancel appointments
- **Structured Data Extraction**: Automatically extract booking requirements from conversations
- **Role-Based System**: Separate flows for clients and PSWs
- **Firebase Integration**: Real-time database with Cloud Functions support

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast build and development
- **Zustand** for state management
- **Axios** for API calls
- **Google Maps API** for geolocation and visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Firebase Admin SDK** for database and authentication
- **OpenAI API** (GPT-4) for AI interactions
- **Google Maps API** for geolocation services

### Database & Services
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management
- **Firebase Cloud Functions** for serverless triggers
- **OpenAI API** for conversational AI
- **Google Maps API** for geolocation

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher) and npm/yarn installed
2. **Firebase Project** - Create one at [firebase.google.com](https://firebase.google.com)
3. **OpenAI API Key** - Get from [openai.com](https://openai.com)
4. **Google Maps API Key** - Get from [cloud.google.com](https://cloud.google.com)
5. **Git** for version control

## Installation

### 1. Clone and Setup Project

```bash
cd c:\Users\evanj\Documents\Projects\Web Dev\chatbotBookingSystemExtension

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

cd ..
```

### 2. Set Up Environment Variables

#### Backend Configuration

Create `backend/.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com

# API Keys
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIzaSy...

# Server Configuration
BACKEND_PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Configuration

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Enable Firebase Authentication
5. Generate a service account key:
   - Project Settings → Service Accounts
   - Generate new private key
   - Copy the JSON and use it for environment variables

### 4. Database Initialization

Create the initial Firestore collections and add sample data:

```bash
cd backend
node scripts/initializeDatabase.ts
```

## Running the Application

### Development Mode

In separate terminal windows:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm run preview
```

## API Documentation

### Chat Endpoints

#### Send Message
```
POST /api/chat/message
Content-Type: application/json

{
  "conversationId": "conv_123",
  "clientId": "client_456",
  "message": "I need a PSW on Monday morning"
}

Response:
{
  "conversationId": "conv_123",
  "aiMessage": "Great! I found PSWs available on Monday morning...",
  "extractedData": {
    "desiredDate": "2024-01-15",
    "desiredStartTime": "09:00",
    "desiredEndTime": "12:00",
    "isComplete": false,
    "confidence": 85
  },
  "suggestedPSWs": [
    {
      "id": "psw_123",
      "name": "John Doe",
      "ratings": 4.8,
      "reviewCount": 45,
      "certifications": ["CPR", "First Aid"],
      "serviceTypes": ["General Support", "Companion Care"]
    }
  ],
  "requiresConfirmation": false
}
```

#### Create Conversation
```
POST /api/chat/conversation
Content-Type: application/json

{
  "clientId": "client_456"
}

Response:
{
  "id": "conv_123",
  "clientId": "client_456",
  "status": "active"
}
```

#### Get Conversation
```
GET /api/chat/conversation/:conversationId

Response:
{
  "id": "conv_123",
  "clientId": "client_456",
  "messages": [...],
  "extractedData": {...},
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### PSW Endpoints

#### Get Available PSWs
```
POST /api/psw/available
Content-Type: application/json

{
  "location": {
    "latitude": 43.6532,
    "longitude": -79.3832,
    "postalCode": "M5H 2N2"
  },
  "radius": 15,
  "desiredDate": "2024-01-15",
  "startTime": "09:00",
  "endTime": "12:00",
  "serviceType": "General Support"
}

Response:
{
  "pswProfiles": [...],
  "totalCount": 5
}
```

#### Get PSW Profile
```
GET /api/psw/:pswId

Response:
{
  "id": "psw_123",
  "name": "John Doe",
  "email": "john@example.com",
  "location": {...},
  "certifications": ["CPR", "First Aid"],
  "ratings": 4.8,
  "reviewCount": 45,
  "availableTimeSlots": [...],
  "serviceTypes": ["General Support", "Companion Care"]
}
```

### Booking Endpoints

#### Confirm Booking
```
POST /api/booking/confirm
Content-Type: application/json

{
  "clientId": "client_456",
  "pswId": "psw_123",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "serviceType": "General Support",
  "conversationId": "conv_123"
}

Response:
{
  "booking": {
    "id": "booking_789",
    "clientId": "client_456",
    "pswId": "psw_123",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T12:00:00Z",
    "serviceType": "General Support",
    "status": "confirmed",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "confirmationMessage": "Your booking has been confirmed..."
}
```

#### Get Booking
```
GET /api/booking/:bookingId

Response:
{
  "id": "booking_789",
  "clientId": "client_456",
  "pswId": "psw_123",
  ...
}
```

#### Cancel Booking
```
DELETE /api/booking/:bookingId

Response:
{
  "message": "Booking cancelled successfully"
}
```

## Database Schema

### Collections

#### `clients`
```typescript
{
  id: string
  email: string
  name: string
  phone?: string
  location: {
    latitude: number
    longitude: number
    postalCode?: string
    address?: string
  }
  preferences?: {
    preferredRadius: number
    preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening'
    serviceTypes?: string[]
  }
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `psws`
```typescript
{
  id: string
  email: string
  name: string
  phone?: string
  location: {
    latitude: number
    longitude: number
    postalCode?: string
    address?: string
  }
  certifications: string[]
  ratings: number
  reviewCount: number
  availableTimeSlots: Array<{
    date: date
    startTime: string (HH:MM)
    endTime: string (HH:MM)
  }>
  serviceTypes: string[]
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `bookings`
```typescript
{
  id: string
  clientId: string
  pswId: string
  startTime: timestamp
  endTime: timestamp
  serviceType: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `conversations`
```typescript
{
  id: string
  clientId: string
  messages: Array<{
    id: string
    conversationId: string
    sender: 'client' | 'ai'
    content: string
    timestamp: timestamp
    metadata?: object
  }>
  extractedData: {
    clientLocation?: object
    desiredDate?: date
    desiredStartTime?: string
    desiredEndTime?: string
    serviceType?: string
    pswPreferences?: object
    isComplete: boolean
    confidence: number
  }
  status: 'active' | 'completed' | 'archived'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx      # Main chat UI
│   │   ├── PSWList.tsx            # Worker list display
│   │   ├── BookingConfirmation.tsx # Booking confirmation
│   │   └── *.css                  # Component styles
│   ├── services/
│   │   └── api.ts                 # API client
│   ├── store/
│   │   └── chatStore.ts           # Zustand state management
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Backend Architecture

```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── chatController.ts
│   │   ├── bookingController.ts
│   │   └── pswController.ts
│   ├── services/
│   │   ├── aiService.ts           # OpenAI integration
│   │   ├── pswMatchingService.ts  # Matching algorithm
│   │   └── firebaseService.ts     # Database operations
│   ├── routes/
│   │   └── api.ts                 # Route definitions
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   └── index.ts                   # Express server
├── tsconfig.json
└── package.json
```

### Data Flow

1. Client sends message through chat interface
2. Frontend sends to backend via `/api/chat/message`
3. Backend processes with AI Service (GPT-4)
4. AI extracts booking data
5. If location data exists, PSW Matching Service filters available workers
6. Firebase Service retrieves PSW profiles and stores conversation
7. Response sent back to frontend with suggestions
8. Client selects PSW and confirms
9. Booking confirmation stored in Firebase
10. Confirmation message sent back to client

## Extending the System

### Adding Email Notifications

Use Firebase Cloud Functions to send emails on booking confirmations:

```typescript
// functions/src/notifications.ts
export const sendBookingConfirmation = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap) => {
    const booking = snap.data();
    // Send email notification
  });
```

### Adding Payment Processing

Integrate Stripe for payments:

```typescript
// backend/src/services/paymentService.ts
import Stripe from 'stripe';

export class PaymentService {
  async createPaymentIntent(amount: number, currency: string) {
    // Create Stripe payment intent
  }
}
```

### Adding SMS Notifications

Use Twilio for SMS updates:

```typescript
// backend/src/services/smsService.ts
import twilio from 'twilio';

export class SMSService {
  async sendConfirmation(phoneNumber: string, message: string) {
    // Send SMS notification
  }
}
```

## Troubleshooting

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project settings
- Ensure Firestore is enabled

### AI Service Errors
- Verify OpenAI API key is valid
- Check API usage limits
- Review API response in logs

### CORS Issues
- Ensure CORS_ORIGIN matches frontend URL
- Check browser console for specific error

### Location Not Found
- Verify postal code/address format
- Use coordinates if address fails
- Check Google Maps API key and quota

## Support & Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)

---

**Created:** December 2025
**Version:** 1.0.0
