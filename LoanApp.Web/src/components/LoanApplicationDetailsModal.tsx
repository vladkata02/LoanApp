import React from 'react';
import { 
  type LoanApplicationDto, 
  LoanApplicationStatus,
  getStatusText, 
  getStatusColor,
} from '../types/loanApplication';

interface LoanApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LoanApplicationDto | null;
  isAdmin: boolean;
  onUpdateStatus: (loanApplicationId: number, status: number) => void;
}

const LoanApplicationDetailsModal: React.FC<LoanApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  application,
  isAdmin,
  onUpdateStatus
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-600">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Application Details</h3>
          <p className="text-gray-400 text-sm mt-1">ID: {application.loanApplicationId}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-2xl font-bold text-white">${application.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Term</p>
              <p className="text-xl font-semibold text-white">{application.termMonths} months</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(application.status)}`}>
                {getStatusText(application.status)}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Applied Date</p>
              <p className="text-white">{new Date(application.dateApplied).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer Email - shown to admin */}
          {isAdmin && application.user?.email && (
            <div>
              <p className="text-gray-400 text-sm">Customer Email</p>
              <p className="text-white">{application.user.email}</p>
            </div>
          )}

          {/* Purpose Section */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Purpose</p>
            <div className="border border-gray-600 rounded p-3">
              <p className="text-gray-100">{application.purpose}</p>
            </div>
          </div>

          {application.adminNotes && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Admin Notes</p>
              <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded p-3">
                <p className="text-blue-100">{application.adminNotes}</p>
              </div>
            </div>
          )}

          {application.customerNotes && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Customer Notes</p>
              <div className="bg-gray-700 border border-gray-600 rounded p-3">
                <p className="text-gray-100">{application.customerNotes}</p>
              </div>
            </div>
          )}

          {isAdmin && application.status === LoanApplicationStatus.Submitted && (
            <div className="border-t border-gray-700 pt-6">
              <p className="text-white font-medium mb-4">Update Application Status</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onUpdateStatus(application.loanApplicationId, LoanApplicationStatus.Approved)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => onUpdateStatus(application.loanApplicationId, LoanApplicationStatus.Rejected)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationDetailsModal;