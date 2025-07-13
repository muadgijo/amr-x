import { useState, useCallback } from 'react';

export const useForm = (initialState, validationRules = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);

  const calculateProgress = useCallback((data) => {
    const filledFields = Object.values(data).filter(val => val).length;
    const totalFields = Object.keys(initialState).length;
    return (filledFields / totalFields) * 100;
  }, [initialState]);

  const [progress, setProgress] = useState(0);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    setProgress(calculateProgress(newFormData));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formData, errors, calculateProgress]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Apply custom validation rules
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = formData[field];
      
      if (rule.required && !value) {
        newErrors[field] = rule.required;
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || `Invalid ${field}`;
      } else if (rule.min && value && value < rule.min) {
        newErrors[field] = rule.message || `${field} must be at least ${rule.min}`;
      } else if (rule.max && value && value > rule.max) {
        newErrors[field] = rule.message || `${field} must be at most ${rule.max}`;
      }
    });

    return newErrors;
  }, [formData, validationRules]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setSuccess(null);
    setApiError(null);
    setProgress(0);
  }, [initialState]);

  const setFormError = useCallback((field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setApiError(null);
  }, []);

  const submitForm = useCallback(async (submitFunction) => {
    console.log('Starting form submission...');
    console.log('Form data:', formData);
    console.log('Submit function:', submitFunction);
    
    setLoading(true);
    clearErrors();
    
    const validationErrors = validateForm();
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return false;
    }

    try {
      console.log('Calling submit function...');
      const result = await submitFunction(formData);
      console.log('Submit function result:', result);
      
      setSuccess('Data submitted successfully!');
      resetForm();
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setApiError(error.message || 'Submission failed');
      setLoading(false);
      return false;
    }
  }, [formData, validateForm, clearErrors, resetForm, setLoading, setSuccess, setApiError]);

  return {
    formData,
    setFormData,
    errors,
    loading,
    setLoading,
    success,
    setSuccess,
    apiError,
    setApiError,
    progress,
    handleChange,
    validateForm,
    resetForm,
    setFormError,
    clearErrors,
    submitForm,
  };
}; 