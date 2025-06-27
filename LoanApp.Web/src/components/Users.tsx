import React, { useEffect, useState } from 'react';
import AddUserModal from './AddUserModal';

interface User {
  userId: number;
  email: string;
  role: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/users`, {
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
          errorMessage = errorData.message || errorData.title || 'Failed to fetch users';
        } else {
          errorMessage = await response.text().catch(() => 'Failed to fetch users');
        }
        
        if (response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (response.status === 403) {
          errorMessage = "Access denied - Admin privileges required";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [apiUrl]);

  const handleInvitationCreated = async () => {
    // You might want to refresh the users list or show a success message
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-lg">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-600 text-white p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Users Management</h2>
                <p className="text-gray-400 mt-1">Manage all registered users in the system</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">+</span>
                Invite User
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.userId} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                        <td className="py-4 px-4 text-gray-300">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 2
                              ? 'bg-purple-600 text-purple-100' 
                              : 'bg-blue-600 text-blue-100'
                          }`}>
                            {user.role === 2 ? 'Admin' : 'User'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-700">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Total users: {users.length}</span>
              <span>Admins: {users.filter(u => u.role === 2).length}</span>
            </div>
          </div>
        </div>
      </div>

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onInvitationCreated={handleInvitationCreated}
      />
    </div>
  );
};

export default Users;