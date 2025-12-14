import { Request, Response } from 'express';
import aiService from '../services/aiService.js';
import { FirebaseService } from '../services/firebaseService.js';
import pswMatchingService from '../services/pswMatchingService.js';
import { extractBookingDataFromMessage, generateAIFallbackMessage } from '../services/dataExtractionFallback.js';
import type { ChatRequest, ChatResponse, BookingData } from '../types/index.js';

export class ChatController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      console.log('[sendMessage] Starting message processing');
      const firebaseService = FirebaseService.getInstance();
      const { conversationId, clientId, message } = req.body as ChatRequest;

      console.log('[sendMessage] Received:', { conversationId, clientId, message });

      if (!conversationId || !clientId || !message) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get existing conversation to maintain context
      console.log('[sendMessage] Fetching conversation:', conversationId);
      let conversation = await firebaseService.getConversation(conversationId);

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      // Process message with AI
      console.log('[sendMessage] Processing with AI service');
      let aiResult;
      try {
        aiResult = await aiService.processMessage(message);
        console.log('[sendMessage] AI processing successful');
      } catch (aiErr) {
        console.error('[sendMessage] AI service error:', aiErr instanceof Error ? aiErr.message : aiErr);
        // Fallback: use simple data extraction
        const extractedData = extractBookingDataFromMessage(message);
        const aiMessage = generateAIFallbackMessage(message, extractedData);
        aiResult = {
          aiMessage,
          extractedData,
          confidence: extractedData.confidence || 0.3,
          requiresConfirmation: false,
        };
      }

      // Add user message to chat
      console.log('[sendMessage] Adding user message');
      await firebaseService.addChatMessage(conversationId, {
        id: Date.now().toString(),
        conversationId,
        sender: 'client',
        content: message,
        timestamp: new Date(),
      });

      // Add AI message to chat
      console.log('[sendMessage] Adding AI message');
      await firebaseService.addChatMessage(conversationId, {
        id: Date.now().toString() + 'ai',
        conversationId,
        sender: 'ai',
        content: aiResult.aiMessage,
        timestamp: new Date(),
        metadata: aiResult.extractedData,
      });

      // Update conversation with extracted data
      const updatedExtractedData: BookingData = {
        ...conversation.extractedData,
        ...aiResult.extractedData,
      };

      console.log('[sendMessage] Updating conversation');
      await firebaseService.updateConversation(conversationId, {
        extractedData: updatedExtractedData,
        status:
          aiResult.requiresConfirmation && updatedExtractedData.isComplete
            ? 'completed'
            : 'active',
      });

      // If we have complete booking data, suggest PSWs
      let suggestedPSWs: any[] = [];
      if (
        updatedExtractedData.clientLocation &&
        updatedExtractedData.desiredDate &&
        updatedExtractedData.desiredStartTime &&
        updatedExtractedData.desiredEndTime
      ) {
        const allPSWs = await firebaseService.getAllPSWs();

        // Apply filters
        let filtered = pswMatchingService.filterByProximity(
          allPSWs,
          updatedExtractedData.clientLocation,
          updatedExtractedData.pswPreferences?.maxDistance || 15
        );

        filtered = pswMatchingService.filterByAvailability(
          filtered,
          updatedExtractedData.desiredDate,
          updatedExtractedData.desiredStartTime,
          updatedExtractedData.desiredEndTime
        );

        if (updatedExtractedData.serviceType) {
          filtered = pswMatchingService.filterByServiceType(
            filtered,
            updatedExtractedData.serviceType
          );
        }

        if (updatedExtractedData.pswPreferences?.minRating) {
          filtered = pswMatchingService.filterByRating(
            filtered,
            updatedExtractedData.pswPreferences.minRating
          );
        }

        if (updatedExtractedData.pswPreferences?.certifications) {
          filtered = pswMatchingService.filterByCertifications(
            filtered,
            updatedExtractedData.pswPreferences.certifications
          );
        }

        // Rank PSWs
        suggestedPSWs = pswMatchingService.rankPSWs(
          filtered,
          updatedExtractedData.clientLocation
        );
      }

      const response: ChatResponse = {
        conversationId,
        aiMessage: aiResult.aiMessage,
        extractedData: updatedExtractedData,
        suggestedPSWs: suggestedPSWs.slice(0, 5), // Top 5 matches
        requiresConfirmation: aiResult.requiresConfirmation,
      };

      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  }

  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      console.log('[createConversation] Starting conversation creation');
      const firebaseService = FirebaseService.getInstance();
      const { clientId } = req.body;

      console.log('[createConversation] Received clientId:', clientId);

      if (!clientId) {
        res.status(400).json({ error: 'Client ID is required' });
        return;
      }

      const initialExtractedData: BookingData = {
        isComplete: false,
        confidence: 0,
      };

      console.log('[createConversation] Creating conversation in Firebase...');
      const conversationId = await firebaseService.createConversation({
        clientId,
        messages: [],
        extractedData: initialExtractedData,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('[createConversation] Conversation created with ID:', conversationId);

      // Add welcome message
      const welcomeMessage = `Hello! I'm your PSW booking assistant. I'm here to help you find and book a Personal Support Worker. 

Tell me a bit about what you need:
- Where are you located (postal code or area)?
- When would you like to book? (specific date or general timeframe)
- What time of day works best for you?
- Any specific services or certifications you're looking for?

Feel free to describe your needs in your own words!`;

      console.log('[createConversation] Adding welcome message...');
      await firebaseService.addChatMessage(conversationId, {
        id: Date.now().toString(),
        conversationId,
        sender: 'ai',
        content: welcomeMessage,
        timestamp: new Date(),
      });

      console.log('[createConversation] Welcome message added, returning response');
      res.json({
        id: conversationId,
        clientId,
        status: 'active',
      });
    } catch (error) {
      console.error('[createConversation] ERROR OCCURRED:', error);
      console.error('[createConversation] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[createConversation] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[createConversation] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      res.status(500).json({ 
        error: 'Failed to create conversation', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const { conversationId } = req.params;

      const conversation = await firebaseService.getConversation(conversationId);

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.json(conversation);
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
  }
}

let chatControllerInstance: ChatController;

const getChatController = () => {
  if (!chatControllerInstance) {
    chatControllerInstance = new ChatController();
  }
  return chatControllerInstance;
};

export default getChatController();
