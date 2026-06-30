import { HOST_TOKEN, INVENTORY_SERVICE_URL } from "../config.js";

export interface ReservationDto {
  id: number;
  eventId: number;
  status: "pending" | "confirmed";
}

export type ReserveSeatResult =
  | { ok: true; reservation: ReservationDto }
  | { ok: false; reason: "event_not_found" | "no_seats_available" };

export async function reserveSeat(eventId: number): Promise<ReserveSeatResult> {
  const res = await fetch(
    `${INVENTORY_SERVICE_URL}/events/${eventId}/reservations`,
    { method: "POST", headers: { "X-Host-Token": HOST_TOKEN } },
  );
  if (res.status === 404) {
    return { ok: false, reason: "event_not_found" };
  }
  if (res.status === 409) {
    return { ok: false, reason: "no_seats_available" };
  }
  if (!res.ok) {
    throw new Error("Failed to reserve seat");
  }

  return { ok: true, reservation: (await res.json()) as ReservationDto };
}

export async function confirmReservation(
  reservationId: number,
): Promise<ReservationDto> {
  const res = await fetch(
    `${INVENTORY_SERVICE_URL}/reservations/${reservationId}/confirm`,
    { method: "POST", headers: { "X-Host-Token": HOST_TOKEN } },
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
    headers: { "X-Host-Token": HOST_TOKEN },
  });
}
