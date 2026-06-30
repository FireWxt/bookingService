export type BookingStatus =
  | "pending"
  | "confirmed"
  | "user_not_found"
  | "event_not_found"
  | "no_seats_available"
  | "payment_failed";

export interface Booking {
  id: number;
  userId: number;
  eventId: number;
  reservationId?: number;
  paymentId?: number;
  status: BookingStatus;
  reason?: string;
}
