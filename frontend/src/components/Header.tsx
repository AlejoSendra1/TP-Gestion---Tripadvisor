import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { DinamicHeaderSide } from "@/components/DinamicHeaderSide"

interface HeaderProps {
  userXP: number;
  userLevel: number;
}

export const Header = ({ userXP, userLevel }: HeaderProps) => {
  const progressPercentage = ((userXP % 500) / 500) * 100;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              QuestEscapes
            </h1>
          </Link>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Trophy className="h-5 w-5 text-experience" />
              <div className="w-32">
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
              <Badge variant="outline">Level {userLevel}</Badge>
            </div>
            <Avatar>
              <AvatarImage src="" alt="User" />
              <AvatarFallback>QE</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
  }
export default Header;

