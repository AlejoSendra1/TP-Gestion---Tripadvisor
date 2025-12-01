// components/ReservationCalendar.tsx
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useUserReservations } from "@/hooks/useUserReservations";
import { useOwnerReservations } from "@/hooks/useOwnerReservations";
import ReservationList from "./ReservationList";
import { getEventColor } from "./ReservationHelper";

type ReservationListProps = {
  isOwner?: boolean;
  publicationId?: string;
};

// Tipo basado en el DTO de Java
type ReservationDTO = {
  id: number;
  publicationId: number;
  pubName: string;
  travelerId: number;
  travelerName: string;
  reservationDate: string;
  totalPrice: number;
  status: string;
  notes: string;
  reservationType: string;
  checkIn?: string;
  checkOut?: string;
  roomCount?: number;
  dateTime?: string;
  guestCount?: number;
  participantCount?: number;
  startDate?: string;
  endDate?: string;
};

type CalendarView = 'calendar' | 'dayList';

export const ReservationCalendar: React.FC<ReservationListProps> = ({ 
  isOwner = false, 
  publicationId 
}) => {
  // Usar el hook correspondiente según el contexto
  const userReservations = useUserReservations();
  const ownerReservations = useOwnerReservations(publicationId);

  const { 
    reservations, 
    isLoading, 
    error, 
    fetchReservations: fetchUserReservations 
  } = userReservations;

  const { 
    reservations: ownerReservationsData, 
    isLoading: isLoadingOwner, 
    error: errorOwner,
    fetchOwnerReservations 
  } = ownerReservations;

  // Seleccionar datos según el contexto
  const currentReservations = isOwner ? ownerReservationsData : reservations;
  const currentLoading = isOwner ? isLoadingOwner : isLoading;
  const currentError = isOwner ? errorOwner : error;
  const refetch = isOwner ? fetchOwnerReservations : fetchUserReservations;

  const [currentView, setCurrentView] = useState<CalendarView>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateReservations, setSelectedDateReservations] = useState<ReservationDTO[]>([]);
  const calendarRef = useRef<any>(null);

  // Función para obtener la fecha de display según el tipo de reserva
  const getDisplayDate = (reservation: ReservationDTO): Date => {
    switch (reservation.reservationType) {
      case 'RESERVATIONHOTEL':
        return reservation.checkIn ? new Date(reservation.checkIn) : new Date(reservation.reservationDate);
      
      case 'RESERVATIONRESTAURANT':
      case 'RESERVATIONACTIVITY':
        return reservation.dateTime ? new Date(reservation.dateTime) : new Date(reservation.reservationDate);
      
      case 'RESERVATIONCOWORKING':
        return reservation.startDate ? new Date(reservation.startDate) : new Date(reservation.reservationDate);
      
      default:
        return new Date(reservation.reservationDate);
    }
  };

  // Función para verificar si una fecha está dentro del rango de una reserva
  const isDateInReservationRange = (date: Date, reservation: ReservationDTO): boolean => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Para reservas de hotel (rango de fechas)
    if (reservation.reservationType === 'RESERVATIONHOTEL' && reservation.checkIn && reservation.checkOut) {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      // La fecha objetivo debe estar entre checkIn (inclusive) y checkOut (exclusive)
      // Es decir, desde el día de check-in hasta el día anterior al check-out
      return targetDate >= checkIn && targetDate <= checkOut;
    }

    // Para coworking (rango de fechas)
    if (reservation.reservationType === 'RESERVATIONCOWORKING' && reservation.startDate && reservation.endDate) {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return targetDate >= startDate && targetDate <= endDate;
    }

    // Para restaurantes y actividades (fecha específica)
    if (reservation.dateTime) {
      const reservationDate = new Date(reservation.dateTime);
      reservationDate.setHours(0, 0, 0, 0);
      return targetDate.getTime() === reservationDate.getTime();
    }

    // Reserva por defecto (solo fecha)
    const displayDate = getDisplayDate(reservation);
    displayDate.setHours(0, 0, 0, 0);
    return targetDate.getTime() === displayDate.getTime();
  };

  // Función para filtrar reservas por fecha específica - CORREGIDA
  const getReservationsForDate = (date: Date): ReservationDTO[] => {
    if (!currentReservations) return [];
    
    return currentReservations.filter((reservation: ReservationDTO) => {
      try {
        return isDateInReservationRange(date, reservation);
      } catch (error) {
        console.warn('Error procesando reserva para filtrado:', reservation, error);
        return false;
      }
    });
  };

  // Función para obtener el título del evento - MODIFICADA
  const getEventTitle = (reservation: ReservationDTO): string => {
    // Si es owner, mostrar el nombre del viajero
    if (isOwner) {
      const travelerName = reservation.travelerName || 'Cliente';
      return `${travelerName}`;
    }
    
    // Si no es owner, mostrar el nombre de la publicación con ícono
    const baseTitle = reservation.pubName || 'Reserva';
    
    switch (reservation.reservationType) {
      case 'RESERVATIONHOTEL':
        return `🏨 ${baseTitle}`;
      case 'RESERVATIONRESTAURANT':
        return `🍽️ ${baseTitle}`;
      case 'RESERVATIONACTIVITY':
        return `🎯 ${baseTitle}`;
      case 'RESERVATIONCOWORKING':
        return `💼 ${baseTitle}`;
      default:
        return `📅 ${baseTitle}`;
    }
  };

  // Convertir reservas a eventos de FullCalendar
  const getCalendarEvents = () => {
    if (!currentReservations) return [];

    return currentReservations.map((reservation: ReservationDTO) => {
      const displayDate = getDisplayDate(reservation);
      const color = getEventColor(reservation.reservationType);
      const title = getEventTitle(reservation);

      // Para reservas de hotel (rango de fechas)
      if (reservation.reservationType === 'RESERVATIONHOTEL' && reservation.checkIn && reservation.checkOut) {
        return {
          id: reservation.id.toString(),
          title: title,
          start: reservation.checkIn,
          end: reservation.checkOut,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { reservation }
        };
      }

      // Para coworking (rango de fechas)
      if (reservation.reservationType === 'RESERVATIONCOWORKING' && reservation.startDate && reservation.endDate) {
        return {
          id: reservation.id.toString(),
          title: title,
          start: reservation.startDate,
          end: reservation.endDate,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { reservation }
        };
      }

      // Para restaurantes y actividades (fecha y hora específica)
      if (reservation.dateTime) {
        return {
          id: reservation.id.toString(),
          title: title,
          start: reservation.dateTime,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { reservation }
        };
      }

      // Reserva por defecto (solo fecha)
      return {
        id: reservation.id.toString(),
        title: title,
        start: displayDate,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        extendedProps: { reservation }
      };
    });
  };

  const handleReservationUpdate = () => {
    refetch().catch(() => {});
  };

  // Función para manejar el click en una fecha (días vacíos)
  const handleDateClick = (arg: any) => {
    const dateReservations = getReservationsForDate(arg.date);
    setSelectedDate(arg.date);
    setSelectedDateReservations(dateReservations);
    setCurrentView('dayList');
  };

  // Función para manejar el click en un evento (reserva existente)
  const handleEventClick = (info: any) => {
    info.jsEvent.preventDefault();
    const reservationDate = info.event.start;
    const dateReservations = getReservationsForDate(reservationDate);
    setSelectedDate(reservationDate);
    setSelectedDateReservations(dateReservations);
    setCurrentView('dayList');
  };

  // Función para volver al calendario
  const handleBackToCalendar = () => {
    setCurrentView('calendar');
    setSelectedDate(null);
    setSelectedDateReservations([]);
  };

  if (currentLoading) {
    return <div className="text-sm text-muted-foreground">Cargando reservas...</div>;
  }

  if (currentError) {
    return (
      <div className="text-sm text-destructive">
        Error cargando reservas: {String(currentError.message ?? currentError)}
      </div>
    );
  }

  // Vista de lista de reservas del día seleccionado
  if (currentView === 'dayList') {
    return (
      <div className="w-full max-w-full">
        {/* Header con botón de volver */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <button 
            onClick={handleBackToCalendar}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>←</span>
            Volver al Calendario
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              Reservas del {selectedDate?.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-sm text-gray-600">
              {selectedDateReservations.length} reserva{selectedDateReservations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Usar el componente ReservationList con las reservas filtradas */}
        <ReservationList
          isOwner={isOwner}
          publicationId={publicationId}
          reservations={selectedDateReservations} // Pasar solo las reservas del día seleccionado
        />
      </div>
    );
  }

  // Vista del calendario con FullCalendar
  return (
    <div className="w-full max-w-full">
      {/* Leyenda de tipos de reserva - SOLO para no owners */}
      {!isOwner && (
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Restaurante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Actividad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">Coworking</span>
          </div>
        </div>
      )}

      {/* FullCalendar */}
      <div className="bg-white rounded-lg shadow">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={getCalendarEvents()}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          locale="es"
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          unselectAuto={false}
          dayCellClassNames="cursor-pointer hover:bg-gray-50"
          eventDisplay="block"
          eventBackgroundColor="transparent"
          navLinks={true}
          navLinkDayClick="day"
          moreLinkClick="day"
        />
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <div>Total de reservas: {currentReservations?.length || 0}</div>
        <div className="text-gray-600 mt-1">
          • Haz click en <strong>cualquier día</strong> (incluso vacíos) para ver las reservas
          <br />
          • Haz click en <strong>cualquier evento</strong> para ver las reservas de ese día
          <br />
          • Usa los botones de vista para cambiar entre mes, semana y día
        </div>
      </div>
    </div>
  );
};

export default ReservationCalendar;