import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-4xl">🦠</span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">AMR-X</h1>
        <div className="flex space-x-2 justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        <p className="text-white/80 mt-4 text-lg">Loading Antimicrobial Resistance Tracker...</p>
      </div>
    </div>
  );
}; 