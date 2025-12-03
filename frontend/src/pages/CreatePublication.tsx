// typescript
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
// NUEVO: Importamos el componente Select de shadcn/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { ListIcon } from "lucide-react"; // Icono para la lista de archivos

// MODIFICADO: El "molde" ahora incluye TODOS los campos posibles
const initialState = {
    // --- Campos Comunes ---
    title: "",
    description: "",
    price: 0, // Precio base
    location: {
        streetAddress: "",
        city: "",
        state: "", // Estos no los usas en el form, pero los dejo
        country: "",
        zipCode: "", // Estos no los usas en el form, pero los dejo
    },
    mainImageUrl: "",
    imageUrls: [], // Se arma en el submit

    // --- Hotel ---
    roomCount: 0,
    capacity: 0,

    // --- Activity ---
    durationInHours: 0,
    meetingPoint: "",
    whatIsIncluded: "",
    activityLevel: "",
    language: "",
    maxGroupSize: 0, // <-- agregado

    // --- Coworking ---
    pricePerDay: 0,
    pricePerMonth: 0,
    services: "", // Usaremos un string simple "Wifi, Cafe, Impresora"

    // --- Restaurant ---
    cuisineType: "",
    priceRange: "", // Ej: "$$"
    openingStart: "", // nuevo
    openingEnd: "",   // nuevo
    menuUrl: "",
};

// NUEVO: Un tipo para manejar el endpoint y el título
type PublicationType = "hotel" | "activity" | "coworking" | "restaurant";

const CreatePublication = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    // NUEVO: Estado para el tipo de publicación
    const [publicationType, setPublicationType] = useState<PublicationType>("hotel");

    // --- MODIFICADO: Estado para un array de archivos seleccionados ---
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Handler para campos simples
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handler para 'location' (sin cambios)
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

    // NUEVO: Handler para el Select
    const handleTypeChange = (value: string) => {
        // Reiniciamos el formulario al cambiar de tipo
        setFormData(initialState);
        setSelectedFile(null); // Limpiamos también la imagen seleccionada
        setPublicationType(value as PublicationType);
    };

    // --- MODIFICADO: Handler para seleccionar múltiples archivos ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Convierte FileList a Array y actualiza el estado
            setSelectedFiles(Array.from(e.target.files));
        } else {
            setSelectedFiles([]);
        }
    };

    // --- NUEVO: Función para subir la imagen al Backend ---
    const uploadImage = async (file: File): Promise<string> => {
        const formDataImage = new FormData();
        formDataImage.append("file", file);

        // Llamada al endpoint de subida de imágenes
        const response = await apiClient.post("/api/images/upload", formDataImage, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        // El backend debe devolver { "url": "http://localhost:8080/images/..." }
        return response.data.url;
    };

    // Submit dinámico
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Validar que haya al menos una imagen
            if (selectedFiles.length === 0) {
                toast({
                    title: "Imágenes requeridas",
                    description: "Por favor selecciona al menos una imagen.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // 2. Subir todas las imágenes
            const uploadedUrls: string[] = [];
            for (const file of selectedFiles) {
                const url = await uploadImage(file);
                uploadedUrls.push(url);
            }
            console.log(`Subidas ${uploadedUrls.length} imágenes.`);

            // 2. Determinar el endpoint dinámicamente
            const endpoint = `/publications/${publicationType}`;

            // 3. Construir el DTO de "base" usando la URL de la imagen subida
            const baseData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(String(formData.price)),
                location: formData.location,
                mainImageUrl: uploadedUrls[0],
                // Todos los elementos son la galería
                imageUrls: uploadedUrls,
            };

            // 4. Construir el DTO específico basado en el tipo
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
                if (formData.capacity === undefined || formData.capacity === "" ) {
                    toast({
                        title: "Campo requerido",
                        description: "La capacidad es obligatoria para Coworking.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
                const capNum = parseInt(String(formData.capacity), 10);
                if (Number.isNaN(capNum) || capNum < 0) {
                    toast({
                        title: "Valor inválido",
                        description: "La capacidad debe ser un número entero válido mayor o igual a 0.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
                specificData = {
                    pricePerDay: parseFloat(String(formData.pricePerDay)),
                    pricePerMonth: parseFloat(String(formData.pricePerMonth)),
                    capacity: parseInt(String(formData.capacity), 10),
                    // Convertimos el string "Wifi, Cafe" en un array ["Wifi", "Cafe"]
                    services: (typeof formData.services === 'string' ? formData.services : "").split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0),
                };
            } else if (publicationType === "restaurant") {
                if (!isOpeningBeforeClosing(formData.openingStart, formData.openingEnd)) {
                    toast({
                        title: "Horario inválido",
                        description: "El horario de apertura debe ser menor que el horario de cierre.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
                // Normalizar horarios a hora en punto
                const openingStart = normalizeToHour(formData.openingStart);
                const openingEnd = normalizeToHour(formData.openingEnd);

                specificData = {
                    cuisineType: formData.cuisineType,
                    priceRange: formData.priceRange,
                    openingStart: openingStart || null,
                    openingEnd: openingEnd || null,
                    menuUrl: formData.menuUrl,
                    capacity: formData.capacity !== undefined && formData.capacity !== ""
                        ? parseInt(String(formData.capacity), 10)
                        : null,
                };
            }

            // 5. Combinar y enviar
            const dataToSubmit = { ...baseData, ...specificData };

            console.log(`Enviando a ${endpoint}:`, dataToSubmit);

            const response = await apiClient.post(endpoint, dataToSubmit);

            // ¡Éxito!
            toast({
                title: "¡Publicación Creada!",
                description: "Tu publicación ya está visible para los viajeros.",
            });
            navigate(`/experience/${response.data.id}`);
        } catch (err) {
            // Manejo de errores (sin cambios)
            const error = err as Error | AxiosError;
            console.error("Error al crear publicación:", error.message);
            // ... (resto del catch es idéntico)
            const title = "Error al publicar";
            let description = "Ocurrió un error inesperado.";

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    description = "Datos inválidos. Revisa el formulario.";
                } else if (error.response?.status === 403) {
                    description = "No tienes permiso para realizar esta acción.";
                } else if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
                     // Intentar sacar mensaje del backend si existe
                    description = (error.response.data as any).message;
                }
            }

            toast({ title, description, variant: "destructive" });
        } finally {
             setIsLoading(false);
        }
    };

    // MODIFICADO: Capitaliza el nombre del tipo para el botón y título
    const publicationTitle = publicationType.charAt(0).toUpperCase() + publicationType.slice(1);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        {/* MODIFICADO: Título dinámico */}
                        <CardTitle>Create: {publicationTitle}</CardTitle>
                        <CardDescription>
                            Fill out the form below to create a new publication in Trippy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* --- Selector de Tipo --- */}
                            {/* NUEVO: Selector de tipo de publicación */}
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

                            {/* --- Datos Principales (Comunes) --- */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title or Name</Label>
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
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe tu publicación..."
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        {/* MODIFICADO: Label genérica para el precio */}
                                        <Label htmlFor="price">Base Price (USD)</Label>
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
                                    {/* --- MODIFICADO: Input para MÚLTIPLES Archivos --- */}
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="imageUrls">Fotos de la Publicación (Principal + Galería)</Label>
                                        <Input
                                            id="imageUrls"
                                            name="imageUrls"
                                            type="file"
                                            accept="image/*"
                                            multiple // Permite seleccionar varios archivos
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </div>
                                </div>
                                {/* --- NUEVO: Visualización de archivos seleccionados --- */}
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

                            {/* --- Ubicación (Común) --- */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Location</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="streetAddress">Address</Label>
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

                            {/* --- Detalles Específicos (DINÁMICO) --- */}

                            {/* MODIFICADO: Renderizado condicional para HOTEL */}
                            {publicationType === 'hotel' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Hotel Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="roomCount">Room Count</Label>
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
                                            <Label htmlFor="capacity">Capacity</Label>
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
                            )}

                            {/* NUEVO: Renderizado condicional para ACTIVITY */}
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

                            {/* NUEVO: Renderizado condicional para COWORKING */}
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
                                        <Label htmlFor="services">Services (do type separated by comma)</Label>
                                        <Input id="services" name="services" value={formData.services} onChange={handleInputChange} placeholder="Ej: Wifi, Café, Salas de reunión" />
                                    </div>
                                    {/* Nuevo campo capacity para coworking */}
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacidad (Personas)</Label>
                                        <Input
                                            id="capacity"
                                            name="capacity"
                                            type="number"
                                            value={formData.capacity ?? ""}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 50"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* NUEVO: Renderizado condicional para RESTAURANT */}
                            {publicationType === "restaurant" && (
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Detalles del Restaurante</h3>
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

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="openingStart">Horario Inicio</Label>
                                    <select
                                      id="openingStart"
                                      name="openingStart"
                                      value={formData.openingStart || ""}
                                      onChange={handleInputChange}
                                      className="w-full rounded-md border px-3 py-2"
                                    >
                                      <option value="">-- Seleccionar --</option>
                                      {hourOptions.map((h) => (
                                        <option key={`start-${h}`} value={h}>
                                          {h}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="openingEnd">Horario Fin</Label>
                                    <select
                                      id="openingEnd"
                                      name="openingEnd"
                                      value={formData.openingEnd || ""}
                                      onChange={handleInputChange}
                                      className="w-full rounded-md border px-3 py-2"
                                    >
                                      <option value="">-- Seleccionar --</option>
                                      {hourOptions.map((h) => (
                                        <option key={`end-${h}`} value={h}>
                                          {h}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
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

                                {/* NUEVO: campo capacity para restaurant */}
                                <div className="space-y-2">
                                  <Label htmlFor="capacity">Capacidad (Personas)</Label>
                                  <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity || ""}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 30"
                                  />
                                </div>
                              </div>
                            )}

                            {/* --- Submit --- */}
                            {/* MODIFICADO: Botón dinámico */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Submitting..." : `Create ${publicationTitle}`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default CreatePublication;