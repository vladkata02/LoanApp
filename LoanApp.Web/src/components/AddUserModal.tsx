import React, { useState } from 'react';

interface CreateInvitationRequest {
  email: string;
}

interface ValidationErrors {
  email?: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationCreated: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onInvitationCreated }) => {
  const [invitation, setInvitation] = useState<CreateInvitationRequest>({
    email: ''
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createErrors, setCreateErrors] = useState<ValidationErrors>({});
  const [createApiError, setCreateApiError] = useState<string>("");
  const [invitationCode, setInvitationCode] = useState<string>("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const validateCreateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!invitation.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitation.email)) {
      errors.email = "Invalid email format";
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateApiError("");
    setInvitationCode("");

    if (!validateCreateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/users/invitation?email=${encodeURIComponent(invitation.email)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
            setCreateApiError(errorData.message || "Failed to create invitation");
          }
        } else if (response.status === 401) {
          setCreateApiError("Unauthorized - Please login again");
        } else if (response.status === 403) {
          setCreateApiError("Access denied - Admin privileges required");
        } else if (response.status === 409) {
          setCreateApiError("User with this email already exists.");
        } else {
          const message = typeof errorData === 'string' ? errorData : errorData.message;
          setCreateApiError(message || `Failed to create invitation (${response.status})`);
        }
        return;
      }

      let code = await response.text();
      
      // Remove surrounding quotes if they exist
      code = code.replace(/^"|"$/g, '');
      setInvitationCode(code);

    } catch (error: any) {
      setCreateApiError("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setCreateErrors({});
    setCreateApiError("");
    setInvitationCode("");
    setInvitation({
      email: ''
    });
    onClose();
  };

  const handleFinish = () => {
    onInvitationCreated();
    handleClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const registrationUrl = `${window.location.origin}/register/${invitationCode}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-600">
        {!invitationCode ? (
          <form onSubmit={handleCreateInvitation}>
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Create User Invitation</h3>
              <p className="text-gray-400 text-sm mt-1">Generate an invitation code for a new user.</p>
            </div>

            <div className="p-6 space-y-4">
              {createApiError && (
                <div className="mb-4 p-3 bg-red-600 text-white rounded">
                  {createApiError}
                </div>
              )}

              <div>
                <label className="block mb-2 font-medium text-white" htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  className={`w-full p-3 rounded bg-gray-700 border ${createErrors.email ? 'border-red-500' : 'border-gray-600'} focus:border-indigo-500 outline-none text-white`}
                  value={invitation.email}
                  onChange={(e) => setInvitation({...invitation, email: e.target.value})}
                  placeholder="user@example.com"
                />
                {createErrors.email && <p className="text-red-500 text-sm mt-1">{createErrors.email}</p>}
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
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Generate Invitation'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Invitation Created</h3>
              <p className="text-gray-400 text-sm mt-1">Share this invitation code or link.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-600 text-white p-4 rounded">
                <p className="font-medium mb-2">Invitation code generated successfully!</p>
                <p className="text-sm">Email: {invitation.email}</p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-white">Invitation Code</label>
                <div className="bg-gray-700 p-3 rounded border border-gray-600 flex items-center justify-between gap-2">
                  <code className="text-white font-mono text-sm flex-1 break-all">{invitationCode}</code>
                  <button
                    onClick={() => copyToClipboard(invitationCode)}
                    className="flex-shrink-0 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  The user can use this code to register an account.
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-white">Registration Link</label>
                <div className="bg-gray-700 p-3 rounded border border-gray-600 flex items-center justify-between gap-2 mb-2">
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline break-all text-sm flex-1"
                  >
                    {registrationUrl}
                  </a>
                  <button
                    onClick={() => copyToClipboard(registrationUrl)}
                    className="flex-shrink-0 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  Direct link to the registration page with the invitation code.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUserModal;