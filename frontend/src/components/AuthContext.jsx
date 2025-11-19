import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from memory storage on mount
  useEffect(() => {
    // En lugar de localStorage, usa sessionStorage del navegador
    // o mejor aún, simplemente mantén el estado en memoria
    const restoreSession = async () => {
      try {
        // Intenta obtener el token del sessionStorage
        const accessToken = sessionStorage.getItem("accessToken");
        
        if (accessToken) {
          // Valida el token obteniendo el perfil
          const response = await fetch("http://localhost:8080/sessions/profile", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const userData = await response.json();
            const normalizedUser = normalizeUserData(userData);
            setUser(normalizedUser);
          } else {
            // Token inválido, limpiar
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
          }
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData) => {
    // userData can be either TravelerDTO or BusinessOwnerDTO
    const normalizedUser = normalizeUserData(userData);

    // Save token to sessionStorage for persistence
    if (userData.tokenDTO) {
      sessionStorage.setItem("accessToken", userData.tokenDTO.accessToken);
      sessionStorage.setItem("refreshToken", userData.tokenDTO.refreshToken);
    }

    setUser(normalizedUser);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  };

  const signup = (userData) => {
    login(userData);
  };

  // *** FUNCIÓN CORREGIDA: Refrescar datos del usuario desde el backend ***
  const refreshUser = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      
      if (!accessToken) {
        console.error("No access token found");
        return null;
      }

      // ✅ ENDPOINT CORREGIDO: /sessions/profile
      const response = await fetch("http://localhost:8080/sessions/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to refresh user data");
      }

      const userData = await response.json();
      console.log("📥 Datos recibidos del backend:", userData);
      
      const normalizedUser = normalizeUserData(userData);
      
      // Actualizar en el estado
      setUser(normalizedUser);
      
      console.log("✅ Usuario refrescado:", normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    }
  };

  // Helper function to normalize user data from backend DTOs
  const normalizeUserData = (userData) => {
    // Si ya viene con tokenDTO, es del login/signup
    if (userData.tokenDTO) {
      const baseUser = {
        email: userData.email,
        userType: userData.userType,
        verified: userData.verified,
        role: userData.role
      };

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
    }

    // Si es del endpoint /profile, la estructura es diferente
    const baseUser = {
      email: userData.email,
      userType: userData.userType,
      verified: userData.verified || false,
      role: userData.role || "USER"
    };

    if (userData.userType === "TRAVELER") {
      return {
        ...baseUser,
        firstName: userData.firstName,
        lastName: userData.lastName,
        // ✅ IMPORTANTE: Asegurarse de usar los campos correctos
        userXP: userData.xp, // El endpoint /profile devuelve 'xp'
        userLevel: userData.level, // El endpoint /profile devuelve 'level'
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

  // Prevent rendering until we check session
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      signup,
      refreshUser,
      isTraveler,
      isBusinessOwner
    }}>
      {children}
    </AuthContext.Provider>
  );
}