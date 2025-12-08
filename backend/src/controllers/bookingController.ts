import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebaseService.js';
import type {
  BookingConfirmationRequest,
  BookingConfirmationResponse,
} from '../types/index.js';

export class BookingController {
  async confirmBooking(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const {
        clientId,
        pswId,
        startTime,
        endTime,
        serviceType,
        conversationId,
      } = req.body as BookingConfirmationRequest;

      // Validate inputs
      if (!clientId || !pswId || !startTime || !endTime || !serviceType) {
        res.status(400).json({ error: 'Missing required booking fields' });
        return;
      }

      // Create booking
      const bookingId = await firebaseService.createBooking({
        clientId,
        pswId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        serviceType,
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking = await firebaseService.getBooking(bookingId);

      if (!booking) {
        res.status(500).json({ error: 'Failed to retrieve created booking' });
        return;
      }

      // Get PSW details for confirmation message
      const psw = await firebaseService.getPSW(pswId);
      const pswName = psw?.name || 'Your selected PSW';

      const confirmationMessage = `Great! Your booking has been confirmed! 🎉

**Booking Details:**
- **Worker:** ${pswName}
- **Date:** ${new Date(startTime).toLocaleDateString()}
- **Time:** ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
- **Service:** ${serviceType}
- **Booking ID:** ${bookingId}

You'll receive a confirmation email shortly. If you need to reschedule or cancel, you can do so up to 24 hours before the appointment.

Is there anything else I can help you with?`;

      // Update conversation status
      await firebaseService.updateConversation(conversationId, {
        status: 'completed',
      });

      // Add confirmation message to chat
      await firebaseService.addChatMessage(conversationId, {
        id: Date.now().toString(),
        conversationId,
        sender: 'ai',
        content: confirmationMessage,
        timestamp: new Date(),
      });

      const response: BookingConfirmationResponse = {
        booking,
        confirmationMessage,
      };

      res.json(response);
    } catch (error) {
      console.error('Booking confirmation error:', error);
      res.status(500).json({ error: 'Failed to confirm booking' });
    }
  }

  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const { bookingId } = req.params;

      const booking = await firebaseService.getBooking(bookingId);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json(booking);
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({ error: 'Failed to retrieve booking' });
    }
  }

  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const { bookingId } = req.params;
      const updates = req.body;

      await firebaseService.updateBooking(bookingId, updates);

      const booking = await firebaseService.getBooking(bookingId);
      res.json(booking);
    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const { bookingId } = req.params;

      await firebaseService.cancelBooking(bookingId);

      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }

  async listBookings(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const { clientId } = req.query;

      if (!clientId || typeof clientId !== 'string') {
        res.status(400).json({ error: 'Client ID is required' });
        return;
      }

      const bookings = await firebaseService.getClientBookings(clientId);

      res.json({
        bookings,
        totalCount: bookings.length,
      });
    } catch (error) {
      console.error('List bookings error:', error);
      res.status(500).json({ error: 'Failed to retrieve bookings' });
    }
  }
}

let bookingControllerInstance: BookingController;

const getBookingController = () => {
  if (!bookingControllerInstance) {
    bookingControllerInstance = new BookingController();
  }
  return bookingControllerInstance;
};

export default getBookingController();
