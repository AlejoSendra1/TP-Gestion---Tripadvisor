import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

export const useImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    // Función para subir una sola imagen (ideal para Perfil)
    const uploadImage = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await apiClient.post("/api/images/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Asumiendo que el back devuelve { "url": "..." }
            return response.data.url;
        } catch (error) {
            console.error("Error subiendo imagen:", error);
            toast({
                title: "Error de subida",
                description: "No se pudo subir la imagen. Intenta nuevamente.",
                variant: "destructive",
            });
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // Función para subir múltiples imágenes (ideal para Publicaciones y Reseñas)
    const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
        setIsUploading(true);
        const uploadedUrls: string[] = [];

        // Opción: Subirlas en paralelo para mayor velocidad
        const uploadPromises = files.map((file) => uploadImage(file));

        try {
            const results = await Promise.all(uploadPromises);
            // Filtramos los nulos en caso de que alguna falle individualmente
            results.forEach((url) => {
                if (url) uploadedUrls.push(url);
            });
        } catch (error) {
            console.error("Error en subida múltiple:", error);
        } finally {
            setIsUploading(false);
        }

        return uploadedUrls;
    };

    return {
        uploadImage,
        uploadMultipleImages,
        isUploading,
    };
};