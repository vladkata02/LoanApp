import React, { useState, useEffect } from 'react';
import { 
  type LoanApplicationDto, 
  type CreateLoanApplicationRequest, 
  type ValidationErrors,
  LoanApplicationStatus,
} from '../types/loanApplication';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  editApplication?: LoanApplicationDto | null;
  isEditMode?: boolean;
}

const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  editApplication,
  isEditMode = false
}) => {
  const [applicationForm, setApplicationForm] = useState<CreateLoanApplicationRequest>({
    amount: 0,
    termMonths: 12,
    purpose: ''
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editApplication) {
      setApplicationForm({
        amount: editApplication.amount,
        termMonths: editApplication.termMonths,
        purpose: editApplication.purpose
      });
    } else {
      setApplicationForm({ amount: 0, termMonths: 12, purpose: '' });
    }
  }, [isEditMode, editApplication, isOpen]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!applicationForm.amount || applicationForm.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (applicationForm.amount < 1000) {
      errors.amount = 'Minimum loan amount is €1,000';
    } else if (applicationForm.amount > 100000) {
      errors.amount = 'Maximum loan amount is €100,000';
    }

    if (!applicationForm.termMonths || applicationForm.termMonths <= 0) {
      errors.termMonths = 'Term must be greater than 0 months';
    } else if (applicationForm.termMonths < 6) {
      errors.termMonths = 'Minimum term is 6 months';
    } else if (applicationForm.termMonths > 60) {
      errors.termMonths = 'Maximum term is 60 months';
    }

    if (!applicationForm.purpose.trim()) {
      errors.purpose = 'Purpose is required';
    } else if (applicationForm.purpose.length < 10) {
      errors.purpose = 'Purpose must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const requestBody = {
        amount: applicationForm.amount,
        termMonths: applicationForm.termMonths,
        purpose: applicationForm.purpose.trim()
      };

      const url = isEditMode 
        ? `${apiUrl}/api/loan-applications/${editApplication?.loanApplicationId}`
        : `${apiUrl}/api/loan-applications`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json().catch(() => ({}));
        } else {
          errorData = await response.text().catch(() => '');
        }

        if (response.status === 400) {
          if (typeof errorData === 'string') {
            setApiError(errorData);
          } else if (errorData.errors) {
            const backendErrors: ValidationErrors = {};
            Object.keys(errorData.errors).forEach(key => {
              const fieldKey = key.toLowerCase().includes('amount') ? 'amount' :
                             key.toLowerCase().includes('termmonths') ? 'termMonths' :
                             key.toLowerCase().includes('purpose') ? 'purpose' : 
                             key.toLowerCase() as keyof ValidationErrors;
              
              if (errorData.errors[key] && errorData.errors[key].length > 0) {
                backendErrors[fieldKey] = errorData.errors[key][0];
              }
            });
            setFormErrors(backendErrors);
          } else {
            setApiError(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} loan application`);
          }
        } else if (response.status === 401) {
          setApiError('Unauthorized - Please login again');
        } else {
          const message = typeof errorData === 'string' ? errorData : errorData.message;
          setApiError(message || `Failed to ${isEditMode ? 'update' : 'create'} loan application (${response.status})`);
        }
        return;
      }

      // Success
      handleClose();
      onSuccess();

    } catch (error: any) {
      setApiError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!editApplication?.loanApplicationId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/loan-applications/${editApplication.loanApplicationId}/submit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(LoanApplicationStatus.Submitted),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      handleClose();
      onSuccess();

    } catch (error: any) {
      setApiError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setApplicationForm({ amount: 0, termMonths: 12, purpose: '' });
    setFormErrors({});
    setApiError('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ 
      ...prev, 
      [name]: name === 'amount' ? parseFloat(value) || 0 : 
               name === 'termMonths' ? parseInt(value) || 0 : 
               value 
    }));
    
    if (formErrors[name as keyof ValidationErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  const canEdit = !isEditMode || (editApplication?.status === LoanApplicationStatus.Pending); 
  const canSubmit = isEditMode && editApplication?.status === LoanApplicationStatus.Pending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-600">
        <form onSubmit={handleSaveApplication}>
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">
              {isEditMode ? 'Edit Loan Application' : 'Create Loan Application'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {isEditMode ? 'Update the details of your loan application.' : 'Fill out the details for your loan application.'}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {apiError && (
              <div className="bg-red-600 text-white p-3 rounded">
                {apiError}
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium text-white" htmlFor="amount">
                Loan Amount *
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1000"
                max="100000"
                step="0.01"
                disabled={!canEdit}
                className={`w-full p-3 rounded bg-gray-700 border ${
                  formErrors.amount ? 'border-red-500' : 'border-gray-600'
                } focus:border-indigo-500 outline-none text-white ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={applicationForm.amount || ''}
                onChange={handleInputChange}
                placeholder="10000.00"
              />
              {formErrors.amount && (
                <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-white" htmlFor="termMonths">
                Term (Months) *
              </label>
              <select
                id="termMonths"
                name="termMonths"
                disabled={!canEdit}
                className={`w-full p-3 rounded bg-gray-700 border ${
                  formErrors.termMonths ? 'border-red-500' : 'border-gray-600'
                } focus:border-indigo-500 outline-none text-white ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={applicationForm.termMonths}
                onChange={handleInputChange}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
                <option value={48}>48 months</option>
                <option value={60}>60 months</option>
              </select>
              {formErrors.termMonths && (
                <p className="text-red-500 text-sm mt-1">{formErrors.termMonths}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-white" htmlFor="purpose">
                Purpose *
              </label>
              <textarea
                id="purpose"
                name="purpose"
                rows={3}
                disabled={!canEdit}
                className={`w-full p-3 rounded bg-gray-700 border ${
                  formErrors.purpose ? 'border-red-500' : 'border-gray-600'
                } focus:border-indigo-500 outline-none text-white resize-none ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={applicationForm.purpose}
                onChange={handleInputChange}
                placeholder="Describe the purpose of this loan..."
              />
              {formErrors.purpose && (
                <p className="text-red-500 text-sm mt-1">{formErrors.purpose}</p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
            
            {canEdit && (
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
              </button>
            )}

            {canSubmit && (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanApplicationModal;