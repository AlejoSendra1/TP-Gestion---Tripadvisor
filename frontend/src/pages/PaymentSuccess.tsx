// frontend/src/pages/PaymentSuccess.tsx
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
    return (
        <div className="min-h-screen bg-muted/40">
            <Header />
            <div className="container mx-auto max-w-lg p-4 py-24">
                <Card className="text-center">
                    <CardHeader>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <CardTitle className="mt-4 text-2xl">¡Pago Aprobado!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Tu pago fue procesado con éxito. Estamos confirmando tu reserva.
                            En breve la verás reflejada en tu perfil.
                        </p>
                        <Button asChild>
                            <Link to="/profile">Ir a "Mis Reservas"</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}