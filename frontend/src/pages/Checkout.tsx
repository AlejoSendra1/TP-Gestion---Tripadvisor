// language: typescript
// frontend/src/pages/CheckoutPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft, AlertTriangle, CreditCard } from 'lucide-react';

// Los dos hooks que creamos para este flujo
import { useReservationDetail } from '@/hooks/useReservationDetail';
import { useCreatePreference } from '@/hooks/useCreatePreference';
// Asumo que tienes un helper de fechas
import { formatDate } from '@/lib/datesFormater';

export default function CheckoutPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // 1. Cargar datos de la reserva (desde GET /reservations/{id})
    const {
        reservation,
        isLoading: isLoadingReservation,
        error: errorReservation
    } = useReservationDetail(id);

    // 2. Hook para crear la preferencia de pago
    const {
        createPreference,
        isLoading: isCreatingPreference,
        error: errorPreference
    } = useCreatePreference();

    // 3. Handler del botón de pago
    const handlePay = async () => {
        if (!id) return;
        try {
            // Llama a POST /api/payments/create-preference
            const preference = await createPreference(id);

            // 4. Redirige al usuario a Mercado Pago
            if (preference && preference.initPointUrl) {
                window.location.href = preference.initPointUrl;
            }
        } catch (err) {
            // El error ya se maneja en el estado del hook
            console.error(err);
        }
    };

    // --- Renderizado de estados ---

    if (isLoadingReservation) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (errorReservation || !reservation) {
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-xl font-semibold">Error al cargar la reserva</h2>
                <p className="text-muted-foreground">No pudimos encontrar los detalles.</p>
                <Button asChild variant="outline" className="mt-6">
                    <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio</Link>
                </Button>
            </div>
        );
    }
    const statusNormalized = reservation.status ? String(reservation.status).trim().toUpperCase() : '';
    console.log("--- DEBUG RESERVA ---");
    // Imprimimos el objeto entero como JSON para ver su estructura real
    console.log(JSON.stringify(reservation, null, 2));
    console.log("Keys disponibles:", Object.keys(reservation));
    console.log("---------------------");
    // Si la reserva no está PENDIENTE
    if (reservation.status !== 'PENDING') {
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h2 className="mt-4 text-xl font-semibold">Esta reserva ya fue procesada</h2>
                <p className="text-muted-foreground">El estado de tu reserva es: {reservation.status}</p>
                <Button asChild variant="outline" className="mt-6">
                    <Link to="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Ver mis reservas</Link>
                </Button>
            </div>
        );
    }

    // --- Renderizado principal ---

    // Lógica para mostrar la fecha (depende de si es rango o día único)
    const dateInfo = reservation.endDate
        ? `Del ${formatDate(reservation.startDate!)} al ${formatDate(reservation.endDate)}`
        : (reservation.dateTime ? formatDate(reservation.dateTime) : formatDate(reservation.startDate!));

    return (
        <div className="min-h-screen bg-muted/40">
            <Header />
            <div className="container mx-auto max-w-2xl p-4 py-12">
                <Button asChild variant="outline" className="mb-4" onClick={() => navigate(-1)}>
                    {/* Usamos navigate(-1) para volver a la página anterior (detalles) */}
                    <span className="flex items-center cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </span>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Confirmar y Pagar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4">
                            {/* ¡Aquí usamos los campos aplanados que agregamos
                a ReservationResponseDTO!
              */}
                            <img
                                src={reservation.publicationMainImageUrl}
                                alt={reservation.publicationTitle}
                                className="h-24 w-24 rounded-lg object-cover"
                            />
                            <div>
                                <h3 className="font-semibold">{reservation.publicationTitle}</h3>
                                <p className="text-sm text-muted-foreground">{dateInfo}</p>
                                <p className="text-sm text-muted-foreground">Huéspedes: {reservation.guests}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total a pagar:</span>
                                <span>ARS ${reservation.totalPrice.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        {errorPreference && (
                            <div className="text-destructive text-center font-medium">
                                <AlertTriangle className="inline h-4 w-4 mr-2" />
                                {errorPreference.message}
                            </div>
                        )}

                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handlePay}
                            disabled={isCreatingPreference}
                        >
                            {isCreatingPreference ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="mr-2 h-4 w-4" />
                            )}
                            {isCreatingPreference ? 'Procesando...' : 'Pagar con Mercado Pago'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}