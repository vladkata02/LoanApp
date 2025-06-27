import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoanApplicationDto {
  id: string;
  userId: number;
  userEmail?: string;
  amount: number;
  termMonths: number;
  status: number;
  dateApplied: string;
  dateUpdated?: string;
  adminNotes?: string;
  customerNotes?: string;
}

interface CreateLoanApplicationRequest {
  amount: number;
  termMonths: number;
  purpose: string;
}

interface UpdateLoanApplicationRequest {
  status: number;
  adminNotes?: string;
}

interface ValidationErrors {
  amount?: string;
  termMonths?: string;
  purpose?: string;
}

const LoanApplications: React.FC = () => {
  const { isAuthenticated, userRole, token } = useAuth();
  const [loanApps, setLoanApps] = useState<LoanApplicationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<LoanApplicationDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  
  const [createForm, setCreateForm] = useState<CreateLoanApplicationRequest>({
    amount: 0,
    termMonths: 12,
    purpose: ''
  });
  const [createErrors, setCreateErrors] = useState<ValidationErrors>({});
  const [createApiError, setCreateApiError] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const isAdmin = userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN';

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      case 3: return 'Under Review';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: return 'bg-yellow-600';
      case 1: return 'bg-green-600';
      case 2: return 'bg-red-600';
      case 3: return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const fetchLoanApplications = async () => {
    if (!token) {
      setError('Please log in to view loan applications');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isAdmin 
        ? `${apiUrl}/api/loanapplications/all`
        : `${apiUrl}/api/loanapplications/my`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || errorData.title || 'Failed to fetch loan applications';
        } else {
          errorMessage = await response.text().catch(() => 'Failed to fetch loan applications');
        }
        
        if (response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (response.status === 403) {
          errorMessage = "Access denied";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setLoanApps(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoanApplications();
    } else {
      setError('Please log in to view loan applications');
      setLoading(false);
    }
  }, [isAuthenticated, token, userRole]);

  const validateCreateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!createForm.amount || createForm.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (createForm.amount < 1000) {
      errors.amount = 'Minimum loan amount is $1,000';
    } else if (createForm.amount > 100000) {
      errors.amount = 'Maximum loan amount is $100,000';
    }

    if (!createForm.termMonths || createForm.termMonths <= 0) {
      errors.termMonths = 'Term must be greater than 0 months';
    } else if (createForm.termMonths < 6) {
      errors.termMonths = 'Minimum term is 6 months';
    } else if (createForm.termMonths > 60) {
      errors.termMonths = 'Maximum term is 60 months';
    }

    if (!createForm.purpose.trim()) {
      errors.purpose = 'Purpose is required';
    } else if (createForm.purpose.length < 10) {
      errors.purpose = 'Purpose must be at least 10 characters';
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateApiError('');

    if (!validateCreateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${apiUrl}/api/loanapplications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
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
            setCreateApiError(errorData);
          } else if (errorData.errors) {
            const backendErrors: ValidationErrors = {};
            Object.keys(errorData.errors).forEach(key => {
              const fieldKey = key.toLowerCase() as keyof ValidationErrors;
              if (errorData.errors[key] && errorData.errors[key].length > 0) {
                backendErrors[fieldKey] = errorData.errors[key][0];
              }
            });
            setCreateErrors(backendErrors);
          } else {
            setCreateApiError(errorData.message || 'Failed to create loan application');
          }
        } else if (response.status === 401) {
          setCreateApiError('Unauthorized - Please login again');
        } else {
          const message = typeof errorData === 'string' ? errorData : errorData.message;
          setCreateApiError(message || `Failed to create loan application (${response.status})`);
        }
        return;
      }

      // Success
      setShowCreateModal(false);
      setCreateForm({ amount: 0, termMonths: 12, purpose: '' });
      setCreateErrors({});
      await fetchLoanApplications(); // Refresh the list

    } catch (error: any) {
      setCreateApiError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: number, adminNotes?: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/loanapplications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          adminNotes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      await fetchLoanApplications(); // Refresh the list
      setShowDetailsModal(false);

    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ 
      ...prev, 
      [name]: name === 'amount' || name === 'termMonths' ? parseFloat(value) || 0 : value 
    }));
    
    if (createErrors[name as keyof ValidationErrors]) {
      setCreateErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Loading loan applications...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-600 text-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'All Loan Applications' : 'My Loan Applications'}
          </h1>
          {!isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Apply for Loan
            </button>
          )}
        </div>

        {loanApps.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">No loan applications found</h3>
            <p className="text-gray-400 mb-6">
              {isAdmin 
                ? 'No loan applications have been submitted yet.' 
                : 'You haven\'t submitted any loan applications yet.'
              }
            </p>
            {!isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors duration-200"
              >
                Apply for Your First Loan
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {loanApps.map(app => (
              <div key={app.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-semibold">
                        ${app.amount.toLocaleString()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(app.status)}`}>
                        {getStatusText(app.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Term</p>
                        <p className="font-medium">{app.termMonths} months</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Applied</p>
                        <p className="font-medium">{new Date(app.dateApplied).toLocaleDateString()}</p>
                      </div>
                      {isAdmin && app.userEmail && (
                        <div>
                          <p className="text-gray-400 text-sm">Customer</p>
                          <p className="font-medium">{app.userEmail}</p>
                        </div>
                      )}
                    </div>

                    {app.adminNotes && (
                      <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded p-3 mb-4">
                        <p className="text-blue-300 text-sm font-medium mb-1">Admin Notes:</p>
                        <p className="text-blue-100">{app.adminNotes}</p>
                      </div>
                    )}

                    {app.customerNotes && (
                      <div className="bg-gray-700 border border-gray-600 rounded p-3 mb-4">
                        <p className="text-gray-300 text-sm font-medium mb-1">Customer Notes:</p>
                        <p className="text-gray-100">{app.customerNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowDetailsModal(true);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-200"
                    >
                      {isAdmin ? 'Manage' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Application Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-600">
              <form onSubmit={handleCreateApplication}>
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Apply for Loan</h3>
                  <p className="text-gray-400 text-sm mt-1">Fill out the details for your loan application.</p>
                </div>

                <div className="p-6 space-y-4">
                  {createApiError && (
                    <div className="bg-red-600 text-white p-3 rounded">
                      {createApiError}
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
                      step="100"
                      className={`w-full p-3 rounded bg-gray-700 border ${
                        createErrors.amount ? 'border-red-500' : 'border-gray-600'
                      } focus:border-indigo-500 outline-none text-white`}
                      value={createForm.amount || ''}
                      onChange={handleCreateInputChange}
                      placeholder="10000"
                    />
                    {createErrors.amount && (
                      <p className="text-red-500 text-sm mt-1">{createErrors.amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-white" htmlFor="termMonths">
                      Term (Months) *
                    </label>
                    <select
                      id="termMonths"
                      name="termMonths"
                      className={`w-full p-3 rounded bg-gray-700 border ${
                        createErrors.termMonths ? 'border-red-500' : 'border-gray-600'
                      } focus:border-indigo-500 outline-none text-white`}
                      value={createForm.termMonths}
                      onChange={handleCreateInputChange}
                    >
                      <option value={6}>6 months</option>
                      <option value={12}>12 months</option>
                      <option value={18}>18 months</option>
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                      <option value={48}>48 months</option>
                      <option value={60}>60 months</option>
                    </select>
                    {createErrors.termMonths && (
                      <p className="text-red-500 text-sm mt-1">{createErrors.termMonths}</p>
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
                      className={`w-full p-3 rounded bg-gray-700 border ${
                        createErrors.purpose ? 'border-red-500' : 'border-gray-600'
                      } focus:border-indigo-500 outline-none text-white resize-none`}
                      value={createForm.purpose}
                      onChange={handleCreateInputChange}
                      placeholder="Describe the purpose of this loan..."
                    />
                    {createErrors.purpose && (
                      <p className="text-red-500 text-sm mt-1">{createErrors.purpose}</p>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({ amount: 0, termMonths: 12, purpose: '' });
                      setCreateErrors({});
                      setCreateApiError('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Application Details Modal */}
        {showDetailsModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-600">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">Application Details</h3>
                <p className="text-gray-400 text-sm mt-1">ID: {selectedApp.id}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-2xl font-bold text-white">${selectedApp.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Term</p>
                    <p className="text-xl font-semibold text-white">{selectedApp.termMonths} months</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedApp.status)}`}>
                      {getStatusText(selectedApp.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Applied Date</p>
                    <p className="text-white">{new Date(selectedApp.dateApplied).toLocaleDateString()}</p>
                  </div>
                </div>

                {isAdmin && selectedApp.userEmail && (
                  <div>
                    <p className="text-gray-400 text-sm">Customer Email</p>
                    <p className="text-white">{selectedApp.userEmail}</p>
                  </div>
                )}

                {selectedApp.adminNotes && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Admin Notes</p>
                    <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded p-3">
                      <p className="text-blue-100">{selectedApp.adminNotes}</p>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="border-t border-gray-700 pt-6">
                    <p className="text-white font-medium mb-4">Update Application Status</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, 3, 'Application is under review')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                        disabled={selectedApp.status === 3}
                      >
                        Mark Under Review
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, 1, 'Application approved')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200"
                        disabled={selectedApp.status === 1}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, 2, 'Application rejected')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                        disabled={selectedApp.status === 2}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApplications;