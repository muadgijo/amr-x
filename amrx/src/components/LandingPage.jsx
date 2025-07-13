import React, { useState, useEffect } from 'react';

export const LandingPage = ({ onGetStarted }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: '📊', text: 'Monitor antibiotic use and resistance trends in real time' },
    { icon: '👥', text: 'Empower the public and pharmacists to contribute data' },
    { icon: '🗺️', text: 'Visualize high-risk zones and most misused antibiotics' },
    { icon: '📚', text: 'Access up-to-date facts and tips on fighting AMR' }
  ];

  const handleGetStarted = () => {
    onGetStarted();
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center relative z-10">
      <div className="max-w-4xl mx-auto p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 text-center backdrop-blur-sm border border-white/20">
        <div className="mb-8">
          <div className="inline-block p-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mb-6 shadow-2xl animate-pulse">
            <span className="text-6xl" role="img" aria-label="Microbe">🦠</span>
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tight bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            AMR-X
          </h1>
          <p className="text-xl mb-6 text-gray-700 dark:text-gray-200 font-medium animate-fade-in-delay">
            A next-generation platform to track, analyze, and combat 
            <span className="font-bold text-emerald-600 dark:text-emerald-400"> Antimicrobial Resistance (AMR)</span> worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="text-left">
            <h2 className="text-2xl font-bold mb-4 text-emerald-700 dark:text-emerald-400">Why AMR-X?</h2>
            {features.map((feature, index) => (
              <li 
                key={index} 
                className={`flex items-center space-x-3 transform transition-all duration-500 ${
                  showFeatures ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                }`} 
                style={{transitionDelay: `${index * 200}ms`}}
              >
                <span 
                  className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  role="img"
                  aria-label={feature.text}
                >
                  {feature.icon}
                </span>
                <span>{feature.text}</span>
              </li>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80" 
                alt="Antibiotic resistance research" 
                className="rounded-2xl shadow-2xl w-full max-w-sm transform group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGetStarted}
          className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold rounded-full shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-300 text-xl transform hover:-translate-y-1 animate-bounce"
          aria-label="Get started with AMR-X"
        >
          🚀 Get Started
        </button>

        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">Did you know?</span> By 2050, AMR could cause 10 million deaths annually if left unchecked.
          </p>
          <p className="mt-2 text-sm">
            Learn more: <a 
              href="https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
            >
              WHO: Antimicrobial Resistance
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}; 