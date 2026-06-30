export type BookingStatus = "confirmed" | "failed";

export interface Booking {
  id: number;
  userId: number;
  eventId: number;
  reservationId?: number;
  paymentId?: number;
  status: BookingStatus;
  reason?: string;
}
