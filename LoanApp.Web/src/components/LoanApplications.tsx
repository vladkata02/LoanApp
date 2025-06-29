import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoanApplicationModal from './LoanApplicationModal';
import LoanApplicationDetailsModal from './LoanApplicationDetailsModal';
import { 
  type LoanApplicationDto, 
  LoanApplicationStatus,
  getStatusText, 
  getStatusColor 
} from '../types/loanApplication';

const LoanApplications: React.FC = () => {
  const { isAuthenticated, userRole, token } = useAuth();
  const [loanApps, setLoanApps] = useState<LoanApplicationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<LoanApplicationDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const isAdmin = userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN';
  const statusNouns: Record<number, string> = {
    2: 'submit',
    3: 'approve',
    4: 'reject',
  };

  const fetchLoanApplications = async () => {
    if (!token) {
      setError('Please log in to view loan applications');
      setLoading(false);
      return;
    }

    try {
      const endpoint = `${apiUrl}/api/loan-applications`;

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

  const handleUpdateStatus = async (loanApplicationId: number, status: number) => {
    try {
      const endpoint = `${apiUrl}/api/loan-applications/${loanApplicationId}/${statusNouns[status]}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to update application status');
        throw new Error(errorText);
      }

      await fetchLoanApplications(); // Refresh the list
      setShowDetailsModal(false);

    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAddNote = async (applicationId: number, content: string, isFromAdmin: boolean) => {
    try {
      const response = await fetch(`${apiUrl}/api/loan-applications/${applicationId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          isFromAdmin
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      // Fetch fresh data
      const endpoint = `${apiUrl}/api/loan-applications`;
      const refreshResponse = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (refreshResponse.ok) {
        const freshData = await refreshResponse.json();
        setLoanApps(freshData);
        
        // Update selectedApp with fresh data if it's the same application
        if (selectedApp && selectedApp.loanApplicationId === applicationId) {
          const updatedSelectedApp = freshData.find((app: LoanApplicationDto) => 
            app.loanApplicationId === applicationId
          );
          if (updatedSelectedApp) {
            setSelectedApp(updatedSelectedApp);
          }
        }
      }

    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const handleCreateSuccess = async () => {
    await fetchLoanApplications();
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
          <div key={app.loanApplicationId} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
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
              {isAdmin && app.user?.email && (
                        <div>
                          <p className="text-gray-400 text-sm">Customer</p>
                          <p className="font-medium">{app.user.email}</p>
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

          <div className="ml-4 flex gap-2">
            {!isAdmin && app.status === LoanApplicationStatus.Pending && (
              <button
            onClick={() => {
              setSelectedApp(app);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors duration-200"
              >
            Edit
              </button>
            )}
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

        {/* Modals */}
        <LoanApplicationModal
          isOpen={showCreateModal}
          onClose={() => {
        setShowCreateModal(false);
        setSelectedApp(null);
          }}
          onSuccess={handleCreateSuccess}
          token={token || ''}
          editApplication={selectedApp}
          isEditMode={!!selectedApp}
        />

        <LoanApplicationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          application={selectedApp}
          isAdmin={isAdmin}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
        />
      </div>
    </div>
  );
};

export default LoanApplications;