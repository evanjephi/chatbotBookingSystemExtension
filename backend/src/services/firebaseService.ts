import admin from 'firebase-admin';
import type {
  ClientProfile,
  PSWProfile,
  Booking,
  Conversation,
  ChatMessage,
} from '../types/index.js';

let firebaseInstance: FirebaseService | null = null;
let inMemoryData: any = {
  conversations: new Map(),
  messages: new Map(),
  clients: new Map(),
  psws: new Map(),
  bookings: new Map(),
};

export class FirebaseService {
  private db: admin.firestore.Firestore | null = null;
  private initialized = false;
  private useInMemory = false;

  constructor() {
    // Don't initialize Firebase in constructor - do it lazily on first use
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('[Firebase] Attempting to initialize...');
      if (!admin.apps.length) {
        let serviceAccount: any;

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            // Try to parse the service account from env
            const envString = process.env.FIREBASE_SERVICE_ACCOUNT;
            // Try both escaped and unescaped versions
            try {
              serviceAccount = JSON.parse(envString);
            } catch {
              // If that fails, try unescaping newlines
              const unescapedString = envString.replace(/\\n/g, '\n');
              serviceAccount = JSON.parse(unescapedString);
            }
            
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
            this.db = admin.firestore();
            this.initialized = true;
            this.useInMemory = false;
            console.log('[Firebase] Successfully connected to Firebase');
            return;
          } catch (err) {
            console.warn('[Firebase] Connection failed, falling back to in-memory storage:', err instanceof Error ? err.message : err);
          }
        }
      }
      
      // If Firebase init fails or not configured, use in-memory fallback
      this.useInMemory = true;
      this.initialized = true;
      console.log('[Firebase] Using in-memory storage (development mode)');
    } catch (error) {
      console.error('[Firebase] Fallback failed:', error);
      // Still mark as initialized to prevent repeated attempts
      this.initialized = true;
      this.useInMemory = true;
    }
  }

  static getInstance(): FirebaseService {
    if (!firebaseInstance) {
      firebaseInstance = new FirebaseService();
    }
    return firebaseInstance;
  }

  // Client operations
  async getClient(clientId: string): Promise<ClientProfile | null> {
    await this.ensureInitialized();
    const doc = await this.db!.collection('clients').doc(clientId).get();
    return (doc.data() as ClientProfile) || null;
  }

  async createClient(client: Omit<ClientProfile, 'id'>): Promise<string> {
    await this.ensureInitialized();
    const docRef = await this.db!
      .collection('clients')
      .add({ ...client, createdAt: new Date(), updatedAt: new Date() });
    return docRef.id;
  }

  async updateClient(clientId: string, updates: Partial<ClientProfile>) {
    await this.ensureInitialized();
    await this.db!.collection('clients').doc(clientId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  // PSW operations
  async getPSWsByLocation(): Promise<PSWProfile[]> {
    // Firestore doesn't have native geo-distance queries, so we fetch all PSWs
    // and filter by distance on the application side (which we do in PSWMatchingService)
    await this.ensureInitialized();
    const snapshot = await this.db!.collection('psws').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as PSWProfile));
  }

  async getAllPSWs(): Promise<PSWProfile[]> {
    await this.ensureInitialized();
    
    if (this.useInMemory) {
      return Array.from(inMemoryData.psws.values());
    }
    
    const snapshot = await this.db!.collection('psws').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as PSWProfile));
  }

  async createOrUpdatePSW(psw: PSWProfile): Promise<string> {
    await this.ensureInitialized();

    if (this.useInMemory) {
      inMemoryData.psws.set(psw.id, {
        ...psw,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[Firebase] In-memory: Saved PSW ${psw.id}`);
      return psw.id;
    }

    try {
      await this.db!.collection('registeredPsw').doc(psw.id).set(
        {
          ...psw,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
      return psw.id;
    } catch (error) {
      console.error(`[Firebase] Error saving PSW ${psw.id}:`, error);
      throw error;
    }
  }

  async getPSW(pswId: string): Promise<PSWProfile | null> {
    await this.ensureInitialized();

    if (this.useInMemory) {
      return inMemoryData.psws.get(pswId) || null;
    }

    const doc = await this.db!.collection('psws').doc(pswId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as PSWProfile;
  }

  async createPSW(psw: Omit<PSWProfile, 'id'>): Promise<string> {
    await this.ensureInitialized();
    const docRef = await this.db!.collection('psws').add({
      ...psw,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Booking operations
  async createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
    await this.ensureInitialized();
    const docRef = await this.db!.collection('bookings').add({
      ...booking,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    await this.ensureInitialized();
    const doc = await this.db!.collection('ClientBookings').doc(bookingId).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
    } as Booking;
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>) {
    await this.ensureInitialized();
    await this.db!.collection('ClientBookings').doc(bookingId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async cancelBooking(bookingId: string) {
    await this.ensureInitialized();
    await this.db!.collection('ClientBookings').doc(bookingId).update({
      status: 'cancelled',
      updatedAt: new Date(),
    });
  }

  async getClientBookings(clientId: string): Promise<Booking[]> {
    await this.ensureInitialized();
    const snapshot = await this.db!
      .collection('ClientBookings')
      .where('clientId', '==', clientId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Booking));
  }

  async getPSWBookings(pswId: string): Promise<Booking[]> {
    await this.ensureInitialized();
    const snapshot = await this.db!
      .collection('ClientBookings')
      .where('pswId', '==', pswId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Booking));
  }

  // Conversation operations
  async createConversation(
    conversation: Omit<Conversation, 'id'>
  ): Promise<string> {
    await this.ensureInitialized();
    
    if (this.useInMemory) {
      // In-memory fallback
      const id = `conv_${Date.now()}`;
      inMemoryData.conversations.set(id, { ...conversation, id, messages: [] });
      return id;
    }
    
    const docRef = await this.db!.collection('conversations').add({
      ...conversation,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    await this.ensureInitialized();
    
    if (this.useInMemory) {
      return inMemoryData.conversations.get(conversationId) || null;
    }
    
    const doc = await this.db!
      .collection('conversations')
      .doc(conversationId)
      .get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
    } as Conversation;
  }

  async updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ) {
    await this.ensureInitialized();
    
    if (this.useInMemory) {
      const conv = inMemoryData.conversations.get(conversationId);
      if (conv) {
        Object.assign(conv, updates, { updatedAt: new Date() });
      }
      return;
    }
    
    await this.db!.collection('conversations').doc(conversationId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async addChatMessage(
    conversationId: string,
    message: ChatMessage
  ) {
    await this.ensureInitialized();
    
    if (this.useInMemory) {
      const conv = inMemoryData.conversations.get(conversationId);
      if (conv) {
        if (!conv.messages) conv.messages = [];
        conv.messages.push(message);
      }
      return;
    }
    
    await this.db!
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(message);

    // Also update the messages array in the main conversation doc
    const conversation = await this.getConversation(conversationId);
    if (conversation) {
      await this.updateConversation(conversationId, {
        messages: [...(conversation.messages || []), message],
      });
    }
  }

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    await this.ensureInitialized();
    const snapshot = await this.db!
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as ChatMessage));
  }

  // Availability operations
  async checkPSWAvailability(pswId: string, date: Date): Promise<boolean> {
    const psw = await this.getPSW(pswId);
    if (!psw) return false;

    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    
    // Check date overrides first
    if (psw.availability.dateOverrides[dateStr]) {
      const slots = Object.values(psw.availability.dateOverrides[dateStr].slots);
      return slots.some(slot => slot.status === 'available');
    }
    
    // Fall back to weekly template
    return dayOfWeek in psw.availability.weeklyTemplate;
  }

  async updatePSWAvailability(
    pswId: string,
    updates: Partial<PSWProfile>
  ) {
    await this.ensureInitialized();
    await this.db!.collection('psws').doc(pswId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }
}
