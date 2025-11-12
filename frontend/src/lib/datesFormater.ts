export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
    // If less than 1 day ago
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? "Hace un momento" : `Hace ${diffInMinutes} minutos`;
      }
      return diffInHours === 1 ? "Hace 1 hora" : `Hace ${diffInHours} horas`;
    }
  
    // If less than 7 days ago
    if (diffInDays < 7) {
      return diffInDays === 1 ? "Hace 1 día" : `Hace ${diffInDays} días`;
    }
  
    // If less than 30 days ago
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? "Hace 1 semana" : `Hace ${weeks} semanas`;
    }
  
    // If less than 365 days ago
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? "Hace 1 mes" : `Hace ${months} meses`;
    }
  
    // Otherwise show the full date
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };