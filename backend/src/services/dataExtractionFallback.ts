import type { BookingData } from '../types/index.js';

export function extractBookingDataFromMessage(message: string): Partial<BookingData> {
  const extractedData: Partial<BookingData> = {};
  const lowerMessage = message.toLowerCase();

  // 1. Extract DATES - look for month names and dates
  const datePatterns = [
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+\d{4})?/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(?:tomorrow|today|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
  ];

  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      const dateStr = match[0];
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          extractedData.desiredDate = date;
          break;
        }
      } catch (e) {
        extractedData.desiredDate = dateStr as any;
      }
    }
  }

  // 2. Extract TIME - look for time patterns
  const timePatterns = [
    /(\d{1,2}):?(\d{2})?\s*(am|pm)\s*(?:-|to|–)\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/i,
    /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
  ];

  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      const startHour = parseInt(match[1]);
      const startMin = match[2] ? parseInt(match[2]) : 0;
      const startAmpm = (match[3] || '').toUpperCase() || 'AM';
      
      extractedData.desiredStartTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} ${startAmpm}`;

      if (match[4]) {
        const endHour = parseInt(match[4]);
        const endMin = match[5] ? parseInt(match[5]) : 0;
        const endAmpm = (match[6] || startAmpm || 'AM').toUpperCase();
        
        extractedData.desiredEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')} ${endAmpm}`;
      }
      break;
    }
  }

  // 3. Extract LOCATION - remove known non-location words first
  const nonLocationWords = new Set([
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'am', 'pm', 'at', 'on', 'in', 'near', 'around', 'from', 'to', 'the', 'and', 'or', 'for', 'a', 'an',
    'psw', 'personal', 'support', 'worker', 'i', 'need', 'want', 'looking', 'searching'
  ]);

  // Look for capitalized words that might be locations
  const capitalizedWords = message.match(/\b[A-Z][a-z]+\b/g) || [];
  for (const word of capitalizedWords) {
    if (!nonLocationWords.has(word.toLowerCase()) && word.length > 2) {
      extractedData.clientLocation = { address: word, latitude: 0, longitude: 0 };
      break;
    }
  }

  // If no capitalized location found, try common city patterns
  const commonCities = ['toronto', 'vancouver', 'calgary', 'montreal', 'ottawa', 'winnipeg', 'edmonton', 'quebec'];
  for (const city of commonCities) {
    if (lowerMessage.includes(city)) {
      extractedData.clientLocation = { address: city.charAt(0).toUpperCase() + city.slice(1), latitude: 0, longitude: 0 };
      break;
    }
  }

  // 4. Extract SERVICE TYPE
  const serviceKeywords = {
    caregiving: ['caregiv', 'care', 'elderly', 'senior', 'assist'],
    companion: ['compan', 'friend', 'social', 'visit'],
    medical: ['medical', 'nurse', 'health'],
    domestic: ['clean', 'house', 'cook', 'meal'],
  };

  for (const [serviceType, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      extractedData.serviceType = serviceType;
      break;
    }
  }

  // 5. Calculate completion status
  const hasLocation = !!extractedData.clientLocation;
  const hasDate = !!extractedData.desiredDate;
  const hasTime = !!extractedData.desiredStartTime;

  if (hasLocation && hasDate && hasTime) {
    extractedData.isComplete = true;
    extractedData.confidence = 0.9;
  } else if ((hasLocation && hasDate) || (hasLocation && hasTime) || (hasDate && hasTime)) {
    extractedData.confidence = 0.6;
  } else if (hasLocation || hasDate || hasTime) {
    extractedData.confidence = 0.4;
  } else {
    extractedData.confidence = 0.1;
  }

  return extractedData;
}

export function generateAIFallbackMessage(
  userMessage: string,
  extractedData: Partial<BookingData>
): string {
  const hasLocation = !!extractedData.clientLocation;
  const hasDate = !!extractedData.desiredDate;
  const hasTime = !!extractedData.desiredStartTime;
  const locationStr = extractedData.clientLocation?.address || '';

  if (hasLocation && hasDate && hasTime) {
    return `Great! I found the following details:\n- Location: ${locationStr}\n- Date: ${extractedData.desiredDate}\n- Time: ${extractedData.desiredStartTime} - ${extractedData.desiredEndTime || 'TBD'}\n\nLet me search for available PSWs in your area with these requirements.`;
  }

  const missing = [];
  if (!hasLocation) missing.push('location (e.g., city or postal code)');
  if (!hasDate) missing.push('preferred date');
  if (!hasTime) missing.push('preferred time');

  const found = [hasLocation && `Location: ${locationStr}`, hasDate && `Date: ${extractedData.desiredDate}`, hasTime && `Time: ${extractedData.desiredStartTime}`].filter(Boolean).join(', ');

  return `Thank you for providing: ${userMessage}\n\nI found: ${found || 'some information'}\n\nTo help you better, could you please provide: ${missing.join(', ')}?`;
}
