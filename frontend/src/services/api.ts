/// <reference types="vite/client" />
import axios from 'axios';
import type {
  ChatRequest,
  ChatResponse,
  AvailablePSWsRequest,
  AvailablePSWsResponse,
  BookingConfirmationRequest,
  BookingConfirmationResponse,
  PSWProfile,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chat API
export const chatAPI = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/chat/message', request);
    return response.data;
  },

  async getConversation(conversationId: string) {
    const response = await apiClient.get(`/chat/conversation/${conversationId}`);
    return response.data;
  },

  async createConversation(clientId: string) {
    const response = await apiClient.post('/chat/conversation', { clientId });
    return response.data;
  },
};

// PSW Matching API
export const pswAPI = {
  async getAvailablePSWs(
    request: AvailablePSWsRequest
  ): Promise<AvailablePSWsResponse> {
    const response = await apiClient.post<AvailablePSWsResponse>(
      '/psw/available',
      request
    );
    return response.data;
  },

  async getPSWProfile(pswId: string): Promise<PSWProfile> {
    const response = await apiClient.get<PSWProfile>(`/psw/${pswId}`);
    return response.data;
  },

  async searchPSWs(query: string, location: { lat: number; lng: number }) {
    const response = await apiClient.get('/psw/search', {
      params: { query, lat: location.lat, lng: location.lng },
    });
    return response.data;
  },
};

// Booking API
export const bookingAPI = {
  async confirmBooking(
    request: BookingConfirmationRequest
  ): Promise<BookingConfirmationResponse> {
    const response = await apiClient.post<BookingConfirmationResponse>(
      '/booking/confirm',
      request
    );
    return response.data;
  },

  async getBooking(bookingId: string) {
    const response = await apiClient.get(`/booking/${bookingId}`);
    return response.data;
  },

  async updateBooking(bookingId: string, updates: Record<string, unknown>) {
    const response = await apiClient.patch(`/booking/${bookingId}`, updates);
    return response.data;
  },

  async cancelBooking(bookingId: string) {
    const response = await apiClient.delete(`/booking/${bookingId}`);
    return response.data;
  },

  async listBookings(clientId: string) {
    const response = await apiClient.get('/booking/list', {
      params: { clientId },
    });
    return response.data;
  },
};

// Geolocation API
export const geolocationAPI = {
  async geocodeAddress(address: string) {
    const response = await apiClient.post('/geo/geocode', { address });
    return response.data;
  },

  async reverseGeocode(latitude: number, longitude: number) {
    const response = await apiClient.post('/geo/reverse', {
      latitude,
      longitude,
    });
    return response.data;
  },
};

export default apiClient;
