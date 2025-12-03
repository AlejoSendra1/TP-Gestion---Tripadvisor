// File: frontend/src/components/DinamicHeaderSide.tsx
import { Trophy } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function DinamicHeaderSide() {
  // Asegúrate de que tu hook useAuth devuelva el tipo correcto para 'user' que incluya 'photo'
  // Si TypeScript se queja, puedes usar (user as any).photo temporalmente
  const { user, logout, isTraveler, isBusinessOwner } = useAuth();

  const getLevelColor = (level: number) => {
    if (level >= 10) return "bg-purple-500";
    if (level >= 7) return "bg-yellow-500";
    if (level >= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getUserInitials = () => {
    if (!user) return "?";

    if (isTraveler()) {
      return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
    }

    if (isBusinessOwner()) {
      return user.businessName?.[0]?.toUpperCase() || "B";
    }

    return user.email?.[0]?.toUpperCase() || "U";
  };

  // Calcula el XP necesario para alcanzar un nivel específico
  const calculateXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    const BASE_XP = 500;
    const XP_MULTIPLIER = 1.5;
    let totalXp = 0;
    for (let i = 1; i < level; i++) {
      totalXp += Math.floor(BASE_XP * Math.pow(XP_MULTIPLIER, i - 1));
    }
    return totalXp;
  };

  // Calcula el progreso del nivel actual (0-100%)
  const getLevelProgress = (currentXp: number, currentLevel: number): number => {
    const currentLevelXp = calculateXpForLevel(currentLevel);
    const nextLevelXp = calculateXpForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXp - currentLevelXp;
    const xpNeededInLevel = nextLevelXp - currentLevelXp;

    if (xpNeededInLevel === 0) return 100;
    return Math.min((xpInCurrentLevel / xpNeededInLevel) * 100, 100);
  };

  // Calcula el XP dentro del nivel actual
  const getXpInCurrentLevel = (currentXp: number, currentLevel: number): number => {
    const currentLevelXp = calculateXpForLevel(currentLevel);
    return currentXp - currentLevelXp;
  };

  // Calcula el XP necesario para el siguiente nivel
  const getXpNeededForNextLevel = (currentLevel: number): number => {
    const currentLevelXp = calculateXpForLevel(currentLevel);
    const nextLevelXp = calculateXpForLevel(currentLevel + 1);
    return nextLevelXp - currentLevelXp;
  };

  const profilePath = isBusinessOwner() ? "/host-profile" : "/profile";

  // Obtenemos la URL de la foto de forma segura
  // Asumiendo que user tiene la propiedad 'photo' gracias a los cambios en AuthContext
  const userPhoto = (user as any)?.photo;

  return (
      <>
        {user ? (
            /* --- LOGGED-IN: User Profile --- */
            <div className="flex items-center gap-4">
              <button
                  onClick={() => logout()}
                  className="text-sm hover:text-primary transition-colors px-2 py-1 hover:bg-muted rounded"
              >
                Cerrar Sesión
              </button>

              <div className="flex items-center">
                {/* Info container that extends from avatar */}
                <div className="flex items-center bg-primary/10 pl-4 pr-6 py-2 rounded-l-full mr-[-20px] z-0">
                  {/* Traveler-specific XP and Level */}
                  {isTraveler() && user.userXP !== undefined && user.userLevel !== undefined && (
                      <div className="hidden lg:block mr-4">
                        <div className="text-right mb-1">
                          <div className="text-sm font-medium flex items-center gap-1 justify-end">
                            <Trophy className="h-3.5 w-3.5" />
                            Nivel {user.userLevel}
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-0.5">
                            <div
                                className={`h-full ${getLevelColor(user.userLevel)} transition-all duration-300`}
                                style={{
                                  width: `${getLevelProgress(user.userXP, user.userLevel)}%`
                                }}
                            />
                          </div>
                          <div className="text-[10px] text-muted-foreground text-right leading-tight">
                            {getXpInCurrentLevel(user.userXP, user.userLevel)} / {getXpNeededForNextLevel(user.userLevel)} XP
                            <span className="mx-1">•</span>
                            Total: {user.userXP} XP
                          </div>
                        </div>
                      </div>
                  )}

                  {/* User Info (Name for travelers, Business for owners) */}
                  <div className="hidden md:block text-right">
                    {isTraveler() && (
                        <div className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                    )}

                    {isBusinessOwner() && (
                        <>
                          <div className="text-sm font-medium">{user.businessName}</div>
                        </>
                    )}
                  </div>
                </div>

                <Link to={profilePath} className="relative z-10">
                  <Avatar className="w-12 h-12 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer bg-background">
                    {/* AQUÍ ESTÁ EL CAMBIO: Usamos userPhoto */}
                    <AvatarImage src={userPhoto} alt="Foto de perfil" className="object-cover" />

                    {/* Fallback a iniciales si no hay foto o falla la carga */}
                    <AvatarFallback className="bg-gradient-hero text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </div>
        ) : (
            /* --- LOGGED-OUT: Register & Log In Links --- */
            <div className="flex items-center space-x-4">
              <Link
                  to="/register"
                  className="text-sm hover:text-primary transition-colors"
              >
                Registrarse
              </Link>
              <Link
                  to="/login"
                  className="text-sm font-medium hover:text-primary transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
        )}
      </>
  );
}