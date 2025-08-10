// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);           // For regular users
  const [caregiver, setCaregiver] = useState(null); // For caregivers

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedCaregiver = JSON.parse(localStorage.getItem('caregiver'));

    if (storedUser) setUser(storedUser);
    if (storedCaregiver) setCaregiver(storedCaregiver);
  }, []);

  const login = (data, role) => {
    if (role === 'user') {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } else if (role === 'caregiver') {
      setCaregiver(data);
      localStorage.setItem('caregiver', JSON.stringify(data));
    }
  };

  const logout = () => {
    setUser(null);
    setCaregiver(null);
    localStorage.removeItem('user');
    localStorage.removeItem('caregiver');
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, caregiver, setCaregiver, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);