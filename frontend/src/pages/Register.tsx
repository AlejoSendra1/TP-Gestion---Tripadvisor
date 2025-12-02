// File: frontend/src/pages/Register.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Plane, Building2, Upload, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/apiClient";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
// IMPORTAMOS EL HOOK DE IMÁGENES
import { useImageUpload } from "@/hooks/useImageUpload";

const Register = () => {
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Hook de subida de imágenes
  const { uploadImage, isUploading: isImgUploading } = useImageUpload();

  const [userType, setUserType] = useState<"traveler" | "owner">("traveler");
  // Estado para el archivo seleccionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    userType: "TRAVELER",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    businessName: "",
    // photo: se agrega dinámicamente al enviar
  });

  // Estado de carga local para el submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Crear preview local
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreeToTerms: checked
    }));
  };

  // --- Submit con Subida de Imagen ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    if (!formData.agreeToTerms) {
      toast({ title: "Error", description: "Debes aceptar los términos y condiciones", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = "";

      // 1. Si hay archivo seleccionado, subirlo primero
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        } else {
          // Si falla la subida, detenemos el registro (o podrías continuar sin foto)
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Preparar payload con la URL de la foto
      const payload = {
        ...formData,
        photo: photoUrl // Enviamos la URL al backend
      };

      console.log("Registration attempt:", payload);

      // 3. Registrar usuario
      const response = await apiClient.post("/users", payload);
      const data = response.data;

      console.log("Registro exitoso:", data);
      signup(data);
      toast({ title: "¡Bienvenido!", description: "Tu cuenta ha sido creada." });
      navigate('/');

    } catch (err) {
      const error = err as Error | AxiosError;
      console.error('Error en el registro:', error.message);

      let title = "Error en el registro";
      let description = "Ocurrió un error inesperado. Intenta de nuevo.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 409) {
            title = "Email en uso";
            description = "Ese email ya está registrado. Prueba con otro.";
          } else if (error.response.status === 400) {
            description = "Datos inválidos. Revisa el formulario.";
          }
        }
      }

      toast({ title, description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isImgUploading;

  return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-aileron font-extrabold bg-gradient-hero bg-clip-text text-transparent">
              unite a trippy
            </h1>
            <p className="text-muted-foreground">
              Comenzá tu aventura o hacé crecer tu negocio
            </p>
          </div>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="space-y-4">
              <CardTitle className="text-center">Crear Cuenta</CardTitle>
              <CardDescription className="text-center">
                Elegí tu tipo de cuenta para comenzar
              </CardDescription>

              {/* Selector Tipo de Usuario */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                    type="button"
                    variant={formData.userType === "TRAVELER" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleFieldChange("userType","TRAVELER")}
                    className="flex-1 gap-2"
                >
                  <Plane className="h-4 w-4" />
                  Viajero
                </Button>
                <Button
                    type="button"
                    variant={formData.userType === "OWNER" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleFieldChange("userType","OWNER")}
                    className="flex-1 gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Negocio
                </Button>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                {formData.userType === "TRAVELER" && (
                    <div className="space-y-1">
                      <Badge variant="secondary" className="mb-2">Cuenta de Viajero</Badge>
                      <p className="text-sm text-muted-foreground">
                        Reservá experiencias, escribí reseñas y ganá XP.
                      </p>
                    </div>
                )}
                {formData.userType === "OWNER" && (
                    <div className="space-y-1">
                      <Badge variant="secondary" className="mb-2 bg-experience text-experience-foreground">Cuenta de Negocio</Badge>
                      <p className="text-sm text-muted-foreground">
                        Publicá tus propiedades y alcanzá a más clientes.
                      </p>
                    </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* --- SECCIÓN FOTO DE PERFIL --- */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
                          {formData.userType === "OWNER" ? <Building2 className="h-10 w-10 text-muted-foreground"/> : <UserIcon className="h-10 w-10 text-muted-foreground"/>}
                        </div>
                    )}
                    <label
                        htmlFor="photo-upload"
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 shadow-sm"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                          id="photo-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isLoading}
                      />
                    </label>
                  </div>
                  <Label htmlFor="photo-upload" className="text-sm text-muted-foreground cursor-pointer">
                    {formData.userType === "OWNER" ? "Subir Logo del Negocio" : "Subir Foto de Perfil"}
                  </Label>
                </div>

                {/* Campos Específicos Viajero */}
                {formData.userType === "TRAVELER" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Juan"
                            required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Pérez"
                            required
                        />
                      </div>
                    </div>
                )}

                {/* Campos Específicos Negocio */}
                {formData.userType === "OWNER" && (
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Nombre del Negocio</Label>
                      <Input
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          placeholder="El nombre de tu negocio"
                          required
                      />
                    </div>
                )}

                {/* Campos Comunes */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="juan@ejemplo.com"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Creá una contraseña segura"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirmá tu contraseña"
                      required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Acepto los{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Términos de Servicio
                    </Link>{" "}
                    y la{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isImgUploading ? "Subiendo foto..." : `Crear Cuenta de ${formData.userType === "TRAVELER" ? "Viajero" : "Negocio"}`}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">¿Ya tenés una cuenta? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Iniciá sesión
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Register;