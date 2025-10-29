import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { DinamicHeaderSide } from "@/components/DinamicHeaderSide"
import { Search, User, Star } from "lucide-react";
import SearchBar from "@/components/SearchBar";

interface HeaderProps {
  userXP: number;
  userLevel: number;
}

export function Header ({ userXP, userLevel }: HeaderProps) {
  const progressPercentage = ((userXP % 500) / 500) * 100;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/"className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/src/assets/naranjita.png"/>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Trippy
            </h1>
          </Link>
          
          {/* Search Bar */}
          
          <div className="flex-1 max-w-md mx-8">
            <Link to="/search">
              <div className="relative">
                <SearchBar/>
              </div>
            </Link>
          </div>

          
          {/*
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
          */}

          <DinamicHeaderSide />

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

