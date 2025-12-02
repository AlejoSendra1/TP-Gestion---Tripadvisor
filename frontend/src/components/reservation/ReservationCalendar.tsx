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

  const addOneDay = (dateString: string): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const [currentView, setCurrentView] = useState<CalendarView>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateReservations, setSelectedDateReservations] = useState<ReservationDTO[]>([]);
  const calendarRef = useRef<any>(null);

  // Función para normalizar una fecha a la zona horaria local - CORREGIDA
  const normalizeDate = (date: Date): Date => {
    // Crear una nueva fecha usando los componentes locales
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return new Date(year, month, day, 0, 0, 0, 0);
  };

  // Función para convertir string a fecha normalizada - CORREGIDA
  const parseAndNormalizeDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    // Parsear la fecha string a objeto Date
    const date = new Date(dateString);
    
    // Usar los componentes locales para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    return new Date(year, month, day, 0, 0, 0, 0);
  };

  // Función para obtener fecha de FullCalendar sin problemas de zona horaria
  const getDateFromFullCalendar = (arg: any): Date => {
    // arg.dateStr viene en formato YYYY-MM-DD (sin zona horaria)
    if (arg.dateStr) {
      const [year, month, day] = arg.dateStr.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    
    // Si no hay dateStr, usar arg.date pero normalizar
    return normalizeDate(new Date(arg.date));
  };

  // Función para obtener la fecha de display según el tipo de reserva
  const getDisplayDate = (reservation: ReservationDTO): Date => {
    switch (reservation.reservationType) {
      case 'RESERVATIONHOTEL':
        return reservation.checkIn ? parseAndNormalizeDate(reservation.checkIn) : parseAndNormalizeDate(reservation.reservationDate);
      
      case 'RESERVATIONRESTAURANT':
      case 'RESERVATIONACTIVITY':
        return reservation.dateTime ? parseAndNormalizeDate(reservation.dateTime) : parseAndNormalizeDate(reservation.reservationDate);
      
      case 'RESERVATIONCOWORKING':
        return reservation.startDate ? parseAndNormalizeDate(reservation.startDate) : parseAndNormalizeDate(reservation.reservationDate);
      
      default:
        return parseAndNormalizeDate(reservation.reservationDate);
    }
  };

  // Función para verificar si una fecha está dentro del rango de una reserva
  const isDateInReservationRange = (date: Date, reservation: ReservationDTO): boolean => {
    const targetDate = normalizeDate(date);
    
    // Para reservas de hotel (rango de fechas)
    if (reservation.reservationType === 'RESERVATIONHOTEL' && reservation.checkIn && reservation.checkOut) {
      const checkIn = parseAndNormalizeDate(reservation.checkIn);
      const checkOut = parseAndNormalizeDate(reservation.checkOut);
      
      // La fecha objetivo debe estar entre checkIn (inclusive) y checkOut (inclusive)
      const isInRange = targetDate > checkIn && targetDate <= checkOut;
      
      return isInRange;
    }

    // Para coworking (rango de fechas)
    if (reservation.reservationType === 'RESERVATIONCOWORKING' && reservation.startDate && reservation.endDate) {
      const startDate = parseAndNormalizeDate(reservation.startDate);
      const endDate = parseAndNormalizeDate(reservation.endDate);
      
      return targetDate > startDate && targetDate <= endDate;
    }

    // Para restaurantes y actividades (fecha específica)
    if (reservation.dateTime) {
      const reservationDate = parseAndNormalizeDate(reservation.dateTime);
      return targetDate.getTime() === reservationDate.getTime();
    }

    // Reserva por defecto (solo fecha)
    const displayDate = getDisplayDate(reservation);
    return targetDate.getTime() === displayDate.getTime();
  };

  // Función para filtrar reservas por fecha específica
  const getReservationsForDate = (date: Date): ReservationDTO[] => {
    if (!currentReservations) return [];
    
    const normalizedDate = normalizeDate(date);
    
    return currentReservations.filter((reservation: ReservationDTO) => {
      try {
        return isDateInReservationRange(normalizedDate, reservation);
      } catch (error) {
        console.warn('Error procesando reserva para filtrado:', reservation, error);
        return false;
      }
    });
  };

  // Función para obtener el título del evento
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
      if (typeof color !== 'string') {
        console.error("🚨 DETECTADO ERROR EN COLOR:", color, "Reserva ID:", reservation.id);
      }
      if (typeof title !== 'string') {
        console.error("🚨 DETECTADO ERROR EN TÍTULO:", title, "Reserva ID:", reservation.id);
      }
      // Para reservas de hotel (rango de fechas)
      if (reservation.reservationType === 'RESERVATIONHOTEL' && reservation.checkIn && reservation.checkOut) {
        const adjustedCheckOut = addOneDay(reservation.checkOut);
        return {
          id: reservation.id.toString(),
          title: title,
          start: reservation.checkIn,
          end: adjustedCheckOut, // Para visualización en calendario
          backgroundColor: color,
          borderColor: color,
          extendedProps: { reservation }
        };
      }

      // Para coworking (rango de fechas)
      if (reservation.reservationType === 'RESERVATIONCOWORKING' && reservation.startDate && reservation.endDate) {
        const adjustedEndDate = addOneDay(reservation.endDate);
        return {
          id: reservation.id.toString(),
          title: title,
          start: reservation.startDate,
          end: adjustedEndDate, // Para visualización en calendario
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
        start: displayDate.toISOString().split('T')[0], // Solo la parte de la fecha
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

  // Función para manejar el click en una fecha (días vacíos o con eventos) - CORREGIDA
  const handleDateClick = (arg: any) => {
    // Usar la función que maneja correctamente la zona horaria
    const clickedDate = getDateFromFullCalendar(arg);
    const dateReservations = getReservationsForDate(clickedDate);
    
    setSelectedDate(clickedDate);
    setSelectedDateReservations(dateReservations);
    setCurrentView('dayList');
  };

  // Función para manejar el click en un evento (reserva existente) - CORREGIDA
  const handleEventClick = (info: any) => {
    info.jsEvent.preventDefault();
    info.jsEvent.stopPropagation();
    
    // Obtener la fecha del evento usando la fecha de inicio
    const eventDate = normalizeDate(new Date(info.event.start));
    const dateReservations = getReservationsForDate(eventDate);
    
    setSelectedDate(eventDate);
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
          reservations={selectedDateReservations}
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
          selectOverlap={false}
          eventOverlap={false}
          // Configuración importante para manejo de fechas
          timeZone="local"
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