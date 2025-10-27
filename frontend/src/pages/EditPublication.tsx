import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";

type PublicationType = "hotel" | "activity" | "coworking" | "restaurant";

const EditPublication = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [publicationType, setPublicationType] = useState<PublicationType>("hotel");

    // 🔹 Cargar publicación existente
    useEffect(() => {
        if (!id) return;
      
        const fetchData = async () => {
          try {
            const res = await apiClient.get(`/publications/${id}`);
            const data = res.data;
      
            console.log("📦 Datos cargados:", data);
      
            setFormData(data);
            // ✅ Asegura que publicationType se setea correctamente
            setPublicationType((data.publicationType || "hotel").toLowerCase() as PublicationType);
          } catch (err) {
            console.error("Error al cargar publicación:", err);
            toast({
              title: "Error al cargar",
              description: "No se pudo obtener la publicación.",
              variant: "destructive",
            });
            // ⛔ Antes redirigía a /dashboard → no existe
            navigate(`/experience/${id}`);
          } finally {
            setIsLoading(false);
          }
        };
      
        fetchData();
      }, [id, navigate, toast]);
      
    // 🔹 Handlers de inputs (mismos que Create)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value,
            },
        }));
    };

    const handleTypeChange = (value: string) => {
        setPublicationType(value as PublicationType);
    };

    // 🔹 Guardar cambios (PATCH dinámico)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
      
        // ✅ endpoint dinámico según tipo
        const endpoint = `/publications/${publicationType}/${id}`;
      
        const baseData = {
          title: formData.title,
          description: formData.description,
          price: parseFloat(String(formData.price)),
          location: formData.location,
          mainImageUrl: formData.mainImageUrl,
          imageUrls: formData.imageUrls ?? [],
        };
      
        let specificData = {};
        if (publicationType === "hotel") {
          specificData = {
            roomCount: parseInt(String(formData.roomCount), 10),
            capacity: parseInt(String(formData.capacity), 10),
          };
        } else if (publicationType === "activity") {
          specificData = {
            durationInHours: parseInt(String(formData.durationInHours), 10),
            meetingPoint: formData.meetingPoint,
            whatIsIncluded: formData.whatIsIncluded,
            activityLevel: formData.activityLevel,
            language: formData.language,
          };
        } else if (publicationType === "coworking") {
          specificData = {
            pricePerDay: parseFloat(String(formData.pricePerDay)),
            pricePerMonth: parseFloat(String(formData.pricePerMonth)),
            services: Array.isArray(formData.services)
              ? formData.services
              : (formData.services || "").split(",").map((s: string) => s.trim()),
          };
        } else if (publicationType === "restaurant") {
          specificData = {
            cuisineType: formData.cuisineType,
            priceRange: formData.priceRange,
            openingHours: formData.openingHours,
            menuUrl: formData.menuUrl,
          };
        }
      
        const dataToSend = { ...baseData, ...specificData };
      
        try {
          await apiClient.patch(endpoint, dataToSend);
          toast({
            title: "Publicación actualizada",
            description: "Los cambios fueron guardados correctamente.",
          });
          navigate(`/experience/${id}`);
        } catch (err) {
          const error = err as Error | AxiosError;
          console.error("Error al actualizar:", error.message);
          let description = "Ocurrió un error inesperado.";
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 403) description = "No tienes permisos para editar.";
            if (error.response?.status === 404) description = "Publicación no encontrada.";
          }
          toast({ title: "Error al guardar", description, variant: "destructive" });
        } finally {
          setIsSaving(false);
        }
      };
      
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Cargando publicación...
            </div>
        );
    }

    const publicationTitle = publicationType.charAt(0).toUpperCase() + publicationType.slice(1);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Editar {publicationTitle}</CardTitle>
                        <CardDescription>Modifica los datos y guarda los cambios.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Tipo (solo lectura o editable según prefieras) */}
                            <div className="space-y-2">
                                <Label htmlFor="publicationType">Tipo de Publicación</Label>
                                <Select value={publicationType} onValueChange={handleTypeChange}>
                                    <SelectTrigger id="publicationType">
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hotel">Alojamiento (Hotel)</SelectItem>
                                        <SelectItem value="activity">Actividad</SelectItem>
                                        <SelectItem value="coworking">Coworking</SelectItem>
                                        <SelectItem value="restaurant">Restaurante</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Campos comunes (idénticos a Create) */}
                            <div className="space-y-4">
                                <Label htmlFor="title">Título</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
                                <Label htmlFor="price">Precio Base (USD)</Label>
                                <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} />
                                <Label htmlFor="mainImageUrl">Imagen Principal</Label>
                                <Input id="mainImageUrl" name="mainImageUrl" value={formData.mainImageUrl} onChange={handleInputChange} />
                            </div>

                            <Separator />

                            {/* Ubicación */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Ubicación</h3>
                                <Input id="streetAddress" name="streetAddress" value={formData.location.streetAddress || ""} onChange={handleLocationChange} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input id="city" name="city" value={formData.location.city || ""} onChange={handleLocationChange} />
                                    <Input id="country" name="country" value={formData.location.country || ""} onChange={handleLocationChange} />
                                </div>
                            </div>

                            <Separator />

                            {/* Campos dinámicos (exactos al Create) */}
                            {/* Podés copiar los bloques condicionales del CreatePublication */}

                            <Button type="submit" className="w-full" disabled={isSaving}>
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default EditPublication;
