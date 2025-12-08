# API Reference

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.pswbooking.com/api (example)
```

## Authentication

Include Bearer token in Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are JSON with the following structure:

### Success Response (2xx)
```json
{
  "data": {},
  "message": "Success message"
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Endpoints

### Chat API

#### POST /chat/message
Send a message in an active conversation.

**Request:**
```json
{
  "conversationId": "string",
  "clientId": "string",
  "message": "string"
}
```

**Response (200):**
```json
{
  "conversationId": "string",
  "aiMessage": "string",
  "extractedData": {
    "clientLocation": {
      "latitude": number,
      "longitude": number,
      "postalCode": "string",
      "address": "string"
    },
    "desiredDate": "2024-01-15",
    "desiredStartTime": "09:00",
    "desiredEndTime": "12:00",
    "serviceType": "string",
    "pswPreferences": {
      "maxDistance": number,
      "minRating": number,
      "certifications": ["string"]
    },
    "isComplete": boolean,
    "confidence": number
  },
  "suggestedPSWs": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "location": {},
      "certifications": ["string"],
      "ratings": number,
      "reviewCount": number,
      "availableTimeSlots": [],
      "serviceTypes": ["string"]
    }
  ],
  "requiresConfirmation": boolean
}
```

**Error (400):**
```json
{
  "error": "Missing required fields"
}
```

#### POST /chat/conversation
Create a new conversation.

**Request:**
```json
{
  "clientId": "string"
}
```

**Response (201):**
```json
{
  "id": "string",
  "clientId": "string",
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### GET /chat/conversation/{conversationId}
Retrieve a conversation and its history.

**Response (200):**
```json
{
  "id": "string",
  "clientId": "string",
  "messages": [
    {
      "id": "string",
      "conversationId": "string",
      "sender": "client|ai",
      "content": "string",
      "timestamp": "2024-01-15T10:00:00Z",
      "metadata": {}
    }
  ],
  "extractedData": {},
  "status": "active|completed|archived",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### PSW API

#### POST /psw/available
Get available PSWs matching criteria.

**Request:**
```json
{
  "location": {
    "latitude": number,
    "longitude": number,
    "postalCode": "string"
  },
  "radius": number,
  "desiredDate": "2024-01-15T00:00:00Z",
  "startTime": "09:00",
  "endTime": "12:00",
  "serviceType": "string (optional)"
}
```

**Response (200):**
```json
{
  "pswProfiles": [...],
  "totalCount": number
}
```

**Filters Applied:**
1. Proximity (within radius km)
2. Availability (time slot match)
3. Service type (if specified)
4. Rating (if minimum specified)
5. Certifications (if required specified)

**Ranking Criteria:**
- Distance to client (closer = higher score)
- PSW ratings (higher = higher score)
- Review count (more reviews = higher score)

#### GET /psw/{pswId}
Get detailed profile of a specific PSW.

**Response (200):**
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "phone": "string",
  "location": {
    "latitude": number,
    "longitude": number,
    "postalCode": "string",
    "address": "string"
  },
  "certifications": ["CPR", "First Aid"],
  "ratings": 4.8,
  "reviewCount": 45,
  "availableTimeSlots": [
    {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ],
  "serviceTypes": ["General Support", "Companion Care"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### GET /psw/search
Search for PSWs by name or service type.

**Query Parameters:**
- `query` (required): Search term
- `lat` (required): Latitude for proximity ranking
- `lng` (required): Longitude for proximity ranking

**Response (200):**
```json
{
  "results": [...],
  "totalCount": number
}
```

### Booking API

#### POST /booking/confirm
Confirm and create a booking.

**Request:**
```json
{
  "clientId": "string",
  "pswId": "string",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "serviceType": "string",
  "conversationId": "string"
}
```

**Response (201):**
```json
{
  "booking": {
    "id": "string",
    "clientId": "string",
    "pswId": "string",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T12:00:00Z",
    "serviceType": "string",
    "status": "confirmed",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "confirmationMessage": "Your booking has been confirmed..."
}
```

#### GET /booking/{bookingId}
Retrieve booking details.

**Response (200):**
```json
{
  "id": "string",
  "clientId": "string",
  "pswId": "string",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "serviceType": "string",
  "status": "pending|confirmed|completed|cancelled",
  "notes": "string",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### PATCH /booking/{bookingId}
Update a booking (reschedule, add notes, etc).

**Request:**
```json
{
  "startTime": "2024-01-16T09:00:00Z",
  "endTime": "2024-01-16T12:00:00Z",
  "notes": "Updated notes"
}
```

**Response (200):**
Updated booking object.

#### DELETE /booking/{bookingId}
Cancel a booking.

**Response (200):**
```json
{
  "message": "Booking cancelled successfully"
}
```

#### GET /booking/list
List all bookings for a client.

**Query Parameters:**
- `clientId` (required): Client ID

**Response (200):**
```json
{
  "bookings": [...],
  "totalCount": number
}
```

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_REQUEST | 400 | Missing or invalid request parameters |
| NOT_FOUND | 404 | Resource not found |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| CONFLICT | 409 | Resource conflict (e.g., double booking) |
| INTERNAL_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Rate limit headers:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: remaining requests
  - `X-RateLimit-Reset`: Unix timestamp of reset time

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

## Webhooks

Subscribe to events via webhooks:

**Supported Events:**
- `booking.created`
- `booking.confirmed`
- `booking.cancelled`
- `booking.completed`

**Configuration:**
POST /webhooks/subscribe
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["booking.confirmed"],
  "secret": "your-secret-key"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    Authorization: 'Bearer your-token'
  }
});

// Send chat message
const response = await client.post('/chat/message', {
  conversationId: 'conv_123',
  clientId: 'client_456',
  message: 'I need a PSW on Monday morning'
});
```

### Python

```python
import requests

BASE_URL = 'http://localhost:5000/api'
HEADERS = {
    'Authorization': 'Bearer your-token'
}

response = requests.post(
    f'{BASE_URL}/chat/message',
    json={
        'conversationId': 'conv_123',
        'clientId': 'client_456',
        'message': 'I need a PSW on Monday morning'
    },
    headers=HEADERS
)
```

### cURL

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "conversationId": "conv_123",
    "clientId": "client_456",
    "message": "I need a PSW on Monday morning"
  }'
```
