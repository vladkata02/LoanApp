import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin = userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN';

  return (
    <header className="bg-gray-900 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">LoanApp</h1>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="px-3 py-2 !text-white hover:text-indigo-300 hover:bg-gray-800 rounded transition-colors duration-200">
            Home
          </Link>
          
          {isAuthenticated && isAdmin && (
            <Link to="/users" className="px-3 py-2 !text-white hover:text-indigo-300 hover:bg-gray-800 rounded transition-colors duration-200">
              Users
            </Link>
          )}
          {isAuthenticated &&(
            <Link to="/loan-applications" className="px-3 py-2 !text-white hover:text-indigo-300 hover:bg-gray-800 rounded transition-colors duration-200">
              Loans
            </Link>
         )}
          {isAdmin && (
            <Link 
              to="/metrics" 
              className="px-3 py-2 !text-white hover:text-indigo-300 hover:bg-gray-800 rounded transition-colors duration-200"
            >
              Portfolio Metrics
            </Link>
          )}
          
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="px-4 py-2 !bg-gray-800 hover:bg-red-600 !text-white rounded font-semibold transition-colors duration-200 shadow-lg border border-red-400 hover:border-red-300"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                to="/login" 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 !text-white rounded font-semibold transition-colors duration-200 shadow-sm"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-gray-800 hover:bg-gray-600 !text-white border border-gray-600 hover:border-gray-500 rounded font-semibold transition-colors duration-200 shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}