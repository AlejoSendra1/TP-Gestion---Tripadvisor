import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useEditPublication } from "@/hooks/useEditPublication"; // Importamos el hook
import { Loader2 } from "lucide-react"; // Para el estado de carga

// Puedes mover esto a un archivo 'types.ts' global si quieres
type PublicationType = "hotel" | "activity" | "coworking" | "restaurant";

const EditPublication = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [publicationType, setPublicationType] =
        useState<PublicationType>("hotel");

    // Usamos el hook de mutación. 'isPending' es el nuevo 'isSaving'
    const { mutate: editPublication, isPending: isSaving } = useEditPublication(
        id!,
        publicationType
    );

    // --- Cargar publicación existente ---
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await apiClient.get(`/publications/${id}`);
                const data = res.data;

                // "Aplanamos" los datos: copiamos 'specificDetails' al nivel raíz
                const flattenedData = {
                    ...data,
                    ...(data.specificDetails || {}),
                };

                setFormData(flattenedData);
                setPublicationType(
                    (data.publicationType || "hotel").toLowerCase() as PublicationType
                );
            } catch (err) {
                console.error("Error al cargar publicación:", err);
                toast({
                    title: "Error al cargar",
                    description: "No se pudo obtener la publicación.",
                    variant: "destructive",
                });
                navigate(`/experience/${id}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, navigate, toast]);

    // --- Handlers de Inputs ---
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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
        // Cuando el tipo cambia, es buena idea resetear los datos específicos
        // pero por ahora solo actualizamos el tipo.
        setPublicationType(value as PublicationType);
    };

    // --- Enviar Formulario ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        // El hook se encarga de todo (separar datos, llamar a 2 endpoints, etc.)
        editPublication(formData);
    };

    // --- Renderizado de Carga ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando publicación...
            </div>
        );
    }

    const publicationTitle =
        publicationType.charAt(0).toUpperCase() + publicationType.slice(1);

    // --- Renderizado Principal ---
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Editar {publicationTitle}</CardTitle>
                        <CardDescription>
                            Modifica los datos y guarda los cambios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Nos aseguramos de que formData exista antes de renderizar el form
              para que los 'value' de los inputs no sean 'undefined' al inicio.
            */}
                        {formData && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* --- Tipo de Publicación --- */}
                                <div className="space-y-2">
                                    <Label htmlFor="publicationType">Tipo de Publicación</Label>
                                    <Select
                                        value={publicationType}
                                        onValueChange={handleTypeChange}
                                    >
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

                                {/* --- Campos Comunes --- */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
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
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio Base (USD)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mainImageUrl">Imagen Principal (URL)</Label>
                                        <Input
                                            id="mainImageUrl"
                                            name="mainImageUrl"
                                            value={formData.mainImageUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* --- Ubicación --- */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Ubicación</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="streetAddress">
                                            Dirección (Calle y número)
                                        </Label>
                                        <Input
                                            id="streetAddress"
                                            name="streetAddress"
                                            value={formData.location.streetAddress || ""}
                                            onChange={handleLocationChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Ciudad</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={formData.location.city || ""}
                                                onChange={handleLocationChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">País</Label>
                                            <Input
                                                id="country"
                                                name="country"
                                                value={formData.location.country || ""}
                                                onChange={handleLocationChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* --- Campos Dinámicos --- */}

                                {/* Campos para HOTEL */}
                                {publicationType === "hotel" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Detalles del Hotel</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="roomCount">Habitaciones</Label>
                                                <Input
                                                    id="roomCount"
                                                    name="roomCount"
                                                    type="number"
                                                    value={formData.roomCount || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="capacity">Capacidad (Personas)</Label>
                                                <Input
                                                    id="capacity"
                                                    name="capacity"
                                                    type="number"
                                                    value={formData.capacity || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Campos para ACTIVITY */}
                                {publicationType === "activity" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">
                                            Detalles de la Actividad
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="durationInHours">Duración (Horas)</Label>
                                                <Input
                                                    id="durationInHours"
                                                    name="durationInHours"
                                                    type="number"
                                                    value={formData.durationInHours || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="language">Idioma</Label>
                                                <Input
                                                    id="language"
                                                    name="language"
                                                    value={formData.language || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meetingPoint">Punto de Encuentro</Label>
                                            <Input
                                                id="meetingPoint"
                                                name="meetingPoint"
                                                value={formData.meetingPoint || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="activityLevel">Nivel de Actividad</Label>
                                            <Input
                                                id="activityLevel"
                                                name="activityLevel"
                                                value={formData.activityLevel || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="whatIsIncluded">
                                                Qué incluye (separado por comas)
                                            </Label>
                                            <Textarea
                                                id="whatIsIncluded"
                                                name="whatIsIncluded"
                                                value={formData.whatIsIncluded || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Campos para COWORKING */}
                                {publicationType === "coworking" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">
                                            Detalles del Coworking
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="pricePerDay">Precio por Día (USD)</Label>
                                                <Input
                                                    id="pricePerDay"
                                                    name="pricePerDay"
                                                    type="number"
                                                    value={formData.pricePerDay || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pricePerMonth">
                                                    Precio por Mes (USD)
                                                </Label>
                                                <Input
                                                    id="pricePerMonth"
                                                    name="pricePerMonth"
                                                    type="number"
                                                    value={formData.pricePerMonth || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="services">
                                                Servicios (separados por comas)
                                            </Label>
                                            <Input
                                                id="services"
                                                name="services"
                                                value={
                                                    Array.isArray(formData.services)
                                                        ? formData.services.join(", ")
                                                        : formData.services || ""
                                                }
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Campos para RESTAURANT */}
                                {publicationType === "restaurant" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">
                                            Detalles del Restaurante
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cuisineType">Tipo de Cocina</Label>
                                                <Input
                                                    id="cuisineType"
                                                    name="cuisineType"
                                                    value={formData.cuisineType || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="priceRange">Rango de Precio</Label>
                                                <Input
                                                    id="priceRange"
                                                    name="priceRange"
                                                    value={formData.priceRange || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="openingHours">Horarios</Label>
                                            <Input
                                                id="openingHours"
                                                name="openingHours"
                                                value={formData.openingHours || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="menuUrl">URL del Menú</Label>
                                            <Input
                                                id="menuUrl"
                                                name="menuUrl"
                                                value={formData.menuUrl || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* --- Botón de Enviar --- */}
                                <Button type="submit" className="w-full" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Guardar Cambios"
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default EditPublication;