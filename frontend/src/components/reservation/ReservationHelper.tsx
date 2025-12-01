export const getReservationType = (r: any): string => {
  const type = String(
    r.reservationType ?? r.type ?? r.reservation_type ?? r.class ?? ""
  ).toLowerCase();

  if (type.includes("hotel") || type.includes("reservationhotel") || r.checkIn || r.check_in) {
    return "Hotel";
  }
  if (type.includes("activity") || type.includes("reservationactivity") || r.participantCount) {
    return "Actividad";
  }
  if (type.includes("restaurant") || type.includes("reservationrestaurant") || r.dateTime || r.reservation_datetime) {
    return "Restaurante";
  }
  if (type.includes("cowork") || type.includes("coworking") || r.start_date || r.end_date || r.startDate || r.endDate) {
    return "Coworking";
  }
  
  return "Reserva";
};


export const getEventColor = (reservationType: string): string => {
  const typeUpper = reservationType.toUpperCase();
  
  if (typeUpper.includes('HOTEL') || typeUpper.includes('RESERVATIONHOTEL')) {
    return '#3b82f6'; // blue
  }
  if (typeUpper.includes('RESTAURANT') || typeUpper.includes('RESERVATIONRESTAURANT')) {
    return '#10b981'; // green
  }
  if (typeUpper.includes('ACTIVITY') || typeUpper.includes('RESERVATIONACTIVITY')) {
    return '#8b5cf6'; // purple
  }
  if (typeUpper.includes('COWORKING') || typeUpper.includes('RESERVATIONCOWORKING')) {
    return '#f59e0b'; // orange
  }
  return '#6b7280'; // gray
};
