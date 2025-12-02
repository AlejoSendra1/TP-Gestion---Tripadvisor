// File: frontend/src/pages/EditPublication.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hourOptions, isOpeningBeforeClosing } from "@/lib/timeHelpers";
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
import { useEditPublication } from "@/hooks/useEditPublication";
import { Loader2, Upload, X } from "lucide-react";
// IMPORTAMOS EL HOOK DE SUBIDA DE IMÁGENES
import { useImageUpload } from "@/hooks/useImageUpload";

type PublicationType = "hotel" | "activity" | "coworking" | "restaurant";

const EditPublication = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Hook de subida de imágenes
    const { uploadImage, uploadMultipleImages, isUploading: isImgUploading } = useImageUpload();

    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [publicationType, setPublicationType] = useState<PublicationType>("hotel");

    // Estados para imágenes nuevas
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    // Para galería (opcional, si quisieras editarla también, aquí dejo la base)
    // const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

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

    // --- Handler de Imagen Principal ---
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    // --- Enviar Formulario ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        if (publicationType === "restaurant") {
            if (!isOpeningBeforeClosing(formData.openingStart, formData.openingEnd)) {
                toast({
                    title: "Horario inválido",
                    description: "El horario de apertura debe ser menor que el cierre.",
                    variant: "destructive",
                });
                return;
            }
        }

        let updatedFormData = { ...formData };

        // 1. Si hay una nueva imagen principal seleccionada, subirla
        if (mainImageFile) {
            const uploadedUrl = await uploadImage(mainImageFile);
            if (uploadedUrl) {
                updatedFormData.mainImageUrl = uploadedUrl;
            } else {
                // Si falla la subida, avisamos y detenemos
                return;
            }
        }

        // 2. Llamar a la mutación con los datos (posiblemente) actualizados
        editPublication(updatedFormData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando publicación...
            </div>
        );
    }

    const publicationTitle = publicationType.charAt(0).toUpperCase() + publicationType.slice(1);
    const isSubmitting = isSaving || isImgUploading;

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
                        {formData && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Tipo de Publicación */}
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

                                {/* Campos Comunes */}
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

                                    {/* --- SECCIÓN IMAGEN PRINCIPAL --- */}
                                    <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                                        <Label>Imagen Principal</Label>
                                        <div className="flex items-start gap-4">
                                            {/* Preview */}
                                            <div className="relative w-32 h-24 bg-muted rounded-md overflow-hidden border">
                                                {(mainImagePreview || formData.mainImageUrl) ? (
                                                    <img
                                                        src={mainImagePreview || formData.mainImageUrl}
                                                        alt="Principal"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                                        <Upload className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input */}
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor="mainImageUpload" className="cursor-pointer">
                                                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                                                        <Upload className="h-4 w-4" />
                                                        Cambiar imagen
                                                    </div>
                                                    <Input
                                                        id="mainImageUpload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleMainImageChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Formatos soportados: JPG, PNG. Máx 5MB.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ------------------------------- */}
                                </div>

                                <Separator />

                                {/* Ubicación */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Ubicación</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="streetAddress">Dirección</Label>
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

                                {/* Campos Dinámicos (Hotel, Activity, etc.) */}
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

                                {publicationType === "activity" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Detalles de la Actividad</h3>
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
                                            <Label htmlFor="whatIsIncluded">Qué incluye</Label>
                                            <Textarea
                                                id="whatIsIncluded"
                                                name="whatIsIncluded"
                                                value={formData.whatIsIncluded || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxGroupSize">Tamaño Máximo del Grupo</Label>
                                            <Input
                                                id="maxGroupSize"
                                                name="maxGroupSize"
                                                type="number"
                                                value={formData.maxGroupSize ?? ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {publicationType === "coworking" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Detalles del Coworking</h3>
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
                                                <Label htmlFor="pricePerMonth">Precio por Mes (USD)</Label>
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
                                            <Label htmlFor="services">Servicios</Label>
                                            <Input
                                                id="services"
                                                name="services"
                                                value={Array.isArray(formData.services) ? formData.services.join(", ") : formData.services || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Capacidad (Personas)</Label>
                                            <Input
                                                id="capacity"
                                                name="capacity"
                                                type="number"
                                                value={formData.capacity ?? ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {publicationType === "restaurant" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Detalles del Restaurante</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cuisineType">Tipo de Cocina</Label>
                                                <Input id="cuisineType" name="cuisineType" value={formData.cuisineType || ""} onChange={handleInputChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="priceRange">Rango de Precio</Label>
                                                <Input id="priceRange" name="priceRange" value={formData.priceRange || ""} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="openingStart">Horario Inicio</Label>
                                                <select id="openingStart" name="openingStart" value={formData.openingStart || ""} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2">
                                                    <option value="">-- Seleccionar --</option>
                                                    {hourOptions.map((h) => <option key={`start-${h}`} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="openingEnd">Horario Fin</Label>
                                                <select id="openingEnd" name="openingEnd" value={formData.openingEnd || ""} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2">
                                                    <option value="">-- Seleccionar --</option>
                                                    {hourOptions.map((h) => <option key={`end-${h}`} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="menuUrl">URL del Menú</Label>
                                            <Input id="menuUrl" name="menuUrl" value={formData.menuUrl || ""} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Capacidad (Personas)</Label>
                                            <Input id="capacity" name="capacity" type="number" value={formData.capacity ?? ""} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                )}

                                {/* Botón de Guardar */}
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {isImgUploading ? "Subiendo imagen..." : "Guardando..."}
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