import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plane } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

// --- Imports nuevos ---
import { apiClient } from "@/lib/apiClient";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { toast } = useToast(); // Hook para notificaciones
    const [userType, setUserType] = useState<"traveler" | "owner">("traveler");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // --- Función handleSubmit (Corregida) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await apiClient.post("/sessions", formData);

            const data = response.data;
            console.log("Login exitoso:", data);
            login(data);
            navigate('/');

        } catch (err) {
            const error = err as Error | AxiosError;
            console.error('Error en el login:', error);

            let title = "Error en el inicio de sesión";
            let description = "Ocurrió un error inesperado. Intenta de nuevo.";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // El backend respondió con un error (ej: 401, 403, 404)
                    const status = error.response.status;

                    // Generalmente login fallido es 401, pero a veces APIs devuelven 400, 403 o 404
                    if (status === 401 || status === 403 || status === 404) {
                        title = "Credenciales incorrectas";
                        description = "El correo electrónico o la contraseña no son válidos.";
                    } else if (status === 400) {
                        title = "Datos inválidos";
                        description = "Por favor revisá que el formato del email sea correcto.";
                    } else if (status >= 500) {
                        description = "Hubo un problema con el servidor. Intentá más tarde.";
                    }
                } else if (error.request) {
                    // No hubo respuesta (backend caído o sin internet)
                    title = "Error de conexión";
                    description = "No se pudo conectar con el servidor. Revisá tu conexión.";
                }
            } else {
                // Error no relacionado con Axios
                description = error.message;
            }

            // Mostramos el error visualmente
            toast({
                title: title,
                description: description,
                variant: "destructive",
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // ... El resto de tu JSX (return) no cambia ...
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                        bienvenido de nuevo!
                    </h1>
                    <p className="text-muted-foreground">
                        Iniciá sesión para continuar tu aventura
                    </p>
                </div>

                <Card className="bg-gradient-card shadow-card">
                    <CardHeader className="space-y-4">
                        <CardTitle className="text-center">Iniciar Sesión</CardTitle>
                        <CardDescription className="text-center">
                            Descubrí y reservá experiencias increíbles, dejá reseñas y ganá XP
                            o
                            Gestioná tus hoteles, restaurantes, tours y conectá con viajeros
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Ingresá tu correo electrónico"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Ingresá tu contraseña"
                                    required
                                />
                            </div>

                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    ¿Te Olvidaste la contraseña?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full">
                                Ingresar como {userType === "traveler" ? "Viajero" : "Propietario"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">¿No tenés una cuenta? </span>
                            <Link to="/register" className="text-primary hover:underline font-medium">
                                Crear cuenta
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Access */}
                <div className="text-center">
                    <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                        ← Volver a la página principal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;