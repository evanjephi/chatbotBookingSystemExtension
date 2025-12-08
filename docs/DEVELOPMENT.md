# Development Guide

## Project Structure

```
chatbotBookingSystemExtension/
├── frontend/                      # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── PSWList.tsx
│   │   │   ├── BookingConfirmation.tsx
│   │   │   └── *.css
│   │   ├── services/
│   │   │   └── api.ts            # Axios API client
│   │   ├── store/
│   │   │   └── chatStore.ts      # Zustand state
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── App.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── backend/                       # Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── chatController.ts
│   │   │   ├── bookingController.ts
│   │   │   └── pswController.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   ├── pswMatchingService.ts
│   │   │   └── firebaseService.ts
│   │   ├── routes/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   └── index.ts
│   ├── dist/                     # Compiled JavaScript
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── docs/
│   ├── README.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md (this file)
│
└── .gitignore
```

## Getting Started

### 1. Setup Development Environment

```bash
# Clone repository
cd c:\Users\evanj\Documents\Projects\Web Dev\chatbotBookingSystemExtension

# Install Node.js v18+
# Download from https://nodejs.org/

# Create .env files from examples
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit .env files with your credentials
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

## File Naming Conventions

- **Components**: PascalCase (e.g., `ChatInterface.tsx`)
- **Services**: camelCase with "Service" suffix (e.g., `aiService.ts`)
- **Styles**: Match component name (e.g., `ChatInterface.css`)
- **Types**: Describe what they represent (e.g., `BookingData`)
- **Routes**: PascalCase (e.g., `api.ts` is exception for Express)

## Code Style

### TypeScript Configuration

- Strict mode enabled
- No implicit any
- Strict null checks enabled
- Absolute imports where necessary

### Formatting

Use Prettier/ESLint configuration:

```bash
# Install ESLint
npm install --save-dev eslint prettier

# Format code
npm run lint
```

## Key Technologies

### Frontend

- **React 18**: UI library with hooks
- **Vite**: Fast build tool, ~2s startup
- **TypeScript**: Type-safe development
- **Zustand**: Simple state management (5KB)
- **Axios**: HTTP client
- **CSS**: Vanilla CSS with CSS variables

### Backend

- **Express**: Web framework
- **TypeScript**: Type safety
- **Firebase Admin SDK**: Database
- **OpenAI SDK**: GPT-4 integration
- **CORS**: Cross-origin handling

## Development Workflow

### Adding a New Feature

1. **Create branch**: `git checkout -b feature/feature-name`
2. **Update types**: Add types to `types/index.ts`
3. **Create components/controllers**: Add new files
4. **Add tests**: Write unit tests
5. **Update documentation**: Add to docs/
6. **Commit**: `git commit -m "Add feature description"`
7. **Push**: `git push origin feature/feature-name`
8. **Create PR**: Request review

### Example: Adding Email Notifications

1. **Backend Service** (`backend/src/services/emailService.ts`):
```typescript
import nodemailer from 'nodemailer';

export class EmailService {
  async sendBookingConfirmation(email: string, bookingDetails: BookingData) {
    // Implementation
  }
}
```

2. **Controller** (update `bookingController.ts`):
```typescript
// In confirmBooking method
await emailService.sendBookingConfirmation(client.email, booking);
```

3. **Types** (update `types/index.ts`):
```typescript
export interface EmailData {
  to: string;
  subject: string;
  body: string;
}
```

## Testing

### Backend Tests

```bash
npm install --save-dev jest @types/jest ts-jest

# Run tests
npm run test

# Watch mode
npm run test:watch
```

**Example test** (`backend/src/services/pswMatchingService.test.ts`):
```typescript
import { PSWMatchingService } from './pswMatchingService';

describe('PSWMatchingService', () => {
  let service: PSWMatchingService;

  beforeEach(() => {
    service = new PSWMatchingService();
  });

  test('should calculate distance correctly', () => {
    const distance = service['calculateDistance'](
      43.6532, -79.3832,
      43.6629, -79.3957
    );
    expect(distance).toBeGreaterThan(0);
  });
});
```

### Frontend Tests

```bash
npm install --save-dev vitest react-testing-library

# Run tests
npm run test

# Coverage
npm run test:coverage
```

## Performance Tips

### Frontend
- Use React DevTools Profiler
- Lazy load components with `React.lazy()`
- Memoize expensive computations
- Monitor bundle size with `vite-plugin-visualizer`

### Backend
- Index Firestore queries
- Cache expensive operations
- Use connection pooling
- Monitor API response times

## Debugging

### Frontend

```typescript
// Use browser DevTools
console.log('Debug info:', data);

// Use Zustand DevTools
import { devtools } from 'zustand/middleware';

// Chrome extension: Redux DevTools
```

### Backend

```typescript
// Debug logging
console.log('[DEBUG]', 'Info:', data);

// Using VSCode Debugger
// Add breakpoints and F5 to debug
```

## Common Issues & Solutions

### Issue: CORS errors
**Solution**: Check CORS_ORIGIN in backend .env matches frontend URL

### Issue: Firebase authentication fails
**Solution**: Verify credentials in .env, check Firebase rules

### Issue: GPT-4 API errors
**Solution**: Check API key quota, verify request format

### Issue: Port already in use
**Solution**: Kill process or use different port

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

## Useful Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm start            # Run compiled app
npm run lint         # Run ESLint
npm run test         # Run tests
```

## Database Operations

### Firestore Query Examples

```typescript
// Get specific document
const psw = await firebaseService.getPSW('psw_123');

// Get all documents
const allPSWs = await firebaseService.getAllPSWs();

// Create document
const id = await firebaseService.createBooking(bookingData);

// Update document
await firebaseService.updateBooking('booking_123', { status: 'completed' });

// Delete document
await firebaseService.cancelBooking('booking_123');
```

## Environment Variables Reference

### Backend (.env)
```env
# Firebase
FIREBASE_PROJECT_ID=your-id
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email

# APIs
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIzaSy...

# Server
BACKEND_PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
# After review and approval, merge to main
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create release on GitHub
6. Deploy to production

## Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Vite Guide](https://vitejs.dev/guide/)

## Contributing

1. Follow code style guidelines
2. Write tests for new features
3. Update documentation
4. Request review before merging
5. Ensure CI/CD passes

## Support

For questions or issues:
1. Check documentation
2. Search existing GitHub issues
3. Create new issue with details
4. Contact development team
