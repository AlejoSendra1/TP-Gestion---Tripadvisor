import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hourOptions, isOpeningBeforeClosing } from "@/lib/timeHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useEditPublication } from "@/hooks/useEditPublication";
import { Loader2, Plus, Star, Trash2, X, GripHorizontal, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

type PublicationType = "hotel" | "activity" | "coworking" | "restaurant";

// Tipo unificado para manejar items mixtos (viejos y nuevos) en la misma lista
type GalleryItem = {
    id: string;         // Identificador único para keys (url original o blob url)
    url: string;        // URL para mostrar (puede ser remota o blob local)
    file?: File;        // Solo existe si es una imagen NUEVA pendiente de subir
    isExisting: boolean; // Flag para saber si hay que subirla o no
};

const EditPublication = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { uploadMultipleImages, isUploading: isImgUploading } = useImageUpload();

    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [publicationType, setPublicationType] = useState<PublicationType>("hotel");

    // --- ESTADOS GESTIÓN DE IMÁGENES ---
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState<number>(0);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const { mutate: editPublication, isPending: isSaving } = useEditPublication(id!, publicationType);

    // --- CARGAR DATOS ---
    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const res = await apiClient.get(`/publications/${id}`);
                const data = res.data;
                const flattenedData = { ...data, ...(data.specificDetails || {}) };

                setFormData(flattenedData);
                setPublicationType((data.publicationType || "hotel").toLowerCase() as PublicationType);

                // --- Inicializar Galería Unificada ---
                const mainUrl = data.mainImageUrl || "";
                const galleryUrls: string[] = data.imageUrls || [];

                // Fusionar main y galería asegurando que no haya duplicados
                // y poniendo la main al principio para UX inicial
                const allUrlsSet = new Set(galleryUrls);
                if (mainUrl) allUrlsSet.add(mainUrl);

                let combinedUrls = Array.from(allUrlsSet);

                // Si hay main, la movemos al índice 0 visualmente al cargar
                if (mainUrl && combinedUrls.includes(mainUrl)) {
                    combinedUrls = [mainUrl, ...combinedUrls.filter(u => u !== mainUrl)];
                }

                // Convertir a objetos GalleryItem
                const initialItems: GalleryItem[] = combinedUrls.map(url => ({
                    id: url,
                    url: url,
                    isExisting: true
                }));

                setItems(initialItems);
                setMainImageIndex(0); // Por defecto la primera es la main

            } catch (err) {
                console.error("Error cargando publicación:", err);
                navigate(`/experience/${id}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // --- HANDLERS FORMULARIO ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            location: { ...prev.location, [name]: value },
        }));
    };

    // --- HANDLERS IMÁGENES ---

    // 1. Agregar nuevas
    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const newItems: GalleryItem[] = newFiles.map(file => ({
                id: URL.createObjectURL(file) + "-" + Math.random(), // ID único temporal
                url: URL.createObjectURL(file),
                file: file,
                isExisting: false
            }));

            setItems(prev => [...prev, ...newItems]);
        }
    };

    // 2. Eliminar
    const handleRemoveItem = (index: number) => {
        // Ajustar índice de principal si es necesario
        if (index === mainImageIndex) {
            setMainImageIndex(0); // Reset a la primera si borro la main
        } else if (index < mainImageIndex) {
            setMainImageIndex(prev => prev - 1);
        }
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // 3. Marcar principal
    const handleSetMain = (index: number) => {
        setMainImageIndex(index);
    };

    // --- DRAG AND DROP ---
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        // Reordenar array
        const updatedItems = [...items];
        const [movedItem] = updatedItems.splice(draggedIndex, 1);
        updatedItems.splice(targetIndex, 0, movedItem);
        setItems(updatedItems);

        // Ajustar índice de principal para que "siga" a la imagen si se movió
        if (mainImageIndex === draggedIndex) {
            setMainImageIndex(targetIndex);
        } else if (mainImageIndex > draggedIndex && mainImageIndex <= targetIndex) {
            setMainImageIndex(prev => prev - 1);
        } else if (mainImageIndex < draggedIndex && mainImageIndex >= targetIndex) {
            setMainImageIndex(prev => prev + 1);
        }

        setDraggedIndex(null);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        if (publicationType === "restaurant" && !isOpeningBeforeClosing(formData.openingStart, formData.openingEnd)) {
            toast({ title: "Horario inválido", description: "Apertura debe ser antes que cierre.", variant: "destructive" });
            return;
        }

        try {
            // 1. Separar archivos nuevos para subir
            const filesToUpload = items
                .filter(item => !item.isExisting && item.file)
                .map(item => item.file as File);

            let uploadedUrls: string[] = [];

            // 2. Subir si hay nuevos
            if (filesToUpload.length > 0) {
                uploadedUrls = await uploadMultipleImages(filesToUpload);
                // Validación simple: si la cantidad no coincide, algo falló
                if (uploadedUrls.length !== filesToUpload.length) {
                    throw new Error("Error al subir algunas imágenes. Intenta de nuevo.");
                }
            }

            // 3. Reconstruir la lista final de URLs en el orden correcto
            let uploadCounter = 0;
            const finalUrlList = items.map(item => {
                if (item.isExisting) {
                    return item.url;
                } else {
                    // Es nueva, tomamos la URL de la respuesta del backend en orden
                    const url = uploadedUrls[uploadCounter];
                    uploadCounter++;
                    return url;
                }
            });

            // 4. Determinar Main Image y Lista Final
            // Aseguramos que la main esté en la lista (lógica de negocio)
            // Si el índice es válido tomamos esa, si no la primera, si no vacío.
            const finalMainUrl = finalUrlList[mainImageIndex] || finalUrlList[0] || "";

            // Backend espera imageUrls como lista completa (incluyendo main para el carrusel)
            // Ya tenemos finalUrlList ordenada como el usuario la dejó.

            const updatedData = {
                ...formData,
                mainImageUrl: finalMainUrl,
                imageUrls: finalUrlList,
            };

            // 5. Enviar
            editPublication(updatedData);

        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message || "Error al guardar.", variant: "destructive" });
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const publicationTitle = publicationType.charAt(0).toUpperCase() + publicationType.slice(1);
    const isSubmitting = isSaving || isImgUploading;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Editar {publicationTitle}</CardTitle>
                        <CardDescription>Gestiona las fotos y detalles de tu publicación.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* --- SECCIÓN IMÁGENES DRAG & DROP --- */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-lg font-semibold">Galería de Fotos ({items.length})</h3>
                                    <span className="text-xs text-muted-foreground">Arrastra para reordenar</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20 min-h-[160px]">

                                    {items.map((item, idx) => {
                                        const isMain = idx === mainImageIndex;
                                        const isDragging = draggedIndex === idx;

                                        return (
                                            <div
                                                key={item.id}
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
                                                <img src={item.url} alt="Gallery item" className="w-full h-full object-cover pointer-events-none" />

                                                {/* Badge Principal */}
                                                {isMain && (
                                                    <div className="absolute top-1 left-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                                                        PORTADA
                                                    </div>
                                                )}

                                                {/* Badge Nueva */}
                                                {!item.isExisting && (
                                                    <div className="absolute bottom-0 w-full bg-green-600/90 text-white text-[9px] text-center py-0.5 pointer-events-none">
                                                        PENDIENTE
                                                    </div>
                                                )}

                                                {/* Overlay Acciones */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                    <GripHorizontal className="text-white/50 w-6 h-6 mb-1" />
                                                    {!isMain && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            className="w-full text-xs h-7"
                                                            onClick={(e) => { e.stopPropagation(); handleSetMain(idx); }}
                                                        >
                                                            <Star className="w-3 h-3 mr-1" /> Principal
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        className="w-full text-xs h-7"
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveItem(idx); }}
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" /> Quitar
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Botón Agregar */}
                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/40 rounded-lg cursor-pointer hover:bg-white hover:border-primary/50 transition-all bg-muted/30 hover:scale-[1.02] active:scale-95">
                                        <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-xs text-muted-foreground font-medium text-center px-2">
                                            Agregar Fotos
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleAddFiles}
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    La foto marcada como "Portada" será la principal. Las fotos nuevas (etiqueta verde) se subirán al guardar.
                                </p>
                            </div>

                            <Separator />

                            {/* --- CAMPOS DE TEXTO --- */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input name="title" value={formData.title} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Precio (USD)</Label>
                                    <Input name="price" type="number" value={formData.price} onChange={handleInputChange} required />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea name="description" value={formData.description} onChange={handleInputChange} required />
                                </div>
                            </div>

                            {/* --- UBICACIÓN --- */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Ubicación</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="streetAddress">Dirección</Label>
                                    <Input id="streetAddress" name="streetAddress" value={formData.location.streetAddress || ""} onChange={handleLocationChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad</Label>
                                        <Input id="city" name="city" value={formData.location.city || ""} onChange={handleLocationChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">País</Label>
                                        <Input id="country" name="country" value={formData.location.country || ""} onChange={handleLocationChange} />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* --- CAMPOS ESPECÍFICOS --- */}
                            {publicationType === 'hotel' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Habitaciones</Label><Input name="roomCount" type="number" value={formData.roomCount || ""} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Capacidad</Label><Input name="capacity" type="number" value={formData.capacity || ""} onChange={handleInputChange} /></div>
                                </div>
                            )}
                            {/* ... (Resto de tipos Activity, Coworking, Restaurant copiados igual que antes) ... */}
                            {publicationType === "activity" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Duración (Hs)</Label><Input name="durationInHours" type="number" value={formData.durationInHours || ""} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Idioma</Label><Input name="language" value={formData.language || ""} onChange={handleInputChange} /></div>
                                    <div className="col-span-2 space-y-2"><Label>Punto de Encuentro</Label><Input name="meetingPoint" value={formData.meetingPoint || ""} onChange={handleInputChange} /></div>
                                    <div className="col-span-2 space-y-2"><Label>Qué incluye</Label><Textarea name="whatIsIncluded" value={formData.whatIsIncluded || ""} onChange={handleInputChange} /></div>
                                </div>
                            )}
                            {publicationType === "restaurant" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Cocina</Label><Input name="cuisineType" value={formData.cuisineType || ""} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Precio</Label><Input name="priceRange" value={formData.priceRange || ""} onChange={handleInputChange} /></div>
                                </div>
                            )}
                            {publicationType === "coworking" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Precio Día</Label><Input name="pricePerDay" type="number" value={formData.pricePerDay || ""} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label>Precio Mes</Label><Input name="pricePerMonth" type="number" value={formData.pricePerMonth || ""} onChange={handleInputChange} /></div>
                                </div>
                            )}

                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                                ) : "Guardar Cambios"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default EditPublication;