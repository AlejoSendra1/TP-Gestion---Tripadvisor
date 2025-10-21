import { Search, User, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {useAuth} from "@/hooks/use-auth"


export function DinamicHeaderSide() {

    const { user, logout } = useAuth();

    const getLevelColor = (level: number) => {
    if (level >= 20) return "bg-xp-platinum";
    if (level >= 15) return "bg-xp-gold";
    if (level >= 10) return "bg-xp-silver";
    return "bg-xp-bronze";
    };

    return (
      <>
        {user? (
          /* --- LOGGED-IN: User Profile --- */
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium">Explorer Level {sessionStorage.getItem('userLevel')}</div>
                <div className="text-xs text-muted-foreground">
                  {sessionStorage.getItem('userXP')} XP
                </div>
              </div>
              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${getLevelColor(10)} transition-all duration-300`}
                />
              </div>
            </div>

            <Link to="/profile">
              {/* Replace with your actual Avatar component */}
              <Avatar className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gradient-hero text-white">
                  <User className="h-4 w-4" /> {/* Replace with your User icon */}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        ) : (
          /* --- LOGGED-OUT: Register & Log In Links --- */
          <div className="flex">
            <div>
              <Link to="/register">
                Register
              </Link>
            </div>
            <div className="mx-8">
              <Link to="/login">
                Log in
              </Link>
            </div>
          </div>
        )}
      </>
    );
}