'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onClose,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="formal-card" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        border: 'none',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '0'
      }}>
        <div style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{
            background: isDestructive ? '#fef2f2' : '#eff6ff',
            color: isDestructive ? '#ef4444' : 'var(--accent)',
            padding: '10px',
            borderRadius: '50%',
            height: 'fit-content'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>
        
        <div style={{ 
          padding: '1rem 1.5rem', 
          background: '#f8fafc', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '0.75rem' 
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'white',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: isDestructive ? '#ef4444' : 'var(--accent)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
