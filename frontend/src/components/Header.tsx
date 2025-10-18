import { Search, User, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface HeaderProps {
  userXP: number;
  userLevel: number;
}

export function Header({ userXP = 2450, userLevel = 12 }: HeaderProps) {
  const xpToNextLevel = 3000;
  const progressPercent = ((userXP % 1000) / 1000) * 100;

  const getLevelColor = (level: number) => {
    if (level >= 20) return "bg-xp-platinum";
    if (level >= 15) return "bg-xp-gold";
    if (level >= 10) return "bg-xp-silver";
    return "bg-xp-bronze";
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              QuestEscapes
            </h1>
          </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <Link to="/search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search hotels, restaurants, tours..."
                className="pl-10 bg-secondary/50 cursor-pointer"
                readOnly
              />
            </div>
          </Link>
        </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium">Explorer Level {userLevel}</div>
                <div className="text-xs text-muted-foreground">
                  {userXP.toLocaleString()} XP
                </div>
              </div>
              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${getLevelColor(userLevel)} transition-all duration-300`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            
            <Link to="/profile">
              <Avatar className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gradient-hero text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}