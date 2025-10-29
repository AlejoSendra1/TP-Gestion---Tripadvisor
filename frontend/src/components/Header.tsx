import { Search, User, Trophy, Star, PlusCircle } from "lucide-react"; // Añadimos PlusCircle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { DinamicHeaderSide } from "@/components/DinamicHeaderSide";
import { useAuth } from "@/hooks/use-auth"; // <-- 1. Importamos el hook de Auth

export function Header() {
    // 2. Obtenemos el estado del usuario
    const { user } = useAuth();
    console.log(user);

    return (
        <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src="/trippy_logo.png" />
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

                    {/* Lado Dinámico (Botones) */}
                    <div className="flex items-center gap-4">
                        {/* 3. Botón condicional de "Crear" */}
                        {user && user.role === "HOST" && (
                            <Button asChild variant="default">
                                <Link to="/create-publication">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Crear Publicación
                                </Link>
                            </Button>
                        )}

                        {/* 4. Tu componente existente de Login/Perfil */}
                        <DinamicHeaderSide />
                    </div>
                </div>
            </div>
        </header>
    );
}