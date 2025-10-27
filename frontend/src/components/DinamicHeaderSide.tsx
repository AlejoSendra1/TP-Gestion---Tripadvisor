import { Search, User, Trophy, Star, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function DinamicHeaderSide() {
  const { user, logout, isTraveler, isBusinessOwner } = useAuth();

  const getLevelColor = (level: number) => {
    if (level >= 20) return "bg-xp-platinum";
    if (level >= 15) return "bg-xp-gold";
    if (level >= 10) return "bg-xp-silver";
    return "bg-xp-bronze";
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

  return (
    <>
      {user ? (
        /* --- LOGGED-IN: User Profile --- */
        <div className="flex items-center gap-4">
          <button
            onClick={() => logout()}
            className="text-sm hover:text-primary transition-colors px-2 py-1 hover:bg-muted rounded"
          >
            Log out
          </button>

          <div className="flex items-center">
            {/* Info container that extends from avatar */}
            <div className="flex items-center bg-primary/10 pl-4 pr-6 py-2 rounded-l-full mr-[-20px] z-0">
              {/* Traveler-specific XP and Level */}
              {isTraveler() && (
                <div className="hidden lg:block mr-4">
                  <div className="text-right mb-1">
                    <div className="text-sm font-medium">
                      Explorer Level {user.userLevel}
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mb-0.5">
                      <div
                        className={`h-full ${getLevelColor(user.userLevel)} transition-all duration-300`}
                        style={{
                          width: `${Math.min((user.userXP % 1000) / 10, 100)}%`
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground text-right leading-tight">
                      {user.userXP} XP
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
                    <div className="text-[10px] text-muted-foreground leading-tight">
                      {user.businessType}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Avatar on top with higher z-index */}
            <Link to="/profile" className="relative z-10">
              <Avatar className="w-12 h-12 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <AvatarImage src="/placeholder-avatar.jpg" />
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
            Register
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Log in
          </Link>
        </div>
      )}
    </>
  );
}