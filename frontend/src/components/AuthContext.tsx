import { createContext, useContext, useState } from "react";

// Create a Context (a shared "box" for auth data)
const AuthContext = createContext('light');

// Provide it to your whole app
export function AuthProvider({ children }) {
  // Store auth state in memory (will reset on page reload)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLevel, setUserLevel] = useState(null);
  const [userXP, setUserXP] = useState(null);

  // expose login / logout functions
  const login = (userData) => {
    setIsLoggedIn(true);
    setUserLevel(userData.level);
    setUserXP(userData.xp);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserLevel(null);
    setUserXP(null);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userLevel, userXP, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}