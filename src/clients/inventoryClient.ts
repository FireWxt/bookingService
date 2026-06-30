import { INVENTORY_SERVICE_URL } from "../config.js";

export interface EventDto {
  id: number;
  name: string;
  availableSeats: number;
}

export interface ReservationDto {
  id: number;
  eventId: number;
  status: "pending" | "confirmed";
}

export async function getEvent(eventId: number): Promise<EventDto | null> {
  const res = await fetch(`${INVENTORY_SERVICE_URL}/events/${eventId}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch event");
  }

  return (await res.json()) as EventDto;
}

export async function reserveSeat(
  eventId: number,
): Promise<ReservationDto | null> {
  const res = await fetch(
    `${INVENTORY_SERVICE_URL}/events/${eventId}/reservations`,
    { method: "POST" },
  );
  if (res.status === 404 || res.status === 409) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to reserve seat");
  }

  return (await res.json()) as ReservationDto;
}

export async function confirmReservation(
  reservationId: number,
): Promise<ReservationDto> {
  const res = await fetch(
    `${INVENTORY_SERVICE_URL}/reservations/${reservationId}/confirm`,
    { method: "POST" },
  );
  if (!res.ok) {
    throw new Error("Failed to confirm reservation");
  }

  return (await res.json()) as ReservationDto;
}

export async function releaseReservation(
  reservationId: number,
): Promise<void> {
  await fetch(`${INVENTORY_SERVICE_URL}/reservations/${reservationId}`, {
    method: "DELETE",
  });
}
