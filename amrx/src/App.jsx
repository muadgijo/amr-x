import React, { useState, useEffect, createContext, useContext } from 'react';

// Theme context for light/dark mode
const ThemeContext = createContext();

// App Component - Main structure
export default function App() {
  const [activeTab, setActiveTab] = useState('public');
  const [showLanding, setShowLanding] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.className = theme;
    // Simulate loading time for smooth transition
    setTimeout(() => setIsLoading(false), 1500);
  }, [theme]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300 relative overflow-hidden`}>
        {/* Enhanced Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-green-300 dark:bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          {/* Floating Particles */}
          <ParticleEffect />
        </div>

        {showLanding ? (
          <LandingPage onGetStarted={() => setShowLanding(false)} />
        ) : (
          <>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="container mx-auto px-4 py-8 relative z-10">
              {activeTab === 'public' && <PublicForm />}
              {activeTab === 'pharmacist' && <PharmacistUpload />}
              {activeTab === 'dashboard' && <Dashboard />}
            </main>
            <Footer />
          </>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

// Loading Screen Component
function LoadingScreen() {
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
}

// Particle Effect Component
function ParticleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
}

function Header({ activeTab, setActiveTab }) {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <header className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white shadow-2xl relative z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Enhanced Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-all duration-300 group-hover:scale-110">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">🦠</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                AMR-X
              </h1>
              <p className="text-xs text-blue-100 font-medium tracking-wider">ANTIMICROBIAL RESISTANCE TRACKER</p>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex items-center space-x-2">
            {[
              { id: 'public', label: 'Public Form', icon: '👥' },
              { id: 'pharmacist', label: 'Pharmacist Upload', icon: '💊' },
              { id: 'dashboard', label: 'Dashboard', icon: '📊' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? 'bg-white text-emerald-700 shadow-lg transform scale-105' 
                    : 'text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Enhanced Theme Toggle */}
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-3 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 backdrop-blur-sm group"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="text-xl group-hover:rotate-180 transition-transform duration-500">
        {theme === 'dark' ? '🌞' : '🌙'}
      </span>
    </button>
  );
}

function LandingPage({ onGetStarted }) {
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowFeatures(true), 500);
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center relative z-10">
      <div className="max-w-4xl mx-auto p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 text-center backdrop-blur-sm border border-white/20">
        <div className="mb-8">
          <div className="inline-block p-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mb-6 shadow-2xl animate-pulse">
            <span className="text-6xl">🦠</span>
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
            {[
              { icon: '📊', text: 'Monitor antibiotic use and resistance trends in real time' },
              { icon: '👥', text: 'Empower the public and pharmacists to contribute data' },
              { icon: '🗺️', text: 'Visualize high-risk zones and most misused antibiotics' },
              { icon: '📚', text: 'Access up-to-date facts and tips on fighting AMR' }
            ].map((feature, index) => (
              <li key={index} className={`flex items-center space-x-3 transform transition-all duration-500 ${showFeatures ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{transitionDelay: `${index * 200}ms`}}>
                <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{feature.icon}</span>
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
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold rounded-full shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-300 text-xl transform hover:-translate-y-1 animate-bounce"
        >
          🚀 Get Started
        </button>

        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">Did you know?</span> By 2050, AMR could cause 10 million deaths annually if left unchecked.
          </p>
          <p className="mt-2 text-sm">
            Learn more: <a href="https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance" target="_blank" rel="noopener noreferrer" className="underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300">WHO: Antimicrobial Resistance</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t py-6 relative z-10">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-300">
        <p>© 2025 AMR-X. All rights reserved.</p>
        <p className="mt-2 italic">
          This platform does not provide medical advice. For prescriptions, please consult a registered doctor.
        </p>
      </div>
    </footer>
  );
}

// Enhanced Public Form Component
function PublicForm() {
  const [formData, setFormData] = useState({
    symptoms: '',
    medication: '',
    duration: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Calculate form completion progress
    const filledFields = Object.values({ ...formData, [e.target.name]: e.target.value }).filter(val => val).length;
    setProgress((filledFields / 4) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setApiError(null);
    const newErrors = {};
    if (!formData.symptoms.trim()) newErrors.symptoms = 'Symptoms are required';
    if (!formData.medication) newErrors.medication = 'Please select a medication';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.location) newErrors.location = 'Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess('Data submitted successfully!');
      setFormData({ symptoms: '', medication: '', duration: '', location: '' });
      setErrors({});
      setProgress(0);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Form Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white flex items-center justify-center">
          <span className="mr-3">👥</span>
          Public Symptom Submission
        </h2>

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800 flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        )}
        {apiError && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-center">
            <span className="mr-2">❌</span>
            {apiError}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">🏥</span>
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your symptoms in detail..."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.symptoms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.symptoms && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.symptoms}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">💊</span>
              Medication Taken
            </label>
            <select
              name="medication"
              value={formData.medication}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.medication ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Select Medication</option>
              <option value="amoxicillin">Amoxicillin</option>
              <option value="azithromycin">Azithromycin</option>
              <option value="ciprofloxacin">Ciprofloxacin</option>
            </select>
            {errors.medication && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.medication}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">⏱️</span>
              Treatment Duration (days)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              max="30"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.duration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.duration && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.duration}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">📍</span>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City or Region"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.location && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.location}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Submitting...
            </>
          ) : (
            <>
              <span className="mr-2">📤</span>
              Submit Data
            </>
          )}
        </button>

        <Disclaimer />
      </form>
    </div>
  );
}

// Enhanced Pharmacist Upload Component
function PharmacistUpload() {
  const [formData, setFormData] = useState({
    medicineName: '',
    category: '',
    quantity: '',
    region: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const filledFields = Object.values({ ...formData, [e.target.name]: e.target.value }).filter(val => val).length;
    setProgress((filledFields / 4) * 100);
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setApiError(null);
    const newErrors = {};
    if (!formData.medicineName.trim()) newErrors.medicineName = 'Medicine name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || isNaN(formData.quantity)) newErrors.quantity = 'Valid quantity is required';
    if (!formData.region.trim()) newErrors.region = 'Region is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      let res, data;
      if (csvFile) {
        const form = new FormData();
        form.append('csv', csvFile);
        res = await fetch('http://localhost:5000/api/pharmacist/csv', {
          method: 'POST',
          body: form
        });
        data = await res.json();
      } else {
        res = await fetch('http://localhost:5000/api/pharmacist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess('Prescription logged successfully!');
      setFormData({ medicineName: '', category: '', quantity: '', region: '' });
      setCsvFile(null);
      setErrors({});
      setProgress(0);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Form Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white flex items-center justify-center">
          <span className="mr-3">💊</span>
          Log Prescription
        </h2>

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800 flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        )}
        {apiError && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-center">
            <span className="mr-2">❌</span>
            {apiError}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">💊</span>
              Medicine Name
            </label>
            <input
              type="text"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              placeholder="e.g., Amoxicillin"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.medicineName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.medicineName && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.medicineName}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">📂</span>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Select Category</option>
              <option value="penicillins">Penicillins</option>
              <option value="cephalosporins">Cephalosporins</option>
              <option value="macrolides">Macrolides</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.category}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">🔢</span>
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">📍</span>
              Region
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Region"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.region ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.region && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.region}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
              <span className="mr-2">📁</span>
              CSV Batch Upload (Optional)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Submitting...
            </>
          ) : (
            <>
              <span className="mr-2">📤</span>
              Log Prescription
            </>
          )}
        </button>

        <Disclaimer />
      </form>
    </div>
  );
}

// Enhanced Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/api/dashboard');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to fetch dashboard data. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-400 font-semibold mb-2">Dashboard Error</p>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Entries", value: stats.totalEntries, icon: <ChartIcon />, color: "emerald", description: "Total submissions" },
          { title: "Top High-Risk Zone", value: stats.highRiskZones[0], icon: <MapIcon />, color: "red", description: "Most affected area" },
          { title: "Most Misused Antibiotic", value: stats.commonAntibiotics[0], icon: <PillIcon />, color: "blue", description: "Frequently prescribed" },
          { title: "Second Most Misused", value: stats.commonAntibiotics[1], icon: <PillIcon />, color: "purple", description: "Second most common" }
        ].map((card, index) => (
          <StatCard 
            key={index}
            {...card}
            isSelected={selectedCard === index}
            onClick={() => setSelectedCard(selectedCard === index ? null : index)}
          />
        ))}
      </div>

      {/* Enhanced Charts and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center group hover:shadow-2xl transition-all duration-300">
          <img src="https://placehold.co/800x400?text=Heatmap+Placeholder" alt="Heatmap of antibiotic resistance risk" className="rounded-xl w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center group hover:shadow-2xl transition-all duration-300">
          <img src="https://placehold.co/600x400?text=Bar+Chart+Placeholder" alt="Misused antibiotics bar chart" className="rounded-xl w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center group hover:shadow-2xl transition-all duration-300">
          <img src="https://placehold.co/600x400?text=Trend+Chart+Placeholder" alt="Resistance trend over time" className="rounded-xl w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, icon, color, description, isSelected, onClick }) {
  const bgColorClass = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  }[color];

  return (
    <div 
      className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${isSelected ? 'ring-2 ring-emerald-500 scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-4 rounded-xl ${bgColorClass} text-white mr-4 shadow-lg`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Icons
function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// Disclaimer Component
function Disclaimer() {
  return (
    <p className="mt-6 text-xs italic text-gray-500 dark:text-gray-400 text-center">
      This platform does not provide medical advice. For prescriptions, please consult a registered doctor.
    </p>
  );
}