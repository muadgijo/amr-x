import React from 'react';
import { useForm } from '../hooks/useForm';
import { FormField, Input, Select, Button } from './ui/FormField';
import ApiService from '../services/api';

export const PharmacistUpload = ({ refreshDashboard, onUploadSuccess }) => {
  const validationRules = {
    medicineName: { required: 'Medicine name is required' },
    category: { required: 'Please select a category' },
    quantity: { 
      required: 'Quantity is required',
      min: 1,
      max: 10000,
      message: 'Quantity must be between 1 and 10,000'
    },
    region: { required: 'Region is required' }
  };

  const {
    formData,
    errors,
    loading,
    success,
    apiError,
    handleChange,
    submitForm
  } = useForm({
    medicineName: '',
    category: '',
    quantity: '',
    region: ''
  }, validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitForm(ApiService.submitPharmacistData);
    console.log('[PharmacistUpload] Submission result:', success);
    console.log('[PharmacistUpload] Success state:', success);
    console.log('[PharmacistUpload] API Error state:', apiError);
    if (success) {
      if (refreshDashboard) {
        refreshDashboard();
      } else if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
  };

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'penicillins', label: 'Penicillins' },
    { value: 'cephalosporins', label: 'Cephalosporins' },
    { value: 'macrolides', label: 'Macrolides' },
    { value: 'tetracyclines', label: 'Tetracyclines' },
    { value: 'aminoglycosides', label: 'Aminoglycosides' },
    { value: 'fluoroquinolones', label: 'Fluoroquinolones' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white flex items-center justify-center">
          <span className="mr-3" role="img" aria-label="Upload">📤</span>
          Upload Prescription Data
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Medicine Name"
            icon="💊"
            error={errors.medicineName}
            required
          >
            <Input
              id="medicineName"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              placeholder="Enter medicine name"
              error={errors.medicineName}
            />
          </FormField>

          <FormField
            label="Category"
            icon="🏷️"
            error={errors.category}
            required
          >
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              options={categories}
            />
          </FormField>

          <FormField
            label="Quantity"
            icon="📦"
            error={errors.quantity}
            required
          >
            <Input
              id="quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              error={errors.quantity}
              min="1"
              max="10000"
            />
          </FormField>

          <FormField
            label="Region"
            icon="📍"
            error={errors.region}
            required
          >
            <Input
              id="region"
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Enter region"
              error={errors.region}
            />
          </FormField>
        </div>

        <div className="flex space-x-4 mt-8">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            <span className="mr-2" role="img" aria-label="Upload">📤</span>
            Upload Data
          </Button>
        </div>
      </form>
    </div>
  );
}; 