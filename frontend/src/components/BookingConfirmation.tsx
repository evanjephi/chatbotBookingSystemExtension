import React from 'react';
import { bookingAPI } from '../services/api';
import { useChatStore } from '../store/chatStore';
import type { PSWProfile } from '../types';
import './BookingConfirmation.css';

interface BookingConfirmationProps {
  pswProfile: PSWProfile;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  pswProfile,
}) => {
  const { bookingData, setCurrentBooking, conversationId, clientId, addMessage } =
    useChatStore();
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirmBooking = async () => {
    if (
      !bookingData.desiredDate ||
      !bookingData.desiredStartTime ||
      !bookingData.desiredEndTime ||
      !conversationId ||
      !clientId
    ) {
      return;
    }

    setIsConfirming(true);

    try {
      const response = await bookingAPI.confirmBooking({
        clientId,
        pswId: pswProfile.id,
        startTime: new Date(
          bookingData.desiredDate.toDateString() +
            ' ' +
            bookingData.desiredStartTime
        ),
        endTime: new Date(
          bookingData.desiredDate.toDateString() +
            ' ' +
            bookingData.desiredEndTime
        ),
        serviceType: bookingData.serviceType || 'General Support',
        conversationId,
      });

      setCurrentBooking(response.booking);

      // Add confirmation message to chat
      addMessage({
        id: Date.now().toString(),
        conversationId,
        sender: 'ai',
        content: response.confirmationMessage,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      addMessage({
        id: Date.now().toString(),
        conversationId,
        sender: 'ai',
        content:
          'Sorry, there was an issue confirming your booking. Please try again.',
        timestamp: new Date(),
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="booking-confirmation">
      <h3>Confirm Booking</h3>
      <div className="booking-details">
        <div className="detail-item">
          <label>Worker:</label>
          <span>{pswProfile.name}</span>
        </div>
        <div className="detail-item">
          <label>Date:</label>
          <span>{bookingData.desiredDate?.toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <label>Time:</label>
          <span>
            {bookingData.desiredStartTime} - {bookingData.desiredEndTime}
          </span>
        </div>
        <div className="detail-item">
          <label>Service Type:</label>
          <span>{bookingData.serviceType || 'General Support'}</span>
        </div>
      </div>

      <button
        onClick={handleConfirmBooking}
        disabled={isConfirming}
        className="confirm-btn"
      >
        {isConfirming ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </div>
  );
};

export default BookingConfirmation;
