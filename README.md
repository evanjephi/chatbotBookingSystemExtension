# PSW Booking System

An intelligent, AI-assisted booking platform where clients can book Personal Support Worker (PSW) appointments through a natural-language chat interface.

## 🎯 Project Overview

This system uses AI to understand conversational English and automate the PSW scheduling process based on proximity, availability, and preferences. Clients describe their needs in plain English, and the AI intelligently extracts booking details, matches them with available PSWs, and confirms appointments.

### Key Features

✨ **AI-Powered Chat Interface**
- ChatGPT integration for natural language understanding
- Conversational flow for booking details collection
- Real-time availability checking
- Follow-up and confirmation messaging

📍 **Smart Worker Matching**
- Proximity-based PSW search (configurable radius)
- Availability filtering
- Qualification matching
- Ranking by multiple criteria

💼 **Complete Booking Workflow**
- Appointment confirmation
- Real-time schedule updates
- Reschedule and cancellation support
- Confirmation notifications

🔐 **Enterprise Features**
- Role-based access control
- Firebase real-time synchronization
- Cloud Functions for automated triggers
- Error handling and fallback logic

## 📋 Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- Firebase Project
- OpenAI API Key
- Google Maps API Key

### Installation

```bash
# 1. Navigate to project
cd chatbotBookingSystemExtension

# 2. Setup environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 3. Edit .env files with your credentials
# (See docs/README.md for detailed setup)

# 4. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 5. Start development servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

Access at `http://localhost:3000`

## 📁 Project Structure

```
chatbotBookingSystemExtension/
├── frontend/              # React + TypeScript + Vite SPA
├── backend/               # Express + TypeScript API
├── docs/                  # Comprehensive documentation
│   ├── README.md         # Main setup guide
│   ├── API.md            # API reference
│   ├── DEPLOYMENT.md     # Deployment instructions
│   └── DEVELOPMENT.md    # Development guide
└── .gitignore
```

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for optimized builds
- Zustand for state management
- Axios for API communication
- Google Maps API integration
- Responsive CSS design

### Backend
- Express.js with TypeScript
- Firebase Firestore database
- Firebase Authentication
- OpenAI GPT-4 API
- Google Maps Geolocation API

## 🚀 Core Functionality

### 1. Chat Interface
Users interact through a conversational AI interface that:
- Understands natural language queries
- Extracts structured booking data
- Asks clarifying questions
- Maintains conversation context

### 2. Worker Matching
Intelligent algorithm that:
- Filters PSWs by proximity (configurable radius)
- Checks real-time availability
- Matches required skills/certifications
- Ranks by distance, ratings, and reviews

### 3. Booking Management
Complete lifecycle support:
- Appointment confirmation
- Schedule synchronization
- Rescheduling capabilities
- Cancellation handling

## 📖 Documentation

Comprehensive documentation is in the `docs/` folder:

- **[README.md](docs/README.md)** - Complete setup and architecture guide
- **[API.md](docs/API.md)** - Full API reference with examples
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development workflow

## 🔌 API Endpoints

Key endpoints (see docs/API.md for full reference):

```
POST   /api/chat/message              - Send chat message
POST   /api/chat/conversation         - Create conversation
POST   /api/psw/available             - Get available PSWs
POST   /api/booking/confirm           - Confirm booking
GET    /api/booking/:bookingId        - Get booking details
DELETE /api/booking/:bookingId        - Cancel booking
```

## 🗄️ Database Structure

Firebase Firestore collections:
- `clients` - Client profiles and preferences
- `psws` - PSW profiles and availability
- `bookings` - Appointment records
- `conversations` - Chat history and extracted data

## 🔧 Development

### Run in Development Mode

```bash
# Backend
cd backend
npm run dev        # Runs on http://localhost:5000

# Frontend
cd frontend
npm run dev        # Runs on http://localhost:3000
```

### Build for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🚢 Deployment

Deployment guides for:
- Vercel (Frontend)
- Netlify (Frontend)
- Firebase Cloud Run (Backend)
- Heroku (Backend)
- Docker (Backend)
- GitHub Actions (CI/CD)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📊 System Architecture

```
┌─────────────────────┐
│   React Frontend    │
│  (Chat Interface)   │
└──────────┬──────────┘
           │
      [Axios HTTP]
           │
    ┌──────▼──────┐
    │ Express API │
    │   Server    │
    └──────┬──────┘
           │
    ┌──────┴──────────────┬────────────┐
    │                     │            │
┌───▼────┐         ┌──────▼────┐ ┌───▼────────┐
│Firebase│         │ OpenAI    │ │ Google     │
│Firestore         │ GPT-4 API │ │ Maps API   │
└────────┘         └───────────┘ └────────────┘
```

## 🔐 Security Features

- CORS configuration for frontend/backend separation
- Firebase Authentication for user management
- Firestore security rules for data access
- Environment variable management
- Input validation and error handling
- Rate limiting on API endpoints

## 📈 Performance

- Vite for fast development builds (~2s startup)
- React optimization with memoization
- Firebase real-time subscriptions
- Firestore query optimization
- Backend request queuing for AI API

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes following code style guidelines
3. Write/update tests
4. Update documentation
5. Create pull request

## 📄 License

[Specify your license here]

## 📞 Support

For issues or questions:
1. Check documentation in `docs/`
2. Review API reference
3. Check deployment guide
4. Open GitHub issue

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 Version

**v1.0.0** - December 2025

---

Built with ❤️ for intelligent PSW booking
