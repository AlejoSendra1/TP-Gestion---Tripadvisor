import { createContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient'; // Importamos el apiClient

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from sessionStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");

        if (accessToken) {
          // Usamos apiClient en lugar de fetch
          const response = await apiClient.get("/sessions/profile");
          const userData = response.data; // Con Axios, los datos están en response.data
            console.log("📥 Datos del profile endpoint:", userData);
            const normalizedUser = normalizeUserData(userData);
            console.log("✅ Usuario normalizado:", normalizedUser);
            setUser(normalizedUser);
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
    console.log("🔐 Login - datos recibidos:", userData);
    const normalizedUser = normalizeUserData(userData);
    console.log("🔐 Login - usuario normalizado:", normalizedUser);

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

  const refreshUser = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      
      if (!accessToken) {
        console.error("No access token found");
        return null;
      }

      // Usamos apiClient también aquí
      const response = await apiClient.get("/sessions/profile");
      const userData = response.data;
      console.log("🔄 refreshUser - datos recibidos:", userData);
      
      const normalizedUser = normalizeUserData(userData);
      setUser(normalizedUser);
      
      console.log("✅ Usuario refrescado:", normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Normaliza datos del backend
  const normalizeUserData = (userData) => {
    // CASO 1: Datos del LOGIN/SIGNUP (tienen tokenDTO)
    if (userData.tokenDTO) {
      const baseUser = {
        id: userData.id,
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
          // Del login, pueden venir como userXP/userLevel o xp/level
          userXP: userData.userXP ?? userData.xp ?? 0,
          userLevel: userData.userLevel ?? userData.level ?? 1,
        };
      } else if (userData.userType === "OWNER") {
        return {
          ...baseUser,
          businessName: userData.businessName,
        };
      }

      return baseUser;
    }

    // CASO 2: Datos del endpoint /sessions/profile (estructura diferente)
    // Tiene levelInfo como objeto anidado
    const isTraveler = userData.levelInfo !== null && userData.levelInfo !== undefined;
    
    const baseUser = {
      id: userData.id,
      email: userData.email,
      userType: isTraveler ? "TRAVELER" : "OWNER",
      verified: true,
      role: "USER"
    };

    if (isTraveler && userData.levelInfo) {
      return {
        ...baseUser,
        firstName: userData.firstName,
        lastName: userData.lastName,
        photo: userData.photo,
        // ✅ EXTRAER DE levelInfo (campos del LevelInfoDTO.java)
        userXP: userData.levelInfo.currentXp,
        userLevel: userData.levelInfo.currentLevel,
        // Campos adicionales útiles
        xpForNextLevel: userData.levelInfo.xpForNextLevel,
        xpRequiredForNextLevel: userData.levelInfo.xpRequiredForNextLevel,
        progressPercentage: userData.levelInfo.progressPercentage,
        discountPercentage: userData.levelInfo.discountPercentage,
        levelBenefits: userData.levelInfo.benefits,
        // Stats del perfil
        reviewsCount: userData.reviewsCount ?? 0,
        placesVisited: userData.placesVisited ?? 0,
        photosShared: userData.photosShared ?? 0,
        helpfulVotes: userData.helpfulVotes ?? 0,
      };
    }

    // Usuario sin levelInfo (BusinessOwner)
    return {
      ...baseUser,
      firstName: userData.firstName || "Usuario",
      lastName: userData.lastName || "",
    };
  };

  const isTraveler = () => user?.userType === "TRAVELER";
  const isBusinessOwner = () => user?.userType === "OWNER";

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
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