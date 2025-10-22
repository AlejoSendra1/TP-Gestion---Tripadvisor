import { Search, User, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { DinamicHeaderSide } from "@/components/DinamicHeaderSide"


export function Header() {

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
             {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/src/assets/naranjita.png"/>
                </div>
                <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Trippy
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

            <DinamicHeaderSide />

        </div>
      </div>
    </header>
  );
  }
