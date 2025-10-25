import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    // Esto está bien, restaura la info del usuario
    const firstName = localStorage.getItem("firstName");
    const userXP = localStorage.getItem("userXP");
    const role = localStorage.getItem("role");
    const userLevel = localStorage.getItem("UserLevel");

    // ¡OJO! El token también debe existir para estar "logueado"
    const token = localStorage.getItem("authToken");

    if (firstName && userXP && userLevel && token) { // <-- Añadimos check de token
      const restoredUser = {
        name: firstName,
        userXP: userXP,
        role: role,
        UserLevel: userLevel
      };
      setUser(restoredUser);
    }

    setIsLoading(false);
  }, []);

  const login = (userData) => {
    // 1. Guardamos la info del usuario (como ya hacías)
    localStorage.setItem("firstName", userData.firstName);
    localStorage.setItem("userXP", userData.userXP);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("UserLevel", userData.userLevel);

    // 2. --- ¡LO QUE FALTABA! ---
    // Guardamos el token de acceso
    if (userData.tokenDTO && userData.tokenDTO.accessToken) {
      localStorage.setItem("authToken", userData.tokenDTO.accessToken);
    }

    // 3. Seteamos el estado del usuario (como ya hacías)
    const newUser = {
      name: userData.firstName,
      userXP: userData.userXP,
      role: userData.role,
      UserLevel: userData.userLevel
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    // Clear localStorage on logout
    localStorage.removeItem("firstName");
    localStorage.removeItem("userXP");
    localStorage.removeItem("role");
    localStorage.removeItem("UserLevel");

    // --- ¡LO QUE FALTABA! ---
    // Borramos el token al hacer logout
    localStorage.removeItem("authToken");
  };

  const signup = (userData) => {
    login(userData); // Esto ya funciona porque 'login' ahora guarda el token
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
      <AuthContext.Provider value={{ user, login, logout, signup }}>
        {children}
      </AuthContext.Provider>
  );
}