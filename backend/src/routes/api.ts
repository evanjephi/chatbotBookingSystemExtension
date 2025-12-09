import { Router } from 'express';
import chatController from '../controllers/chatController.js';
import bookingController from '../controllers/bookingController.js';
import pswController from '../controllers/pswController.js';

const router = Router();

// Seed database with sample data
router.post('/seed', async (_req, res) => {
  try {
    // Don't try to initialize Firebase here - just return a message
    // Users should seed data manually via Firebase Console or admin SDK
    res.json({ 
      message: 'Seed endpoint available. Sample PSW profiles are ready to be imported.',
      note: 'To seed, use: curl -X POST http://localhost:5000/api/seed'
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Chat routes
router.post('/chat/message', (req, res) => chatController.sendMessage(req, res));
router.post('/chat/conversation', (req, res) =>
  chatController.createConversation(req, res)
);
router.get('/chat/conversation/:conversationId', (req, res) =>
  chatController.getConversation(req, res)
);

// Booking routes
router.post('/booking/confirm', (req, res) =>
  bookingController.confirmBooking(req, res)
);
router.get('/booking/:bookingId', (req, res) =>
  bookingController.getBooking(req, res)
);
router.patch('/booking/:bookingId', (req, res) =>
  bookingController.updateBooking(req, res)
);
router.delete('/booking/:bookingId', (req, res) =>
  bookingController.cancelBooking(req, res)
);
router.get('/booking/list', (req, res) =>
  bookingController.listBookings(req, res)
);

// PSW routes
router.post('/psw/available', (req, res) =>
  pswController.getAvailablePSWs(req, res)
);
router.get('/psw/:pswId', (req, res) =>
  pswController.getPSWProfile(req, res)
);
router.get('/psw/search', (req, res) => pswController.searchPSWs(req, res));

export default router;
