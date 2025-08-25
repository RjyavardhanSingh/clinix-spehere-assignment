import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api"; // Import the API config

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(API.auth.login, {
        username,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      return user;
    } catch (error) {
      throw (
        error.response?.data || { message: error.message || "Login failed" }
      );
    }
  };

  const register = async (username, password, role) => {
    try {
      const response = await axios.post(API.auth.register, {
        username,
        password,
        role,
      });

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: error.message || "Registration failed",
        }
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
