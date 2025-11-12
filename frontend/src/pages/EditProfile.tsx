// src/pages/EditProfile.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/useUpdateProfile"; // El hook que acabamos de crear
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EditProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { mutate: updateUser, isLoading } = useUpdateProfile();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // 1. Cargamos los datos actuales del usuario en el formulario
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
        }
    }, [user]);

    // 2. Función para manejar el envío
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Llamamos a la mutación del hook
        updateUser({ firstName, lastName });
    };

    if (!user) {
        // Podrías redirigir al login si no hay usuario
        return <div>Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Pasamos los datos del usuario al Header */}
            <Header userXP={user.userXP} userLevel={user.userLevel} />

            <main className="container py-8">
                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Editar Perfil</CardTitle>
                            <CardDescription>
                                Actualiza tu nombre y apellido.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled // El email no se puede cambiar
                                    className="text-muted-foreground"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate("/profile")}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
};

export default EditProfile;