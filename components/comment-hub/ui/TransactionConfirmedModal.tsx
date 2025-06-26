import React from 'react';

interface TransactionConfirmedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionConfirmedModal: React.FC<TransactionConfirmedModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-center w-full">TRANSACTION CONFIRMED</h2>
          <button onClick={onClose} className="text-black text-2xl">×</button>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-8 rounded-full">
            <svg 
              className="h-16 w-16 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-700 mb-2">Your wager has been placed successfully!</p>
          <p className="text-gray-500 text-sm">Transaction ID: 0x72f9b8a...</p>
        </div>
        
        <div className="flex justify-center">
          <button 
            className="bg-green-700 text-white px-6 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmedModal; 