import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    const newUser = {
      name: userData.firstName,
      userXP: userData.userXP,
      UserLevel: userData.userLevel
      //avatar: `https://ui-avatars.com/api/?name=${userData.name || userData.email}&background=6366f1&color=fff`
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const signup = (userData) => {
    login(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}