import type { Booking } from "../types.js";
import { userExists } from "../clients/identityClient.js";
import {
  confirmReservation,
  getEvent,
  releaseReservation,
  reserveSeat,
} from "../clients/inventoryClient.js";
import { processPayment } from "../clients/paymentClient.js";

export const bookings: Booking[] = [];

let nextId = 1;

function recordBooking(data: Omit<Booking, "id">): Booking {
  const booking: Booking = { id: nextId++, ...data };
  bookings.push(booking);
  return booking;
}

export async function createBooking(
  userId: number,
  eventId: number,
  amount: number,
  cardNumber: string,
): Promise<Booking> {
  // 1. Vérifier l'utilisateur auprès de l'Identity Service
  const exists = await userExists(userId);
  if (!exists) {
    return recordBooking({
      userId,
      eventId,
      status: "failed",
      reason: "Utilisateur introuvable",
    });
  }

  // 2. Vérifier l'événement auprès de l'Inventory Service
  const event = await getEvent(eventId);
  if (!event) {
    return recordBooking({
      userId,
      eventId,
      status: "failed",
      reason: "Événement introuvable",
    });
  }

  // 3. Réserver temporairement une place
  const reservation = await reserveSeat(eventId);
  if (!reservation) {
    return recordBooking({
      userId,
      eventId,
      status: "failed",
      reason: "Plus de places disponibles",
    });
  }

  // 4. Traiter le paiement auprès du Payment Service
  const payment = await processPayment(amount, cardNumber);
  if (payment.status !== "accepted") {
    await releaseReservation(reservation.id);
    return recordBooking({
      userId,
      eventId,
      reservationId: reservation.id,
      paymentId: payment.id,
      status: "failed",
      reason: payment.reason ?? "Paiement refusé",
    });
  }

  // 5. Confirmer définitivement la réservation
  await confirmReservation(reservation.id);

  return recordBooking({
    userId,
    eventId,
    reservationId: reservation.id,
    paymentId: payment.id,
    status: "confirmed",
  });
}
