import { useState, useCallback, useRef, useEffect } from 'react';

// Custom validation functions
const validators = {
  required: (value) => value && value.toString().trim().length > 0,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (value, min) => value && value.toString().length >= min,
  maxLength: (value, max) => value && value.toString().length <= max,
  pattern: (value, pattern) => pattern.test(value),
  min: (value, min) => !isNaN(value) && Number(value) >= min,
  max: (value, max) => !isNaN(value) && Number(value) <= max,
  custom: (value, validator) => validator(value)
};

export const useForm = (initialState, validationRules = {}, options = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitAttempts = useRef(0);
  const maxRetries = options.maxRetries || 3;
  const debounceTime = options.debounceTime || 300;
  const debounceTimer = useRef(null);

  const calculateProgress = useCallback((data) => {
    const filledFields = Object.values(data).filter(val => 
      val !== null && val !== undefined && val.toString().trim() !== ''
    ).length;
    const totalFields = Object.keys(initialState).length;
    return Math.round((filledFields / totalFields) * 100);
  }, [initialState]);

  const [progress, setProgress] = useState(0);

  // Debounced progress update
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setProgress(calculateProgress(formData));
    }, debounceTime);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [formData, calculateProgress, debounceTime]);

  const validateField = useCallback((fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule) return null;

    // Check required first
    if (rule.required && !validators.required(value)) {
      return rule.required;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) return null;

    // Check other validations
    for (const [validatorName, validatorConfig] of Object.entries(rule)) {
      if (validatorName === 'required') continue;
      
      const validator = validators[validatorName];
      if (!validator) continue;

      let isValid;
      if (validatorName === 'pattern') {
        isValid = validator(value, validatorConfig.value);
      } else if (validatorName === 'custom') {
        isValid = validator(value, validatorConfig);
      } else {
        isValid = validator(value, validatorConfig.value || validatorConfig);
      }

      if (!isValid) {
        return validatorConfig.message || `Invalid ${fieldName}`;
      }
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  }, [formData, validationRules, validateField]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    const newFormData = { ...formData, [name]: fieldValue };
    setFormData(newFormData);
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
  }, [formData, errors, apiError]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [validateField, errors]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    setSuccess(null);
    setApiError(null);
    setProgress(0);
    setIsSubmitting(false);
    submitAttempts.current = 0;
  }, [initialState]);

  const setFormError = useCallback((field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setApiError(null);
  }, []);

  const setFieldValue = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const setMultipleFields = useCallback((fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const submitForm = useCallback(async (submitFunction, options = {}) => {
    console.log('Starting form submission...', { 
      formData, 
      submitAttempts: submitAttempts.current,
      options 
    });
    
    setLoading(true);
    setIsSubmitting(true);
    clearErrors();
    
    const validationErrors = validateForm();
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      setIsSubmitting(false);
      return { success: false, errors: validationErrors };
    }

    try {
      const result = await submitFunction(formData);
      console.log('Submit function result:', result);
      
      setSuccess(options.successMessage || 'Data submitted successfully!');
      resetForm();
      setLoading(false);
      setIsSubmitting(false);
      submitAttempts.current = 0;
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Form submission error:', error);
      
      submitAttempts.current += 1;
      
      if (submitAttempts.current < maxRetries && error.retryable !== false) {
        console.log(`Retrying submission (${submitAttempts.current}/${maxRetries})...`);
        
        // Exponential backoff
        const delay = Math.pow(2, submitAttempts.current) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        setLoading(false);
        return submitForm(submitFunction, options);
      }
      
      const errorMessage = error.message || 'Submission failed. Please try again.';
      setApiError(errorMessage);
      setLoading(false);
      setIsSubmitting(false);
      
      return { 
        success: false, 
        error: errorMessage,
        attempts: submitAttempts.current 
      };
    }
  }, [formData, validateForm, clearErrors, resetForm, maxRetries]);

  const isFormValid = useCallback(() => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  }, [validateForm]);

  const hasChanges = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  }, [formData, initialState]);

  return {
    // State
    formData,
    errors,
    touched,
    loading,
    success,
    apiError,
    progress,
    isSubmitting,
    
    // Actions
    handleChange,
    handleBlur,
    setFormData,
    setFieldValue,
    setMultipleFields,
    setFormError,
    clearErrors,
    resetForm,
    submitForm,
    
    // Validation
    validateForm,
    validateField,
    isFormValid,
    hasChanges,
    
    // Utilities
    setLoading,
    setSuccess,
    setApiError,
  };
}; 