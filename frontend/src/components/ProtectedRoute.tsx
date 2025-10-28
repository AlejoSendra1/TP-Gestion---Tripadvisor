import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        // Podríamos mostrar un spinner global aquí
        return <div>Cargando sesión...</div>;
    }

    if (!user) {
        // No logueado, redirigir a Login
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Logueado, pero sin el rol correcto. Redirigir al Home.
        return <Navigate to="/" replace />;
    }

    // ¡Todo en orden! Mostrar el contenido de la ruta.
    return <Outlet />;
};