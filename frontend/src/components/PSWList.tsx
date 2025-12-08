import React from 'react';
import { useChatStore } from '../store/chatStore';
import type { PSWProfile } from '../types';
import './PSWList.css';

const PSWList: React.FC = () => {
  const { availablePSWs, selectedPSW, selectPSW } = useChatStore();

  if (availablePSWs.length === 0) {
    return null;
  }

  const handleSelectPSW = (psw: PSWProfile) => {
    selectPSW(psw);
  };

  return (
    <div className="psw-list">
      <h3>Available Workers</h3>
      <div className="psw-items">
        {availablePSWs.map((psw) => (
          <div
            key={psw.id}
            className={`psw-item ${selectedPSW?.id === psw.id ? 'selected' : ''}`}
            onClick={() => handleSelectPSW(psw)}
          >
            <div className="psw-header">
              <h4>{psw.name}</h4>
              <div className="psw-rating">
                <span className="stars">
                  {'★'.repeat(Math.floor(psw.ratings))}
                </span>
                <span className="count">({psw.reviewCount})</span>
              </div>
            </div>
            <div className="psw-details">
              <p className="certifications">
                <strong>Certifications:</strong> {psw.certifications.join(', ')}
              </p>
              <p className="services">
                <strong>Services:</strong> {psw.serviceTypes.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PSWList;
