import admin from 'firebase-admin';
import type {
  ClientProfile,
  PSWProfile,
  Booking,
  Conversation,
  ChatMessage,
} from '../types/index.js';

let firebaseInstance: FirebaseService | null = null;

export class FirebaseService {
  private db: admin.firestore.Firestore;

  constructor() {
    if (!admin.apps.length) {
      let serviceAccount: any;

      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          // The JSON is stored as a string in .env.local
          // The private_key has literal \n characters (not escape sequences)
          let saStr = process.env.FIREBASE_SERVICE_ACCOUNT;
          
          // Only replace \n if it appears as a literal backslash-n in the string
          // This handles both cases: \\n and \n
          saStr = saStr.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
          
          serviceAccount = JSON.parse(saStr);
        } catch (err) {
          console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON');
        }
      } else {
        serviceAccount = {
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
        };
      }

      console.log('Firebase Project ID:', serviceAccount.project_id);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    this.db = admin.firestore();
  }

  static getInstance(): FirebaseService {
    if (!firebaseInstance) {
      firebaseInstance = new FirebaseService();
    }
    return firebaseInstance;
  }

  // Client operations
  async getClient(clientId: string): Promise<ClientProfile | null> {
    const doc = await this.db.collection('clients').doc(clientId).get();
    return (doc.data() as ClientProfile) || null;
  }

  async createClient(client: Omit<ClientProfile, 'id'>): Promise<string> {
    const docRef = await this.db
      .collection('clients')
      .add({ ...client, createdAt: new Date(), updatedAt: new Date() });
    return docRef.id;
  }

  async updateClient(clientId: string, updates: Partial<ClientProfile>) {
    await this.db.collection('clients').doc(clientId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  // PSW operations
  async getPSW(pswId: string): Promise<PSWProfile | null> {
    const doc = await this.db.collection('psws').doc(pswId).get();
    return (doc.data() as PSWProfile) || null;
  }

  async getPSWsByLocation(): Promise<PSWProfile[]> {
    // Firestore doesn't have native geo-distance queries, so we fetch all PSWs
    // and filter by distance on the application side (which we do in PSWMatchingService)
    const snapshot = await this.db.collection('psws').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as PSWProfile));
  }

  async getAllPSWs(): Promise<PSWProfile[]> {
    const snapshot = await this.db.collection('psws').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as PSWProfile));
  }

  async createPSW(psw: Omit<PSWProfile, 'id'>): Promise<string> {
    const docRef = await this.db.collection('psws').add({
      ...psw,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Booking operations
  async createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
    const docRef = await this.db.collection('bookings').add({
      ...booking,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    const doc = await this.db.collection('bookings').doc(bookingId).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
    } as Booking;
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>) {
    await this.db.collection('bookings').doc(bookingId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async cancelBooking(bookingId: string) {
    await this.db.collection('bookings').doc(bookingId).update({
      status: 'cancelled',
      updatedAt: new Date(),
    });
  }

  async getClientBookings(clientId: string): Promise<Booking[]> {
    const snapshot = await this.db
      .collection('bookings')
      .where('clientId', '==', clientId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Booking));
  }

  async getPSWBookings(pswId: string): Promise<Booking[]> {
    const snapshot = await this.db
      .collection('bookings')
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
    const docRef = await this.db.collection('conversations').add({
      ...conversation,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const doc = await this.db
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
    await this.db.collection('conversations').doc(conversationId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async addChatMessage(
    conversationId: string,
    message: ChatMessage
  ) {
    await this.db
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
    const snapshot = await this.db
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
    return psw.availableTimeSlots.some(
      (slot) => new Date(slot.date).toISOString().split('T')[0] === dateStr
    );
  }

  async updatePSWAvailability(
    pswId: string,
    updates: Partial<PSWProfile>
  ) {
    await this.db.collection('psws').doc(pswId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }
}
