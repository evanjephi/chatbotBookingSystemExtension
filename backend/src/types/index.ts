// Re-export types from frontend for backend compatibility
export interface ClientProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location: Location;
  preferences?: BookingPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface PSWProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location: Location;
  certifications: string[];
  ratings: number;
  reviewCount: number;
  availableTimeSlots: TimeSlot[];
  serviceTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  postalCode?: string;
  address?: string;
}

export interface GeocodeResult {
  location: Location;
  formattedAddress: string;
}

export interface BookingPreferences {
  preferredRadius: number;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  serviceTypes?: string[];
}

export interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  clientId: string;
  pswId: string;
  startTime: Date;
  endTime: Date;
  serviceType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'client' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  clientId: string;
  messages: ChatMessage[];
  extractedData: BookingData;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingData {
  clientLocation?: Location;
  desiredDate?: Date;
  desiredStartTime?: string;
  desiredEndTime?: string;
  serviceType?: string;
  pswPreferences?: PSWPreferences;
  isComplete: boolean;
  confidence: number;
}

export interface PSWPreferences {
  maxDistance?: number;
  minRating?: number;
  certifications?: string[];
}

export interface ChatRequest {
  conversationId: string;
  clientId: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  aiMessage: string;
  extractedData?: Partial<BookingData>;
  suggestedPSWs?: PSWProfile[];
  requiresConfirmation?: boolean;
}

export interface AvailablePSWsRequest {
  location: Location;
  radius: number;
  desiredDate: Date;
  startTime: string;
  endTime: string;
  serviceType?: string;
}

export interface AvailablePSWsResponse {
  pswProfiles: PSWProfile[];
  totalCount: number;
}

export interface BookingConfirmationRequest {
  clientId: string;
  pswId: string;
  startTime: Date;
  endTime: Date;
  serviceType: string;
  conversationId: string;
}

export interface BookingConfirmationResponse {
  booking: Booking;
  confirmationMessage: string;
}
