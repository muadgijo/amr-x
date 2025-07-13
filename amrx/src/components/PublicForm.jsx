import React from 'react';
import { useForm } from '../hooks/useForm';
import { FormField, Input, TextArea, Select, Button } from './ui/FormField';
import ApiService from '../services/api';

export const PublicForm = ({ onSuccess }) => {
  const validationRules = {
    symptoms: { required: 'Symptoms are required' },
    medication: { required: 'Please select a medication' },
    duration: { 
      required: 'Duration is required',
      min: 1,
      max: 30,
      message: 'Duration must be between 1 and 30 days'
    },
    location: { required: 'Location is required' }
  };

  const {
    formData,
    errors,
    loading,
    success,
    apiError,
    progress,
    handleChange,
    submitForm,
    resetForm
  } = useForm({
    symptoms: '',
    medication: '',
    duration: '',
    location: ''
  }, validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitForm(ApiService.submitPublicData);
    if (result && onSuccess) {
      onSuccess();
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
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white flex items-center justify-center">
          <span className="mr-3" role="img" aria-label="Public">👥</span>
          Public Symptom Submission
        </h2>

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800 flex items-center">
            <span className="mr-2" role="img" aria-label="Success">✅</span>
            {success}
          </div>
        )}
        
        {apiError && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-center">
            <span className="mr-2" role="img" aria-label="Error">❌</span>
            {apiError}
          </div>
        )}

        <div className="space-y-6">
          <FormField
            label="Symptoms"
            icon="🏥"
            error={errors.symptoms}
            required
          >
            <TextArea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Describe your symptoms in detail..."
              error={errors.symptoms}
              rows="4"
            />
          </FormField>

          <FormField
            label="Medication Taken"
            icon="💊"
            error={errors.medication}
            required
          >
            <Select
              id="medication"
              name="medication"
              value={formData.medication}
              onChange={handleChange}
              error={errors.medication}
              options={[
                { value: '', label: 'Select Medication' },
                { value: 'amoxicillin', label: 'Amoxicillin' },
                { value: 'azithromycin', label: 'Azithromycin' },
                { value: 'ciprofloxacin', label: 'Ciprofloxacin' },
                { value: 'doxycycline', label: 'Doxycycline' },
                { value: 'penicillin', label: 'Penicillin' }
              ]}
            />
          </FormField>

          <FormField
            label="Treatment Duration (days)"
            icon="⏱️"
            error={errors.duration}
            required
          >
            <Input
              id="duration"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Enter duration in days"
              error={errors.duration}
              min="1"
              max="30"
            />
          </FormField>

          <FormField
            label="Location"
            icon="📍"
            error={errors.location}
            required
          >
            <Input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City or Region"
              error={errors.location}
            />
          </FormField>
        </div>

        <div className="flex space-x-4 mt-8">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            <span className="mr-2" role="img" aria-label="Send">📤</span>
            Submit Data
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
          >
            Reset
          </Button>
        </div>

        <Disclaimer />
      </form>
    </div>
  );
};

const Disclaimer = () => (
  <p className="mt-6 text-xs italic text-gray-500 dark:text-gray-400 text-center">
    This platform does not provide medical advice. For prescriptions, please consult a registered doctor.
  </p>
); 