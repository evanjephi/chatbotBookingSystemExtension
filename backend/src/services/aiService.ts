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
5. Confirm details before finalizing bookings

When extracting information, look for:
- Location (postal code, address, or proximity references like "near me")
- Desired date (specific date or relative like "Monday", "next week", "tomorrow")
- Desired time (specific time or time of day like "morning", "afternoon", "evening")
- Duration or end time
- Service type (general support, caregiving, companionship, etc.)
- Any PSW preferences (certifications, ratings, specific skills)

Always respond with a natural, conversational message. After each message, provide a JSON block with extracted data.
Format extracted data as JSON after your message like this:
\`\`\`json
{
  "location": {"latitude": number, "longitude": number, "postalCode": string},
  "desiredDate": "YYYY-MM-DD",
  "desiredStartTime": "HH:MM",
  "desiredEndTime": "HH:MM",
  "serviceType": string,
  "pswPreferences": {...},
  "isComplete": boolean,
  "confidence": 0-100
}
\`\`\``;

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
      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4',
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

      const aiMessage =
        response.choices[0]?.message?.content || 'Unable to process request.';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage,
      });

      // Extract JSON data from response
      const extractedData = this.extractJSON(aiMessage);
      const confidence = extractedData?.confidence || 0;
      const isComplete = extractedData?.isComplete || false;

      return {
        extractedData: extractedData || {},
        aiMessage: this.removeJSONFromMessage(aiMessage),
        confidence,
        requiresConfirmation: isComplete && confidence >= 80,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to process message with AI');
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
