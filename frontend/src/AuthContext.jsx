import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // خواندن توکن از حافظه مرورگر (اگر کاربر قبلا لاگین کرده باشد)
  const [authTokens, setAuthTokens] = useState(() => {
    const token = localStorage.getItem('authTokens');
    return token ? JSON.parse(token) : null;
  });

  // تابع ورود
  const loginUser = async (username, password) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/login/', { username, password });
      setAuthTokens(res.data);
      localStorage.setItem('authTokens', JSON.stringify(res.data)); // ذخیره توکن
      return { success: true };
    } catch (err) {
      return { success: false, error: "نام کاربری یا رمز عبور اشتباه است." };
    }
  };

  // تابع خروج
  const logoutUser = () => {
    setAuthTokens(null);
    localStorage.removeItem('authTokens');
  };

  return (
    <AuthContext.Provider value={{ authTokens, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);