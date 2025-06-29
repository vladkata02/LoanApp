import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userRole: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const decodeToken = (tokenString: string) => {
    try {
      const payload = JSON.parse(atob(tokenString.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      
      // Decode and set user role
      const decodedToken = decodeToken(storedToken);
      if (decodedToken) {
        const role = decodedToken.role || 
                    decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                    null;
        setUserRole(role);
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    
    // Decode and set user role
    const decodedToken = decodeToken(newToken);
    if (decodedToken) {
      const role = decodedToken.role || 
                  decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                  null;
      setUserRole(role);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};