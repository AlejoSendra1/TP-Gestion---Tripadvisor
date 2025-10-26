import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const userDataJson = localStorage.getItem("userData");

    if (userDataJson) {
      try {
        const userData = JSON.parse(userDataJson);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userData");
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData) => {
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const signup = (userData) => {
    login(userData);
  };

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
    } else if (userData.userType === "BUSINESS_OWNER") {
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
  const isBusinessOwner = () => user?.userType === "BUSINESS_OWNER";

  // Prevent rendering until we check localStorage
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
  );
}