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
import { Loader2, Plus, Star, Trash2, X, GripHorizontal } from "lucide-react"; // Agregué GripHorizontal

// IMPORTAMOS EL HOOK
import { useImageUpload } from "@/hooks/useImageUpload";

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
    roomCount: 0,
    capacity: 0,
    durationInHours: 0,
    meetingPoint: "",
    whatIsIncluded: "",
    activityLevel: "",
    language: "",
    maxGroupSize: 0,
    pricePerDay: 0,
    pricePerMonth: 0,
    services: "",
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
    const { uploadMultipleImages, isUploading: isImgUploading } = useImageUpload();
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [publicationType, setPublicationType] = useState<PublicationType>("hotel");

    // --- GESTIÓN DE IMÁGENES ---
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState<number>(0);

    // Estado para Drag and Drop
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Handlers Inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            location: { ...prev.location, [name]: value },
        }));
    };

    const handleTypeChange = (value: string) => {
        setFormData(initialState);
        setSelectedFiles([]);
        setPreviews([]);
        setMainImageIndex(0);
        setPublicationType(value as PublicationType);
    };

    // --- HANDLERS DE IMÁGENES ---

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));

            setSelectedFiles(prev => [...prev, ...newFiles]);
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        if (indexToRemove === mainImageIndex) {
            setMainImageIndex(0);
        } else if (indexToRemove < mainImageIndex) {
            setMainImageIndex(prev => prev - 1);
        }
        setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
        setPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSetMain = (index: number) => {
        setMainImageIndex(index);
    };

    // --- LÓGICA DE DRAG AND DROP (Reordenar) ---

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necesario para permitir el drop
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        // 1. Reordenar Files
        const newFiles = [...selectedFiles];
        const draggedFile = newFiles[draggedIndex];
        newFiles.splice(draggedIndex, 1);
        newFiles.splice(targetIndex, 0, draggedFile);
        setSelectedFiles(newFiles);

        // 2. Reordenar Previews
        const newPreviews = [...previews];
        const draggedPreview = newPreviews[draggedIndex];
        newPreviews.splice(draggedIndex, 1);
        newPreviews.splice(targetIndex, 0, draggedPreview);
        setPreviews(newPreviews);

        // 3. Actualizar índice de Principal para que "siga" a la imagen
        if (mainImageIndex === draggedIndex) {
            // Si moví la principal, el índice principal ahora es el destino
            setMainImageIndex(targetIndex);
        } else if (
            mainImageIndex > draggedIndex && mainImageIndex <= targetIndex
        ) {
            // Si moví una de ARRIBA hacia ABAJO pasando por la principal, la principal sube 1
            setMainImageIndex(prev => prev - 1);
        } else if (
            mainImageIndex < draggedIndex && mainImageIndex >= targetIndex
        ) {
            // Si moví una de ABAJO hacia ARRIBA pasando por la principal, la principal baja 1
            setMainImageIndex(prev => prev + 1);
        }

        setDraggedIndex(null);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (selectedFiles.length === 0) {
                toast({ title: "Imágenes requeridas", description: "Selecciona al menos una imagen.", variant: "destructive" });
                setIsSubmitting(false);
                return;
            }

            // REORDEN FINAL: Poner la principal PRIMERA en la lista de subida
            const filesToUpload = [...selectedFiles];
            if (mainImageIndex > 0 && mainImageIndex < filesToUpload.length) {
                const mainFile = filesToUpload[mainImageIndex];
                filesToUpload.splice(mainImageIndex, 1);
                filesToUpload.unshift(mainFile);
            }

            const uploadedUrls = await uploadMultipleImages(filesToUpload);

            if (uploadedUrls.length === 0) throw new Error("No se pudieron subir las imágenes.");

            const endpoint = `/publications/${publicationType}`;
            const baseData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(String(formData.price)),
                location: formData.location,
                mainImageUrl: uploadedUrls[0], // La primera siempre es principal tras el reorden
                imageUrls: uploadedUrls,
            };

            let specificData = {};
            if (publicationType === "hotel") {
                specificData = { roomCount: Number(formData.roomCount), capacity: Number(formData.capacity) };
            } else if (publicationType === "activity") {
                specificData = {
                    durationInHours: Number(formData.durationInHours), meetingPoint: formData.meetingPoint,
                    whatIsIncluded: formData.whatIsIncluded, activityLevel: formData.activityLevel,
                    language: formData.language, maxGroupSize: Number(formData.maxGroupSize)
                };
            } else if (publicationType === "coworking") {
                specificData = {
                    pricePerDay: Number(formData.pricePerDay), pricePerMonth: Number(formData.pricePerMonth),
                    capacity: Number(formData.capacity), services: (typeof formData.services === 'string' ? formData.services : "").split(",").map(s => s.trim()).filter(s => s.length > 0)
                };
            } else if (publicationType === "restaurant") {
                if (!isOpeningBeforeClosing(formData.openingStart, formData.openingEnd)) throw new Error("Horario inválido.");
                specificData = {
                    cuisineType: formData.cuisineType, priceRange: formData.priceRange,
                    openingStart: normalizeToHour(formData.openingStart), openingEnd: normalizeToHour(formData.openingEnd),
                    menuUrl: formData.menuUrl, capacity: Number(formData.capacity)
                };
            }

            const response = await apiClient.post(endpoint, { ...baseData, ...specificData });
            toast({ title: "¡Publicación Creada!", description: "Tu publicación está activa." });
            navigate(`/experience/${response.data.id}`);

        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "No se pudo crear la publicación.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const publicationTitle = publicationType.charAt(0).toUpperCase() + publicationType.slice(1);
    const isLoading = isSubmitting || isImgUploading;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Create: {publicationTitle}</CardTitle>
                        <CardDescription>Fill out the form below to create a new publication.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <Label>Publication Type</Label>
                                <Select value={publicationType} onValueChange={handleTypeChange}>
                                    <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hotel">Hotel</SelectItem>
                                        <SelectItem value="activity">Activity</SelectItem>
                                        <SelectItem value="coworking">Coworking</SelectItem>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Title</Label><Input name="title" value={formData.title} onChange={handleInputChange} required /></div>
                                <div className="space-y-2"><Label>Description</Label><Textarea name="description" value={formData.description} onChange={handleInputChange} required /></div>
                                <div className="space-y-2"><Label>Base Price (USD)</Label><Input name="price" type="number" value={formData.price} onChange={handleInputChange} required /></div>

                                {/* --- SECCIÓN DE IMÁGENES DRAG & DROP --- */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <Label>Galería de Fotos ({selectedFiles.length})</Label>
                                        {selectedFiles.length > 0 && <span className="text-xs text-muted-foreground">Arrastra para reordenar</span>}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20 min-h-[160px]">

                                        {previews.map((url, idx) => {
                                            const isMain = idx === mainImageIndex;
                                            const isDragging = draggedIndex === idx;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`
                                                        relative group aspect-square bg-white rounded-lg overflow-hidden shadow-sm border-2 transition-all cursor-grab active:cursor-grabbing
                                                        ${isMain ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-transparent hover:border-primary/50'}
                                                        ${isDragging ? 'opacity-50 scale-95 border-dashed border-primary' : 'opacity-100'}
                                                    `}
                                                    draggable
                                                    onDragStart={() => handleDragStart(idx)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={() => handleDrop(idx)}
                                                >
                                                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover pointer-events-none" />

                                                    {isMain && (
                                                        <div className="absolute top-1 left-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                                                            PORTADA
                                                        </div>
                                                    )}

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                        <GripHorizontal className="text-white/50 w-6 h-6 mb-1" />
                                                        {!isMain && (
                                                            <Button type="button" size="sm" variant="secondary" className="w-full text-xs h-7" onClick={(e) => { e.stopPropagation(); handleSetMain(idx); }}>
                                                                <Star className="w-3 h-3 mr-1" /> Principal
                                                            </Button>
                                                        )}
                                                        <Button type="button" size="sm" variant="destructive" className="w-full text-xs h-7" onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}>
                                                            <Trash2 className="w-3 h-3 mr-1" /> Quitar
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Botón Agregar Más */}
                                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/40 rounded-lg cursor-pointer hover:bg-white hover:border-primary/50 transition-all bg-muted/30 hover:scale-[1.02] active:scale-95">
                                            <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                                            <span className="text-xs text-muted-foreground font-medium text-center px-2">
                                                {selectedFiles.length === 0 ? "Subir Fotos" : "Agregar Más"}
                                            </span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddFiles} disabled={isLoading} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-muted-foreground">La foto marcada como "Portada" será la principal. Puedes arrastrar las fotos para cambiar el orden.</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Location */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Location</h3>
                                <div className="space-y-2"><Label>Address</Label><Input name="streetAddress" value={formData.location.streetAddress} onChange={handleLocationChange} placeholder="Av. Siempre Viva 123" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>City</Label><Input name="city" value={formData.location.city} onChange={handleLocationChange} required /></div>
                                    <div className="space-y-2"><Label>Country</Label><Input name="country" value={formData.location.country} onChange={handleLocationChange} required /></div>
                                </div>
                            </div>

                            <Separator />

                            {/* Dynamic Details */}
                            {publicationType === 'hotel' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Rooms</Label><Input name="roomCount" type="number" value={formData.roomCount} onChange={handleInputChange} required /></div>
                                    <div className="space-y-2"><Label>Capacity</Label><Input name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} required /></div>
                                </div>
                            )}
                            {publicationType === 'activity' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Duration (Hours)</Label><Input name="durationInHours" type="number" value={formData.durationInHours} onChange={handleInputChange} required /></div>
                                        <div className="space-y-2"><Label>Language</Label><Input name="language" value={formData.language} onChange={handleInputChange} required /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Meeting Point</Label><Input name="meetingPoint" value={formData.meetingPoint} onChange={handleInputChange} required /></div>
                                    <div className="space-y-2"><Label>Activity Level</Label><Input name="activityLevel" value={formData.activityLevel} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Max Group Size</Label><Input name="maxGroupSize" type="number" value={formData.maxGroupSize} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>What's Included</Label><Textarea name="whatIsIncluded" value={formData.whatIsIncluded} onChange={handleInputChange} /></div>
                                </div>
                            )}
                            {publicationType === 'coworking' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Daily Price</Label><Input name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleInputChange} /></div>
                                        <div className="space-y-2"><Label>Monthly Price</Label><Input name="pricePerMonth" type="number" value={formData.pricePerMonth} onChange={handleInputChange} /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Services</Label><Input name="services" value={formData.services} onChange={handleInputChange} placeholder="Wifi, Coffee..." /></div>
                                    <div className="space-y-2"><Label>Capacity</Label><Input name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} required /></div>
                                </div>
                            )}
                            {publicationType === "restaurant" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Cuisine</Label><Input name="cuisineType" value={formData.cuisineType} onChange={handleInputChange} /></div>
                                        <div className="space-y-2"><Label>Price Range</Label><Input name="priceRange" value={formData.priceRange} onChange={handleInputChange} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Opening</Label>
                                            <select name="openingStart" value={formData.openingStart} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2">
                                                <option value="">Select</option>{hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Closing</Label>
                                            <select name="openingEnd" value={formData.openingEnd} onChange={handleInputChange} className="w-full rounded-md border px-3 py-2">
                                                <option value="">Select</option>{hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2"><Label>Menu URL</Label><Input name="menuUrl" value={formData.menuUrl} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Capacity</Label><Input name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} /></div>
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