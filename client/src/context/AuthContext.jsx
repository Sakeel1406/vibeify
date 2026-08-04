import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { loginUser, registerUser, getMe } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check saved session on initial app load & verify token validity
  useEffect(() => {
    const initAuth = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token && storedUser) {
        // Set Axios default authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        try {
          // Verify with backend if token is still valid
          await getMe();
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Invalid token, logging out...", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // LOGIN FUNCTION WITH REMEMBER ME LOGIC
  const login = async (email, password, rememberMe) => {
    // Calling API service
    const response = await loginUser({ email, password });
    const data = response.data;
    
    // Destructure token and user payload
    const token = data.token;
    const userData = data.user || data;

    // Attach token to axios default headers
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Handle Persistence Storage
    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setUser(userData);
    return data;
  };

  // REGISTER FUNCTION
  const register = async (username, email, password) => {
    const response = await registerUser({ username, email, password });
    const data = response.data;
    
    const token = data.token;
    const userData = data.user || data;

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    // Default to localStorage on registration
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    return data;
  };

  // LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};