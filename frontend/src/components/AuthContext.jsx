import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
<<<<<<< HEAD
    const userDataJson = localStorage.getItem("userData");

    if (userDataJson) {
      try {
        const userData = JSON.parse(userDataJson);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userData");
      }
=======
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
>>>>>>> develop
    }

    setIsLoading(false);
  }, []);

  const login = (userData) => {
<<<<<<< HEAD
    // userData can be either TravelerDTO or BusinessOwnerDTO
    const normalizedUser = normalizeUserData(userData);

    // Save to localStorage
    localStorage.setItem("userData", JSON.stringify(normalizedUser));

    // Save token separately for easy access
    if (userData.tokenDTO) {
      localStorage.setItem("accessToken", userData.tokenDTO.accessToken);
      localStorage.setItem("refreshToken", userData.tokenDTO.refreshToken);
    }

    setUser(normalizedUser);
=======
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
>>>>>>> develop
  };

  const logout = () => {
    setUser(null);
<<<<<<< HEAD
    localStorage.removeItem("userData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
=======
    // Clear localStorage on logout
    localStorage.removeItem("firstName");
    localStorage.removeItem("userXP");
    localStorage.removeItem("role");
    localStorage.removeItem("UserLevel");

    // --- ¡LO QUE FALTABA! ---
    // Borramos el token al hacer logout
    localStorage.removeItem("authToken");
>>>>>>> develop
  };

  const signup = (userData) => {
    login(userData); // Esto ya funciona porque 'login' ahora guarda el token
  };

<<<<<<< HEAD
  // Helper function to normalize user data from backend DTOs
  const normalizeUserData = (userData) => {
    const baseUser = {
      email: userData.email,
      userType: userData.userType,
      verified: userData.verified,
    };

    // Add type-specific fields
    if (userData.userType === "TRAVELER") {
      return {
        ...baseUser,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userXP: userData.userXP,
        userLevel: userData.userLevel,
      };
    } else if (userData.userType === "OWNER") {
      return {
        ...baseUser,
        businessName: userData.businessName,
        businessType: userData.businessType,
      };
    }

    return baseUser;
  };

  // Helper functions to check user type
  const isTraveler = () => user?.userType === "TRAVELER";
  const isBusinessOwner = () => user?.userType === "OWNER";

  // Prevent rendering until we check localStorage
=======
>>>>>>> develop
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      signup,
      isTraveler,
      isBusinessOwner
    }}>
      {children}
    </AuthContext.Provider>
=======
      <AuthContext.Provider value={{ user, login, logout, signup }}>
        {children}
      </AuthContext.Provider>
>>>>>>> develop
  );
}