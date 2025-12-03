// frontend/src/pages/CheckoutPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft, AlertTriangle, CreditCard, Calendar, Users } from 'lucide-react';

// --- NUEVOS IMPORTS DE DATE-FNS ---
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useReservationDetail } from '@/hooks/useReservationDetail';
import { useCreatePreference } from '@/hooks/useCreatePreference';

export default function CheckoutPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        reservation,
        isLoading: isLoadingReservation,
        error: errorReservation
    } = useReservationDetail(id);

    const {
        createPreference,
        isLoading: isCreatingPreference,
        error: errorPreference
    } = useCreatePreference();

    const handlePay = async () => {
        if (!id) return;
        try {
            const preference = await createPreference(id);
            if (preference && preference.initPointUrl) {
                window.location.href = preference.initPointUrl;
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- HELPER PARA FORMATEAR FECHAS ---
    const getFormattedDateInfo = () => {
        if (!reservation) return 'Fecha no disponible';

        // Helper seguro para validar fechas
        const isValidDate = (d: string | undefined) => d && !isNaN(new Date(d).getTime());

        try {
            // CASO 1: Es un rango (Hotel / Coworking por días)
            // Verificamos que exista endDate y que sea distinto a startDate
            if (isValidDate(reservation.startDate) && isValidDate(reservation.endDate)) {
                const start = format(new Date(reservation.startDate!), "d 'de' MMMM", { locale: es });
                const end = format(new Date(reservation.endDate!), "d 'de' MMMM yyyy", { locale: es });
                return `Del ${start} al ${end}`;
            }

            // CASO 2: Es una fecha puntual con hora (Restaurante / Actividad)
            if (isValidDate(reservation.dateTime)) {
                return format(new Date(reservation.dateTime!), "EEEE d 'de' MMMM, HH:mm 'hs'", { locale: es });
            }

            // CASO 3: Solo tiene startDate (Fallback)
            if (isValidDate(reservation.startDate)) {
                return format(new Date(reservation.startDate!), "d 'de' MMMM yyyy", { locale: es });
            }

            return 'Fecha a confirmar';
        } catch (error) {
            return 'Error en fecha';
        }
    };


    if (isLoadingReservation) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (errorReservation || !reservation) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold">Error al cargar la reserva</h2>
                <p className="text-muted-foreground">No pudimos encontrar los detalles.</p>
                <Button asChild variant="outline" className="mt-6">
                    <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio</Link>
                </Button>
            </div>
        );
    }

    if (reservation.status !== 'PENDING') {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-xl font-semibold">Esta reserva ya fue procesada</h2>
                <p className="text-muted-foreground">El estado actual es: <strong>{reservation.status}</strong></p>
                <Button asChild variant="outline" className="mt-6">
                    <Link to="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Ir a mis reservas</Link>
                </Button>
            </div>
        );
    }

    // Calculamos la fecha con la nueva función
    const dateInfo = getFormattedDateInfo();

    return (
        <div className="min-h-screen bg-muted/40">
            <Header />
            <div className="container mx-auto max-w-2xl p-4 py-12">
                <Button asChild variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                    <span className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </span>
                </Button>

                <Card className="overflow-hidden shadow-lg border-0">
                    <CardHeader className="bg-primary/5 pb-8 pt-6">
                        <CardTitle className="text-2xl">Confirmar y Pagar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">

                        {/* Info de la Publicación y Fecha */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <img
                                src={reservation.publicationMainImageUrl || '/placeholder-image.jpg'} // Fallback de imagen
                                alt={reservation.publicationTitle}
                                className="h-32 w-full sm:w-32 rounded-xl object-cover shadow-sm"
                            />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">{reservation.publicationTitle}</h3>

                                <div className="flex items-center text-muted-foreground">
                                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                                    <span className="capitalize">{dateInfo}</span>
                                </div>

                                <div className="flex items-center text-muted-foreground">
                                    <Users className="h-4 w-4 mr-2 text-primary" />
                                    <span>
                                        {reservation.guests} {reservation.guests === 1 ? 'huésped' : 'huéspedes'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-dashed my-4" />

                        {/* Totales */}
                        <div className="flex justify-between items-end">
                            <span className="text-muted-foreground font-medium">Total a pagar</span>
                            <span className="text-3xl font-bold text-primary">
                                ${reservation.totalPrice?.toLocaleString('es-AR')}
                            </span>
                        </div>

                        {errorPreference && (
                            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                {errorPreference.message || "Error al iniciar pago"}
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="bg-muted/20 p-6">
                        <Button
                            className="w-full text-lg h-12 shadow-primary/20 shadow-lg"
                            onClick={handlePay}
                            disabled={isCreatingPreference}
                        >
                            {isCreatingPreference ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <CreditCard className="mr-2 h-5 w-5" />
                            )}
                            {isCreatingPreference ? 'Procesando...' : 'Pagar con Mercado Pago'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}