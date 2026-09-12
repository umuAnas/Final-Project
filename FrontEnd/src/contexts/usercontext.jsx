// src/context/UserContext.jsx
import { createContext, useState, useEffect } from "react";
import { setGlobalAccessToken } from "../service/axiosInstance.js";

const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      accessToken: null,
      loading: false, //  Change this to false! It is already loaded from localStorage.
    };
  });

  const setUser = (data) => {
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      localStorage.removeItem("user");
    }
    setState((prev) => ({ ...prev, user: data }));
  };

  const setAccessToken = (token) => {
    setGlobalAccessToken(token); 
    setState((prev) => ({ ...prev, accessToken: token }));
  };

  useEffect(() => {
    window.__onTokenRefreshed = (newToken) => {
      setState((prev) => ({ ...prev, accessToken: newToken }));
    };
    return () => {
      window.__onTokenRefreshed = null;
    };
  }, []);

  const value = {
    user: state.user,
    accessToken: state.accessToken,
    loading: state.loading,
    setUser,
    setAccessToken //login handeler store new token
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};


  export default UserContext


