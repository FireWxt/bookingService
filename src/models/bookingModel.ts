import type { Booking } from "../types.js";
import { userExists } from "../clients/identityClient.js";
import {
  confirmReservation,
  releaseReservation,
  reserveSeat,
} from "../clients/inventoryClient.js";
import { processPayment } from "../clients/paymentClient.js";

export const bookings: Booking[] = [];

let nextId = 1;

function startBooking(userId: number, eventId: number): Booking {
  const booking: Booking = { id: nextId++, userId, eventId, status: "pending" };
  bookings.push(booking);
  return booking;
}

function updateBooking(
  booking: Booking,
  patch: Partial<Omit<Booking, "id" | "userId" | "eventId">>,
): Booking {
  return Object.assign(booking, patch);
}

export async function createBooking(
  userId: number,
  eventId: number,
  amount: number,
  cardNumber: string,
): Promise<Booking> {
  const booking = startBooking(userId, eventId);

  // 1. Vérifier que l'utilisateur existe (Identity Service)
  const exists = await userExists(userId);
  if (!exists) {
    return updateBooking(booking, {
      status: "user_not_found",
      reason: "Utilisateur introuvable",
    });
  }

  // 2. Réserver temporairement une place (Inventory Service)
  const reservationResult = await reserveSeat(eventId);
  if (!reservationResult.ok) {
    return updateBooking(booking, {
      status:
        reservationResult.reason === "event_not_found"
          ? "event_not_found"
          : "no_seats_available",
      reason:
        reservationResult.reason === "event_not_found"
          ? "Événement introuvable"
          : "Plus de places disponibles",
    });
  }
  const { reservation } = reservationResult;
  updateBooking(booking, { reservationId: reservation.id });

  // 3. Demander le paiement (Payment Service)
  const payment = await processPayment(amount, cardNumber);
  updateBooking(booking, { paymentId: payment.id });

  if (payment.status !== "accepted") {
    // Paiement refusé : la place temporairement réservée doit être libérée
    await releaseReservation(reservation.id);
    return updateBooking(booking, {
      status: "payment_failed",
      reason: payment.reason ?? "Paiement refusé",
    });
  }

  // 4. Paiement accepté : confirmer définitivement la réservation
  await confirmReservation(reservation.id);

  return updateBooking(booking, { status: "confirmed" });
}
