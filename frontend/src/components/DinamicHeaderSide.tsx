// File: frontend/src/components/DinamicHeaderSide.tsx
import { Trophy, LogOut } from "lucide-react"; // Agregué LogOut
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button"; // Usamos Button de shadcn

export function DinamicHeaderSide() {
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

  const getLevelProgress = (currentXp: number, currentLevel: number): number => {
    const currentLevelXp = calculateXpForLevel(currentLevel);
    const nextLevelXp = calculateXpForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXp - currentLevelXp;
    const xpNeededInLevel = nextLevelXp - currentLevelXp;
    if (xpNeededInLevel === 0) return 100;
    return Math.min((xpInCurrentLevel / xpNeededInLevel) * 100, 100);
  };

  const getXpInCurrentLevel = (currentXp: number, currentLevel: number): number => {
    const currentLevelXp = calculateXpForLevel(currentLevel);
    return currentXp - currentLevelXp;
  };

  const getXpNeededForNextLevel = (currentLevel: number): number => {
    const currentLevelXp = calculateXpForLevel(currentLevel);
    const nextLevelXp = calculateXpForLevel(currentLevel + 1);
    return nextLevelXp - currentLevelXp;
  };

  const profilePath = isBusinessOwner() ? "/host-profile" : "/profile";
  const userPhoto = (user as any)?.photo;

  return (
      <>
        {user ? (
            /* --- LOGGED-IN: User Profile --- */
            <div className="flex items-center gap-3">
              {/* Botón Cerrar Sesión Sutil */}
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive hidden md:flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Salir</span>
              </Button>

              {/* TARJETA DE USUARIO UNIFICADA (Pill) */}
              <Link to={profilePath}>
                <div className="flex items-center gap-4 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 pl-4 pr-1.5 py-1.5 rounded-full group cursor-pointer">

                  {/* Sección de XP (Solo Travelers) */}
                  {isTraveler() && user.userXP !== undefined && user.userLevel !== undefined && (
                      <div className="hidden lg:flex flex-col items-end">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-bold text-gray-700">Nivel {user.userLevel}</span>
                        </div>

                        {/* Barra de progreso mini */}
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                              className={`h-full ${getLevelColor(user.userLevel)}`}
                              style={{ width: `${getLevelProgress(user.userXP, user.userLevel)}%` }}
                          />
                        </div>

                        <div className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                          {getXpInCurrentLevel(user.userXP, user.userLevel)} / {getXpNeededForNextLevel(user.userLevel)} XP
                        </div>
                      </div>
                  )}

                  {/* Info del Usuario (Nombre) */}
                  <div className="text-right hidden sm:block">
                    {isTraveler() && (
                        <div className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">
                          {user.firstName} {user.lastName}
                        </div>
                    )}
                    {isBusinessOwner() && (
                        <div className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">
                          {user.businessName}
                        </div>
                    )}
                    {/* Etiqueta de rol pequeña debajo del nombre */}
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {isTraveler() ? 'Viajero' : 'Anfitrión'}
                    </div>
                  </div>

                  {/* Avatar (Dentro de la misma tarjeta) */}
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarImage src={userPhoto} alt="Foto de perfil" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-primary text-white font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                </div>
              </Link>
            </div>
        ) : (
            /* --- LOGGED-OUT --- */
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
        )}
      </>
  );
}