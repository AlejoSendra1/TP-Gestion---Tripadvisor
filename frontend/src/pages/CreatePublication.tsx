// File: frontend/src/pages/CreatePublication.tsx
import { hourOptions, isOpeningBeforeClosing, normalizeToHour } from "@/lib/timeHelpers";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ListIcon } from "lucide-react";

// IMPORTAMOS EL HOOK
import { useImageUpload } from "@/hooks/useImageUpload";

const initialState = {
    // --- Campos Comunes ---
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
    // mainImageUrl e imageUrls se manejan al hacer submit

    // --- Hotel ---
    roomCount: 0,
    capacity: 0,

    // --- Activity ---
    durationInHours: 0,
    meetingPoint: "",
    whatIsIncluded: "",
    activityLevel: "",
    language: "",
    maxGroupSize: 0,

    // --- Coworking ---
    pricePerDay: 0,
    pricePerMonth: 0,
    services: "",

    // --- Restaurant ---
    cuisineType: "",
    priceRange: "",
    openingStart: "",
    openingEnd: "",
    menuUrl: "",
};

type PublicationType = "hotel" | "activity" | "coworking" | "restaurant";

const CreatePublication = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Hooks y Estados
    const { uploadMultipleImages, isUploading: isImgUploading } = useImageUpload(); // Usamos el hook
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado de carga del formulario general
    const [publicationType, setPublicationType] = useState<PublicationType>("hotel");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Handler para campos simples
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handler para 'location'
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

    // Handler para el Select de Tipo
    const handleTypeChange = (value: string) => {
        setFormData(initialState);
        setSelectedFiles([]);
        setPublicationType(value as PublicationType);
    };

    // Handler para archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        } else {
            setSelectedFiles([]);
        }
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Validaciones previas a la subida
            if (selectedFiles.length === 0) {
                toast({
                    title: "Imágenes requeridas",
                    description: "Por favor selecciona al menos una imagen.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }

            // 2. Subir imágenes usando el HOOK
            const uploadedUrls = await uploadMultipleImages(selectedFiles);

            if (uploadedUrls.length === 0) {
                // Si el array está vacío, significa que falló la subida en el hook
                throw new Error("No se pudieron subir las imágenes.");
            }

            // 3. Preparar datos base
            const endpoint = `/publications/${publicationType}`;

            const baseData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(String(formData.price)),
                location: formData.location,
                mainImageUrl: uploadedUrls[0], // La primera es la principal
                imageUrls: uploadedUrls,       // Todas van a la galería
            };

            // 4. Construir DTO específico
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
                    maxGroupSize: parseInt(String(formData.maxGroupSize), 10),
                };
            } else if (publicationType === "coworking") {
                if (!formData.capacity) throw new Error("La capacidad es obligatoria.");
                specificData = {
                    pricePerDay: parseFloat(String(formData.pricePerDay)),
                    pricePerMonth: parseFloat(String(formData.pricePerMonth)),
                    capacity: parseInt(String(formData.capacity), 10),
                    services: (typeof formData.services === 'string' ? formData.services : "").split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0),
                };
            } else if (publicationType === "restaurant") {
                if (!isOpeningBeforeClosing(formData.openingStart, formData.openingEnd)) {
                    throw new Error("El horario de apertura debe ser menor que el cierre.");
                }
                specificData = {
                    cuisineType: formData.cuisineType,
                    priceRange: formData.priceRange,
                    openingStart: normalizeToHour(formData.openingStart) || null,
                    openingEnd: normalizeToHour(formData.openingEnd) || null,
                    menuUrl: formData.menuUrl,
                    capacity: formData.capacity ? parseInt(String(formData.capacity), 10) : null,
                };
            }

            // 5. Enviar al Backend
            const dataToSubmit = { ...baseData, ...specificData };
            console.log(`Enviando a ${endpoint}:`, dataToSubmit);

            const response = await apiClient.post(endpoint, dataToSubmit);

            toast({
                title: "¡Publicación Creada!",
                description: "Tu publicación ya está visible para los viajeros.",
            });

            // Redirigir a la página de detalle
            navigate(`/experience/${response.data.id}`);

        } catch (err) {
            const error = err as Error | AxiosError;
            console.error("Error al crear publicación:", error.message);

            let description = error.message || "Ocurrió un error inesperado.";

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) description = "Datos inválidos. Revisa el formulario.";
                else if (error.response?.status === 403) description = "No tienes permiso para realizar esta acción.";
                else if (error.response?.data && (error.response.data as any).message) {
                    description = (error.response.data as any).message;
                }
            }

            toast({ title: "Error al publicar", description, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const publicationTitle = publicationType.charAt(0).toUpperCase() + publicationType.slice(1);
    const isLoading = isSubmitting || isImgUploading; // Estado combinado de carga

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Create: {publicationTitle}</CardTitle>
                        <CardDescription>
                            Fill out the form below to create a new publication in Trippy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Selector de Tipo */}
                            <div className="space-y-2">
                                <Label htmlFor="publicationType">Publication Type</Label>
                                <Select value={publicationType} onValueChange={handleTypeChange}>
                                    <SelectTrigger id="publicationType">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hotel">Hotel</SelectItem>
                                        <SelectItem value="activity">Activity / Experience</SelectItem>
                                        <SelectItem value="coworking">Coworking</SelectItem>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Datos Principales */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title or Name</Label>
                                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ej: Gran Hotel Paraíso" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe tu publicación..." required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Base Price (USD)</Label>
                                        <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="150" required />
                                    </div>

                                    {/* Input de Archivos */}
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="imageUrls">Fotos de la Publicación (Principal + Galería)</Label>
                                        <Input
                                            id="imageUrls"
                                            name="imageUrls"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Lista de archivos seleccionados */}
                                {selectedFiles.length > 0 && (
                                    <div className="space-y-2 p-3 bg-gray-100 rounded-lg">
                                        <h4 className="text-sm font-semibold flex items-center">
                                            <ListIcon className="w-4 h-4 mr-2" />
                                            {selectedFiles.length} archivos listos para subir:
                                        </h4>
                                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                                            {selectedFiles.map((file, index) => (
                                                <li key={index} className={index === 0 ? "font-medium text-primary" : ""}>
                                                    {file.name} ({index === 0 ? "Principal" : "Galería"})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Ubicación */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Location</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="streetAddress">Address</Label>
                                    <Input id="streetAddress" name="streetAddress" value={formData.location.streetAddress} onChange={handleLocationChange} placeholder="Av. Siempre Viva 123" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" value={formData.location.city} onChange={handleLocationChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" name="country" value={formData.location.country} onChange={handleLocationChange} required />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Detalles Específicos */}

                            {/* HOTEL */}
                            {publicationType === 'hotel' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Hotel Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="roomCount">Room Count</Label>
                                            <Input id="roomCount" name="roomCount" type="number" value={formData.roomCount} onChange={handleInputChange} placeholder="50" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Capacity</Label>
                                            <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} placeholder="2" required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ACTIVITY */}
                            {publicationType === 'activity' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Activity Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="durationInHours">Duration (Hours)</Label>
                                            <Input id="durationInHours" name="durationInHours" type="number" value={formData.durationInHours} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="language">Language</Label>
                                            <Input id="language" name="language" value={formData.language} onChange={handleInputChange} placeholder="Ej: Español, Inglés" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meetingPoint">Meeting Point</Label>
                                            <Input id="meetingPoint" name="meetingPoint" value={formData.meetingPoint} onChange={handleInputChange} placeholder="Ej: Obelisco" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="activityLevel">Activity Level</Label>
                                            <Input id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleInputChange} placeholder="Ej: Moderado, Intenso" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxGroupSize">Max Group Size</Label>
                                            <Input id="maxGroupSize" name="maxGroupSize" type="number" value={formData.maxGroupSize} onChange={handleInputChange} placeholder="Ej: 20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="whatIsIncluded">What's Included</Label>
                                        <Textarea id="whatIsIncluded" name="whatIsIncluded" value={formData.whatIsIncluded} onChange={handleInputChange} placeholder="Ej: Guía, Agua, Entradas" />
                                    </div>
                                </div>
                            )}

                            {/* COWORKING */}
                            {publicationType === 'coworking' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Coworking Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pricePerDay">Price per Day (USD)</Label>
                                            <Input id="pricePerDay" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pricePerMonth">Price per Month (USD)</Label>
                                            <Input id="pricePerMonth" name="pricePerMonth" type="number" value={formData.pricePerMonth} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="services">Services (comma separated)</Label>
                                        <Input id="services" name="services" value={formData.services} onChange={handleInputChange} placeholder="Ej: Wifi, Café, Salas de reunión" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity (Persons)</Label>
                                        <Input id="capacity" name="capacity" type="number" value={formData.capacity || ""} onChange={handleInputChange} placeholder="Ej: 50" required />
                                    </div>
                                </div>
                            )}

                            {/* RESTAURANT */}
                            {publicationType === "restaurant" && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Restaurant Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cuisineType">Cuisine Type</Label>
                                            <Input id="cuisineType" name="cuisineType" value={formData.cuisineType || ""} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priceRange">Price Range</Label>
                                            <Input id="priceRange" name="priceRange" value={formData.priceRange || ""} onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="openingStart">Opening Time</Label>
                                            <select id="openingStart" name="openingStart" value={formData.openingStart || ""} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2">
                                                <option value="">-- Select --</option>
                                                {hourOptions.map((h) => (
                                                    <option key={`start-${h}`} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="openingEnd">Closing Time</Label>
                                            <select id="openingEnd" name="openingEnd" value={formData.openingEnd || ""} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2">
                                                <option value="">-- Select --</option>
                                                {hourOptions.map((h) => (
                                                    <option key={`end-${h}`} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="menuUrl">Menu URL</Label>
                                        <Input id="menuUrl" name="menuUrl" value={formData.menuUrl || ""} onChange={handleInputChange} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity (Persons)</Label>
                                        <Input id="capacity" name="capacity" type="number" value={formData.capacity || ""} onChange={handleInputChange} placeholder="Ej: 30" />
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (isImgUploading ? "Uploading Images..." : "Creating...") : `Create ${publicationTitle}`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default CreatePublication;