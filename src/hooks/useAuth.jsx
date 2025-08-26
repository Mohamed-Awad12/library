import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiHeaders = (authToken = token) => ({
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
  });

  const saveToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const fetchProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/user/profile', {
        headers: apiHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token might be invalid
        saveToken('');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      saveToken('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/user/login', {
        method: 'POST',
        headers: apiHeaders(''),
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.token) {
        saveToken(data.token);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('/user/register', {
        method: 'POST',
        headers: apiHeaders(''),
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (data.token) {
        saveToken(data.token);
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    saveToken('');
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    apiHeaders,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
