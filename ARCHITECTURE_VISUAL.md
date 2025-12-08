# Visual System Architecture Guide

## 🏗️ High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Browser                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   React Application                         │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │            ChatInterface Component                  │   │ │
│  │  │  ┌──────────────┐  ┌──────────────┐               │   │ │
│  │  │  │  Messages    │  │  Chat Input  │               │   │ │
│  │  │  └──────────────┘  └──────────────┘               │   │ │
│  │  │  ┌──────────────────────────────────────────────┐ │   │ │
│  │  │  │  PSWList Component | Booking Confirmation   │ │   │ │
│  │  │  └──────────────────────────────────────────────┘ │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  │                                                          │ │
│  │         Zustand Store (chatStore.ts)                   │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │  Messages, Bookings, PSWs, Extracted Data       │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTP (Axios)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Backend                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Route Handler                              │ │
│  │  /api/chat/message | /api/booking/* | /api/psw/*         │ │
│  └──────────────┬──────────────────────────────────────────────┘ │
│                 │                                               │
│  ┌──────────────┴──────────────────────────────────────────────┐ │
│  │                 Controllers Layer                          │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  chatController | bookingController | pswController │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └──────┬─────────┬─────────────────────────────────┬─────────┘ │
│         │         │                                 │            │
│  ┌──────↓─┐ ┌────↓────┐ ┌──────────────┐  ┌──────↓──────┐     │
│  │   AI   │ │ Firebase│ │ PSW Matching │  │   Firebase  │     │
│  │Service │ │ Service │ │   Service    │  │    Admin    │     │
│  └────────┘ └─────────┘ └──────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────┘
        │              │                            │
        ↓              ↓                            ↓
   ┌─────────────┐ ┌──────────────┐      ┌──────────────────┐
   │  OpenAI     │ │ Firestore    │      │  Google Maps API │
   │  GPT-4 API  │ │  Database    │      │  (Geolocation)   │
   └─────────────┘ └──────────────┘      └──────────────────┘
```

## 📊 Data Model Relationships

```
┌─────────────┐
│   Client    │
│  (Profile)  │
└──────┬──────┘
       │ creates
       ↓
┌──────────────────┐
│  Conversation    │
│  (Chat History)  │
└──────┬───────────┘
       │ contains multiple
       ↓
┌──────────────────┐        ┌────────────────┐
│  Chat Messages   │        │  Booking Data  │
│  (AI & User)     │        │  (Extracted)   │
└──────────────────┘        └──────┬─────────┘
                                   │ leads to
                                   ↓
                            ┌──────────────┐
                            │  Booking     │
                            │  (Appointment)
                            └──────┬───────┘
                                   │ books
                                   ↓
                            ┌──────────────┐
                            │     PSW      │
                            │   (Worker)   │
                            └──────────────┘
```

## 🔄 Request/Response Flow

```
Client Request: "I need a PSW on Monday morning near me"
        │
        ├─→ [ChatInterface.tsx]
        │   ├─ Store message in Zustand
        │   └─ Show typing indicator
        │
        ├─→ [Axios API Client]
        │   ├─ POST /api/chat/message
        │   └─ Include conversationId, clientId
        │
        ├─→ [Express Route]
        │   └─ Route to chatController
        │
        ├─→ [Chat Controller]
        │   ├─ Extract parameters
        │   ├─ Log request
        │   └─ Call services
        │
        ├─→ [AI Service]
        │   ├─ Call GPT-4 API
        │   ├─ Parse response
        │   ├─ Extract structured data:
        │   │   {
        │   │     location: {lat, lng},
        │   │     desiredDate: "2024-01-15",
        │   │     desiredStartTime: "09:00",
        │   │     isComplete: true
        │   │   }
        │   └─ Return extraction result
        │
        ├─→ [Firebase Service]
        │   ├─ Store conversation
        │   ├─ Save chat messages
        │   └─ Update extracted data
        │
        ├─→ [PSW Matching Service]
        │   ├─ Get all PSWs
        │   ├─ Filter by proximity (15km)
        │   ├─ Filter by availability (Monday morning)
        │   ├─ Calculate scores
        │   ├─ Rank by relevance
        │   └─ Return top 5
        │
        ├─→ [Response Object]
        │   {
        │     conversationId: "...",
        │     aiMessage: "I found 3 PSWs...",
        │     extractedData: {...},
        │     suggestedPSWs: [{...}, {...}, ...],
        │     requiresConfirmation: false
        │   }
        │
        └─→ [Frontend]
            ├─ Receive response
            ├─ Add AI message to chat
            ├─ Update Zustand store
            ├─ Render PSW list
            └─ Display to user
```

## 🗂️ Component Hierarchy

```
App
│
├─ Loading State
│  └─ Spinner + Message
│
└─ ChatInterface
   │
   ├─ Header
   │  ├─ Title: "PSW Booking Assistant"
   │  └─ Status: "Gathering Information..."
   │
   ├─ Main Content
   │  │
   │  ├─ Messages Area (60% width)
   │  │  ├─ Welcome Message (if empty)
   │  │  ├─ Chat Messages (scrollable)
   │  │  │  ├─ Message (client - right aligned)
   │  │  │  ├─ Message (AI - left aligned)
   │  │  │  └─ Typing Indicator (when loading)
   │  │  └─ Auto-scroll to bottom
   │  │
   │  └─ Sidebar (40% width)
   │     ├─ PSWList Component
   │     │  ├─ Title: "Available Workers"
   │     │  └─ PSW Items
   │     │     ├─ Name & Rating
   │     │     ├─ Certifications
   │     │     └─ Service Types
   │     │
   │     └─ BookingConfirmation Component
   │        ├─ Booking Details
   │        │  ├─ Worker Name
   │        │  ├─ Date
   │        │  ├─ Time
   │        │  └─ Service Type
   │        └─ Confirm Button
   │
   ├─ Input Area (10% height)
   │  ├─ Text Input
   │  └─ Send Button
   │
   └─ Error Message (if error)
```

## 🛣️ API Endpoint Routes

```
/api
│
├─ /chat
│  ├─ POST /message          → chatController.sendMessage()
│  ├─ POST /conversation     → chatController.createConversation()
│  └─ GET  /conversation/:id → chatController.getConversation()
│
├─ /psw
│  ├─ POST /available        → pswController.getAvailablePSWs()
│  ├─ GET  /:pswId           → pswController.getPSWProfile()
│  └─ GET  /search           → pswController.searchPSWs()
│
└─ /booking
   ├─ POST /confirm          → bookingController.confirmBooking()
   ├─ GET  /:bookingId       → bookingController.getBooking()
   ├─ PATCH /:bookingId      → bookingController.updateBooking()
   ├─ DELETE /:bookingId     → bookingController.cancelBooking()
   └─ GET  /list             → bookingController.listBookings()
```

## 🗄️ Firestore Data Structure

```
Firestore
│
├─ clients/
│  ├─ {clientId}
│  │  ├─ id: string
│  │  ├─ name: string
│  │  ├─ email: string
│  │  ├─ location: {latitude, longitude, ...}
│  │  ├─ preferences: {...}
│  │  ├─ createdAt: timestamp
│  │  └─ updatedAt: timestamp
│
├─ psws/
│  ├─ {pswId}
│  │  ├─ id: string
│  │  ├─ name: string
│  │  ├─ location: {latitude, longitude, ...}
│  │  ├─ certifications: [string]
│  │  ├─ ratings: number
│  │  ├─ availableTimeSlots: [{date, startTime, endTime}]
│  │  ├─ serviceTypes: [string]
│  │  ├─ createdAt: timestamp
│  │  └─ updatedAt: timestamp
│
├─ bookings/
│  ├─ {bookingId}
│  │  ├─ clientId: string
│  │  ├─ pswId: string
│  │  ├─ startTime: timestamp
│  │  ├─ endTime: timestamp
│  │  ├─ serviceType: string
│  │  ├─ status: 'pending'|'confirmed'|'completed'|'cancelled'
│  │  ├─ createdAt: timestamp
│  │  └─ updatedAt: timestamp
│
└─ conversations/
   ├─ {conversationId}
   │  ├─ clientId: string
   │  ├─ messages: [{sender, content, timestamp}]
   │  ├─ extractedData: {
   │  │  ├─ clientLocation: {...}
   │  │  ├─ desiredDate: timestamp
   │  │  ├─ desiredStartTime: string
   │  │  ├─ desiredEndTime: string
   │  │  ├─ serviceType: string
   │  │  ├─ isComplete: boolean
   │  │  └─ confidence: number
   │  ├─ status: 'active'|'completed'|'archived'
   │  ├─ createdAt: timestamp
   │  └─ updatedAt: timestamp
```

## 🔐 Security Layer

```
Client Request
    ↓
[CORS Middleware]
├─ Verify origin
└─ Set appropriate headers
    ↓
[Body Parser]
├─ Parse JSON
└─ Validate format
    ↓
[Firebase Auth] (Optional - can be added)
├─ Verify token
└─ Get userId
    ↓
[Route Handler]
├─ Validate parameters
└─ Check authorization
    ↓
[Business Logic]
├─ Process request
└─ Access Firestore
    ↓
[Error Handler]
├─ Catch errors
└─ Return safe response
```

## 📈 Scalability Architecture

```
Load Balancer
│
├─ Backend Instance 1 (Docker)
│  └─ Express Server + Services
│
├─ Backend Instance 2 (Docker)
│  └─ Express Server + Services
│
└─ Backend Instance N
   └─ Express Server + Services
        │
        └─→ Firebase (Auto-scales)
```

## 🧠 AI Processing Pipeline

```
User Message
    ↓
[Tokenization]
└─ Convert to tokens for GPT-4
    ↓
[Context Building]
├─ Include system prompt
├─ Include conversation history
└─ Include extracted data
    ↓
[GPT-4 API Call]
├─ Send prompt
├─ Wait for response
└─ Handle rate limiting
    ↓
[Response Parsing]
├─ Extract text message
├─ Parse JSON block
└─ Validate structure
    ↓
[Data Extraction]
├─ Merge with existing data
├─ Calculate confidence
└─ Check completeness
    ↓
[Response Preparation]
├─ Format AI message
├─ Filter PSWs if ready
└─ Generate ranking
```

## 🎨 UI State Machine

```
┌─────────────┐
│   Loading   │  ← Fetching data from API
└─────┬───────┘
      │ data loaded
      ↓
┌─────────────┐
│   Idle      │  ← Ready to send message
└─────┬───────┘
      │ message sent
      ↓
┌─────────────┐
│   Sending   │  ← API call in progress
└─────┬───────┘
      │ response received
      ├─→ success → Idle
      └─→ error → Error State
      
┌─────────────┐
│   Error     │  ← Display error message
└─────┬───────┘
      │ user clicks retry
      └─→ Sending
```

## 🔄 Booking Confirmation Flow

```
Start
  │
  ├─ User selects PSW from list
  │
  ├─ BookingConfirmation component shows
  │
  ├─ Review booking details:
  │  ├─ Worker name
  │  ├─ Date (extracted from AI)
  │  ├─ Time (extracted from AI)
  │  └─ Service type
  │
  ├─ User clicks "Confirm Booking"
  │
  ├─ POST /api/booking/confirm
  │
  ├─ Backend creates booking in Firestore
  │
  ├─ Response includes booking ID
  │
  ├─ Frontend updates state
  │
  ├─ AI sends confirmation message
  │
  └─ Booking saved to database
```

---

This visual guide helps understand how all components fit together in the system!
