import { create } from 'zustand';
import type {
  ChatMessage,
  BookingData,
  PSWProfile,
  Booking,
} from '../types';

interface ChatStore {
  // Conversation state
  conversationId: string | null;
  clientId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Booking data extracted from conversation
  bookingData: BookingData;

  // Available PSWs
  availablePSWs: PSWProfile[];
  selectedPSW: PSWProfile | null;

  // Booking confirmation
  currentBooking: Booking | null;

  // Actions
  setConversationId: (id: string) => void;
  setClientId: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBookingData: (data: Partial<BookingData>) => void;
  setAvailablePSWs: (psws: PSWProfile[]) => void;
  selectPSW: (psw: PSWProfile) => void;
  setCurrentBooking: (booking: Booking) => void;
  resetChat: () => void;
}

const initialBookingData: BookingData = {
  isComplete: false,
  confidence: 0,
};

export const useChatStore = create<ChatStore>((set) => ({
  conversationId: null,
  clientId: null,
  messages: [],
  isLoading: false,
  error: null,
  bookingData: initialBookingData,
  availablePSWs: [],
  selectedPSW: null,
  currentBooking: null,

  setConversationId: (id) => set({ conversationId: id }),
  setClientId: (id) => set({ clientId: id }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  updateBookingData: (data) =>
    set((state) => ({
      bookingData: { ...state.bookingData, ...data },
    })),

  setAvailablePSWs: (psws) => set({ availablePSWs: psws }),

  selectPSW: (psw) => set({ selectedPSW: psw }),

  setCurrentBooking: (booking) => set({ currentBooking: booking }),

  resetChat: () => {
    set({
      conversationId: null,
      clientId: null,
      messages: [],
      isLoading: false,
      error: null,
      bookingData: initialBookingData,
      availablePSWs: [],
      selectedPSW: null,
      currentBooking: null,
    });
  },
}));
