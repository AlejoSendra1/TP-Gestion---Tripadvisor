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

    // --- Función handleSubmit (Reescrita) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevenir recarga de página

        try {
            // 1. Usamos apiClient.post. Esto llamará a POST /sessions
            //    y el proxy de Vite lo redirigirá a :8080
            const response = await apiClient.post("/sessions", formData);

            // 2. Si la petición es exitosa:
            const data = response.data;
            console.log("Login exitoso:", data);
            login(data); // Guardamos la sesión
            navigate('/'); // Redirigimos al inicio

        } catch (err) {
            // 3. Manejo de errores de Axios
            const error = err as Error | AxiosError;
            console.error('Error en el login:', error.message);

            let title = "Error en el inicio de sesión";
            let description = "Ocurrió un error inesperado. Intenta de nuevo.";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // El backend respondió con un error
                    if (error.response.status === 401) { // 401 Unauthorized
                        title = "Credenciales incorrectas";
                        description = "El email o la contraseña no son válidos.";
                    }
                } else if (error.request) {
                    // No se pudo conectar (ej. backend caído)
                    description = "No se pudo conectar con el servidor.";
                }
            }

            console.error(`HTTP error! Status: ${response.status}`);
            console.error(`HTTP error! Status: ${response.body}`);
            // Mostramos el error
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
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground">
                        Sign in to continue your adventure
                    </p>
                </div>

                <Card className="bg-gradient-card shadow-card">
                    <CardHeader className="space-y-4">
                        <CardTitle className="text-center">Sign In</CardTitle>
                        <CardDescription className="text-center">
                            Discover and book amazing experiences, leave reviews, and earn XP
                                                            or
                            Manage your hotels, restaurants, tours and connect with travelers
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full">
                                Sign In as {userType === "traveler" ? "Traveler" : "Business Owner"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Don't have an account? </span>
                            <Link to="/register" className="text-primary hover:underline font-medium">
                                Create account
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Access */}
                <div className="text-center">
                    <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back to homepage
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;