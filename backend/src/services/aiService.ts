import OpenAI from 'openai';
import type { BookingData } from '../types/index.js';

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export interface AIExtractionResult {
  extractedData: Partial<BookingData>;
  aiMessage: string;
  confidence: number;
  requiresConfirmation: boolean;
}

const SYSTEM_PROMPT = `You are a helpful PSW (Personal Support Worker) booking assistant. Your role is to:
1. Understand client needs through natural language conversation
2. Extract booking information (location, date, time, service type, preferences)
3. Ask clarifying questions when information is incomplete or ambiguous
4. Maintain a friendly and professional tone

When the user provides booking details, extract and confirm:
- Location (city, postal code, address)
- Desired date (specific date)
- Desired time (start and end time)
- Service type if mentioned

Always respond conversationally and list back what you understood.`;

export class AIService {
  private conversationHistory: Array<{ role: string; content: string }> = [];

  async processMessage(
    userMessage: string
  ): Promise<AIExtractionResult> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      console.log('[AIService] Calling OpenAI with gpt-4o-mini');
      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...this.conversationHistory.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      console.log('[AIService] Response received successfully');
      const assistantMessage = response.choices[0].message.content || '';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      // For gpt-4o-mini, we get a natural response. Try to extract structured data if present.
      const extractedData = this.extractJSON(assistantMessage);

      return {
        extractedData: extractedData || {},
        aiMessage: this.removeJSONFromMessage(assistantMessage),
        confidence: extractedData?.confidence || 0.5,
        requiresConfirmation: false,
      };
    } catch (error) {
      console.error('[AIService] OpenAI Error:', error instanceof Error ? error.message : error);
      // Throw error so the caller can implement fallback
      throw error;
    }
  }

  private extractJSON(
    message: string
  ): Partial<BookingData> | null {
    const jsonMatch = message.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return this.transformAIData(parsed);
    } catch (error) {
      console.error('Failed to parse JSON from AI response:', error);
      return null;
    }
  }

  private transformAIData(aiData: Record<string, any>): Partial<BookingData> {
    return {
      clientLocation: aiData.location,
      desiredDate: aiData.desiredDate
        ? new Date(aiData.desiredDate)
        : undefined,
      desiredStartTime: aiData.desiredStartTime,
      desiredEndTime: aiData.desiredEndTime,
      serviceType: aiData.serviceType,
      pswPreferences: aiData.pswPreferences,
      isComplete: aiData.isComplete || false,
      confidence: aiData.confidence || 0,
    };
  }

  private removeJSONFromMessage(message: string): string {
    return message.replace(/```json\n[\s\S]*?\n```/g, '').trim();
  }

  resetConversation(): void {
    this.conversationHistory = [];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }
}

export default new AIService();
