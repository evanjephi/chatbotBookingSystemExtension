import React, { useEffect, useRef, useState } from 'react';
import { chatAPI, pswAPI } from '../services/api';
import { useChatStore } from '../store/chatStore';
import type { ChatMessage } from '../types';
import PSWList from './PSWList';
import BookingConfirmation from './BookingConfirmation';
import './ChatInterface.css';

interface ChatInterfaceProps {
  clientId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ clientId }) => {
  const {
    conversationId,
    messages,
    setConversationId,
    setClientId,
    addMessage,
    setIsLoading,
    setError,
    bookingData,
    availablePSWs,
    selectedPSW,
    isLoading,
    error,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation on component mount
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        console.log('Initializing conversation for client:', clientId);
        setClientId(clientId);
        const conversation = await chatAPI.createConversation(clientId);
        console.log('Conversation created:', conversation);
        setConversationId(conversation.id);
      } catch (err) {
        console.error('Failed to initialize conversation:', err);
        setError(`Failed to start chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    if (!conversationId && clientId) {
      initializeConversation();
    }
  }, [clientId]);

  // Auto-scroll to bottom of messages and focus input
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !conversationId) return;

    // Add user message to store
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId,
      sender: 'client',
      content: inputValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to AI backend
      const response = await chatAPI.sendMessage({
        conversationId,
        clientId,
        message: inputValue,
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + 'ai',
        conversationId,
        sender: 'ai',
        content: response.aiMessage,
        timestamp: new Date(),
        metadata: response.extractedData,
      };

      addMessage(aiMessage);

      // If PSWs are suggested, fetch their full profiles
      if (response.suggestedPSWs) {
        await Promise.all(
          response.suggestedPSWs.map((psw) => pswAPI.getPSWProfile(psw.id))
        );
        // Set available PSWs in store (handled by component using selector)
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + 'error',
        conversationId,
        sender: 'ai',
        content:
          'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      // Return focus to input after message is sent
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>PSW Booking Assistant</h1>
        <p className="status">
          {bookingData.isComplete ? '✓ Booking Ready' : 'Gathering Information...'}
        </p>
      </div>

      <div className="chat-main">
        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>Welcome to PSW Booking</h2>
              <p>
                Tell me what you need! For example: "I need a PSW near me on
                Monday morning" or "I'm looking for a certified caregiver for
                afternoon shifts"
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.sender}`}>
                <div className="message-content">{msg.content}</div>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message message-ai loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Right Sidebar - PSWs & Booking */}
        <div className="sidebar">
          {availablePSWs.length > 0 && <PSWList />}
          {selectedPSW && bookingData.isComplete && (
            <BookingConfirmation pswProfile={selectedPSW} />
          )}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="chat-input"
          autoComplete="off"
        />
        <button type="submit" disabled={isLoading || !inputValue.trim() || !conversationId}>
          Send
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ChatInterface;
