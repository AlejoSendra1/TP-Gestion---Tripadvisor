import { createContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from sessionStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
          const response = await apiClient.get("/sessions/profile");
          const userData = response.data;
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
      localStorage.setItem("accessToken", userData.tokenDTO.accessToken);
      localStorage.setItem("refreshToken", userData.tokenDTO.refreshToken);
    }

    setUser(normalizedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
  };

  const signup = (userData) => {
    login(userData);
  };

  const refreshUser = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        console.error("No access token found");
        return null;
      }

      const response = await apiClient.get("/sessions/profile");
      const userData = response.data;
      console.log("🔄 refreshUser - datos recibidos:", userData);

      console.log("entrando al normalizer");
      const normalizedUser = normalizeUserData(userData);
      setUser(normalizedUser);
      
      console.log("✅ Usuario refrescado:", normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    }
  };

  // ✅ NUEVO: Función para actualizar el usuario manualmente
  const updateUser = (updates) => {
    console.log("🔄 updateUser - actualizando con:", updates);
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updates };
      console.log("✅ Usuario actualizado:", newUser);
      return newUser;
    });
  };

  // Normaliza datos del backend
  const normalizeUserData = (userData) => {
    // CASO 1: Datos del LOGIN/SIGNUP (tienen tokenDTO)
    if (userData.tokenDTO) {
      const baseUser = {
        id: userData.id,
        email: userData.email,
        userType: userData.userType,
        verified: userData.verified,
        role: userData.role,
      };

      if (userData.userType === "TRAVELER") {
        return {
          ...baseUser,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userXP: userData.userXP ?? userData.xp ?? 0,
          userTrippyCoins: userData.userTrippyCoins ?? userData.trippyCoins ?? 0,
          userLevel: userData.userLevel ?? userData.level ?? 1,
          photo: userData.photo
        };
      } else if (userData.userType === "OWNER") {
        return {
          ...baseUser,
          businessName: userData.businessName,
          photo: userData.photo
        };
      }

      return baseUser;
    }

    // CASO 2: Datos del endpoint /sessions/profile
    const isTraveler = userData.levelInfo !== null && userData.levelInfo !== undefined;
    
    const baseUser = {
      id: userData.id,
      email: userData.email,
      userType: isTraveler ? "TRAVELER" : "OWNER",
      verified: true,
      role: "USER"
    };

    if (isTraveler && userData.levelInfo) {
      console.log("USERdata tiene estas coins:", userData.trippyCoins);

      return {
        ...baseUser,
        firstName: userData.firstName,
        lastName: userData.lastName,
        photo: userData.photo,
        userXP: userData.levelInfo.currentXp,
        userLevel: userData.levelInfo.currentLevel,
        userTrippyCoins: userData.TrippyCoins ?? userData.trippyCoins ?? 0,
        xpForNextLevel: userData.levelInfo.xpForNextLevel,
        xpRequiredForNextLevel: userData.levelInfo.xpRequiredForNextLevel,
        progressPercentage: userData.levelInfo.progressPercentage,
        discountPercentage: userData.levelInfo.discountPercentage,
        levelBenefits: userData.levelInfo.benefits,
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

  console.log("AuthContext value:", { user, login, logout, signup, refreshUser, updateUser, isTraveler, isBusinessOwner });

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      signup,
      refreshUser,
      updateUser,  // ← AÑADIDO
      isTraveler,
      isBusinessOwner
    }}>
      {children}
    </AuthContext.Provider>
  );
}