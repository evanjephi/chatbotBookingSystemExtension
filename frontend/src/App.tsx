import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would come from authentication
    // For now, generate a temporary client ID or get from localStorage
    const storedClientId = localStorage.getItem('clientId');
    if (storedClientId) {
      setClientId(storedClientId);
    } else {
      const newClientId = `client_${Date.now()}`;
      localStorage.setItem('clientId', newClientId);
      setClientId(newClientId);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading PSW Booking System...</p>
      </div>
    );
  }

  return (
    <main className="app">
      {clientId && <ChatInterface clientId={clientId} />}
    </main>
  );
}

export default App;
