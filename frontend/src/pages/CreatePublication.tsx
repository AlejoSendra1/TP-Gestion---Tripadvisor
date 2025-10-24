import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";

// Este es el "molde" de nuestro DTO del backend
const initialState = {
    title: "",
    description: "",
    price: 0,
    location: {
        streetAddress: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
    },
    mainImageUrl: "",
    imageUrls: [], // Por ahora simple, luego podemos mejorarlo
    roomCount: 0,
    capacity: 0,
};

const CreatePublication = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);

    // Handler para campos simples
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handler para el objeto anidado 'location'
    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value,
            },
        }));
    };

    // Handler para el submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Convertimos los campos numéricos
        const dataToSubmit = {
            ...formData,
            price: parseFloat(String(formData.price)),
            roomCount: parseInt(String(formData.roomCount), 10),
            capacity: parseInt(String(formData.capacity), 10),
            imageUrls: formData.mainImageUrl ? [formData.mainImageUrl] : [],
        };

        console.log("Enviando al backend:", dataToSubmit);

        try {
            // Usamos apiClient para llamar al endpoint que creamos
            const response = await apiClient.post("/publications/hotel", dataToSubmit);

            // ¡Éxito!
            toast({
                title: "¡Publicación Creada!",
                description: "Tu alojamiento ya está visible para los viajeros.",
            });
            // Redirigimos a la página del nuevo detalle (que ya tenés)
            navigate(`/experience/${response.data.id}`);
        } catch (err) {
            // Manejo de errores (similar a tu Login.tsx)
            const error = err as Error | AxiosError;
            console.error("Error al crear publicación:", error.message);

            let title = "Error al publicar";
            let description = "Ocurrió un error inesperado.";

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    description = "Datos inválidos. Revisa el formulario.";
                } else if (error.response?.status === 403) {
                    description = "No tienes permiso para realizar esta acción.";
                }
            }

            toast({ title, description, variant: "destructive" });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Publicar un nuevo alojamiento</CardTitle>
                        <CardDescription>
                            Completa los datos de tu propiedad para que aparezca en Trippy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* --- Datos Principales --- */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título de la Publicación</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Gran Hotel Paraíso"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe tu propiedad..."
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio por Noche (USD)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="150"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mainImageUrl">URL de Imagen Principal</Label>
                                        <Input
                                            id="mainImageUrl"
                                            name="mainImageUrl"
                                            type="url"
                                            value={formData.mainImageUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* --- Ubicación --- */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Ubicación</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="streetAddress">Dirección</Label>
                                    <Input
                                        id="streetAddress"
                                        name="streetAddress"
                                        value={formData.location.streetAddress}
                                        onChange={handleLocationChange}
                                        placeholder="Av. Siempre Viva 123"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad</Label>
                                        <Input id="city" name="city" value={formData.location.city} onChange={handleLocationChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">País</Label>
                                        <Input id="country" name="country" value={formData.location.country} onChange={handleLocationChange} required />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* --- Detalles del Hotel --- */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Detalles del Alojamiento</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="roomCount">Nro. de Habitaciones</Label>
                                        <Input
                                            id="roomCount"
                                            name="roomCount"
                                            type="number"
                                            value={formData.roomCount}
                                            onChange={handleInputChange}
                                            placeholder="50"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacidad (Huéspedes)</Label>
                                        <Input
                                            id="capacity"
                                            name="capacity"
                                            type="number"
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            placeholder="2"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- Submit --- */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Publicando..." : "Publicar Alojamiento"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default CreatePublication;