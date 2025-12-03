// File: frontend/src/pages/EditProfile.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useImageUpload } from "@/hooks/useImageUpload"; // IMPORTAMOS EL HOOK
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2, User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth(); // Asumo que existe refreshUser en tu AuthContext para actualizar la UI tras guardar
    const { mutate: updateUser, isPending: isUpdating } = useUpdateProfile(); // isPending en lugar de isLoading (dependiendo de tu versión de react-query)

    // Hook de subida de imágenes
    const { uploadImage, isUploading: isImgUploading } = useImageUpload();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // Estados para la foto
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

    // 1. Cargar datos iniciales
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            // Si el usuario ya tiene foto, la seteamos
            if (user.photo) {
                setCurrentPhotoUrl(user.photo);
            }
        }
    }, [user]);

    // Handler para selección de archivo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 2. Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        let finalPhotoUrl = currentPhotoUrl;

        // Si seleccionó un archivo nuevo, subirlo primero
        if (selectedFile) {
            const uploadedUrl = await uploadImage(selectedFile);
            if (uploadedUrl) {
                finalPhotoUrl = uploadedUrl;
            } else {
                // Si falla la subida, podrías mostrar error y no guardar
                return;
            }
        }

        // Llamar a la mutación con los datos actualizados
        updateUser(
            { firstName, lastName, photo: finalPhotoUrl || "" },
            {
                onSuccess: async () => {
                    // Refrescar los datos del usuario en el contexto
                    if (refreshUser) await refreshUser();
                    navigate("/profile");
                }
            }
        );
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    // Avatar display logic
    const displayAvatar = previewUrl || currentPhotoUrl;
    const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "U";
    const isLoading = isUpdating || isImgUploading;

    return (
        <div className="min-h-screen bg-background">
            <Header userXP={(user as any).userXP} userLevel={(user as any).userLevel} />

            <main className="container py-8 px-4">
                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl mx-auto shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Editar Perfil</CardTitle>
                            <CardDescription>
                                Actualizá tu información personal y foto de perfil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Sección de Foto */}
                            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                <div className="relative group">
                                    <Avatar className="w-32 h-32 border-4 border-background ring-2 ring-muted shadow-lg">
                                        <AvatarImage src={displayAvatar || ""} className="object-cover" />
                                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Overlay con botón de subida */}
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 mb-1" />
                                        <span className="text-xs font-medium">Cambiar</span>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={isLoading}
                                        />
                                    </label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Click en la imagen para cambiarla
                                </p>
                            </div>

                            <Separator />

                            {/* Campos de Texto */}
                            <div className="grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Nombre</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={isLoading}
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Apellido</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={isLoading}
                                            placeholder="Tu apellido"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="bg-muted text-muted-foreground cursor-not-allowed"
                                        title="El email no se puede cambiar"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        El correo electrónico no se puede modificar.
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between md:justify-end gap-3 bg-muted/20 p-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/profile")}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isImgUploading ? "Subiendo foto..." : "Guardando..."}
                                    </>
                                ) : (
                                    "Guardar Cambios"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
};

export default EditProfile;