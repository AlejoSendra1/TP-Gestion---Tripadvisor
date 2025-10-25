import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const firstName = localStorage.getItem("firstName");
    const userXP = localStorage.getItem("userXP");
    const userLevel = localStorage.getItem("UserLevel");

    if (firstName && userXP && userLevel) {
      const restoredUser = {
        name: firstName,
        userXP: userXP,
        UserLevel: userLevel
      };
      setUser(restoredUser);
    }

    setIsLoading(false);
  }, []);

  //3- iplementar polimorfismo aca puede ser owner o traveler
  const login = (userData) => {
    localStorage.setItem("firstName", userData.firstName);
    localStorage.setItem("userXP", userData.userXP);
    localStorage.setItem("UserLevel", userData.userLevel);

    const newUser = {
      name: userData.firstName,
      userXP: userData.userXP,
      UserLevel: userData.userLevel
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    // Clear localStorage on logout
    localStorage.removeItem("firstName");
    localStorage.removeItem("userXP");
    localStorage.removeItem("UserLevel");
  };

  const signup = (userData) => {
    login(userData);
  };

  // Optional: Prevent rendering until we check localStorage
  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}