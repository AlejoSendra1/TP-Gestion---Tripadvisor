// frontend/src/pages/PaymentFailure.tsx
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
    return (
        <div className="min-h-screen bg-muted/40">
            <Header />
            <div className="container mx-auto max-w-lg p-4 py-24">
                <Card className="text-center">
                    <CardHeader>
                        <XCircle className="mx-auto h-16 w-16 text-destructive" />
                        <CardTitle className="mt-4 text-2xl">Pago Rechazado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Hubo un problema al procesar tu pago. Por favor,
                            inténtalo de nuevo. No se te cobró nada.
                        </p>
                        <Button asChild variant="outline">
                            <Link to="/">Volver al inicio</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}