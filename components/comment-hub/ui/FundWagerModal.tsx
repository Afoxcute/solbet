import React, { useState } from 'react';

interface FundWagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  walletAddress?: string;
}

const FundWagerModal: React.FC<FundWagerModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  amount,
  walletAddress = "Ey8FUGyPV2NbBxYvhvtdcSalJvZJ9JxssZalVvhddcSHMF" 
}) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-center w-full">FUND YOUR WAGER</h2>
        </div>
        
        <hr className="border-gray-300 mb-6" />
        
        <div className="mb-6">
          <p className="font-bold text-sm mb-2">Wallet Address <span className="text-red-500">*</span></p>
          <div className="flex border border-gray-300 rounded">
            <input 
              type="text"
              className="w-full py-2 px-3 text-sm outline-none"
              value={walletAddress}
              readOnly
            />
            <button 
              className="bg-gray-100 px-3 py-2 text-gray-600 hover:bg-gray-200"
              onClick={copyToClipboard}
            >
              {copied ? (
                <span className="text-green-600">✓</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          <p className="font-bold text-sm mb-2">Amount <span className="text-red-500">*</span></p>
          <div className="border border-gray-300 rounded px-3 py-2">
            <input 
              type="text"
              className="w-full outline-none"
              value={`$${amount}`}
              readOnly
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Insufficient wallet balance</p>
          <p className="text-xs text-right text-green-600 mt-1">Fund from external wallet</p>
        </div>
        
        <div className="flex justify-center">
          <button 
            className="bg-green-700 text-white px-6 py-3 rounded w-full hover:bg-green-800 transition-colors"
            onClick={onConfirm}
          >
            Confirm Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundWagerModal; 