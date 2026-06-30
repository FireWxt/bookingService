import { HOST_TOKEN, PAYMENT_SERVICE_URL } from "../config.js";

export interface PaymentDto {
  id: number;
  amount: number;
  cardNumber: string;
  status: "accepted" | "rejected";
  reason?: string;
}

export async function processPayment(
  amount: number,
  cardNumber: string,
): Promise<PaymentDto> {
  const res = await fetch(`${PAYMENT_SERVICE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Host-Token": HOST_TOKEN,
    },
    body: JSON.stringify({ amount, cardNumber }),
  });
  if (!res.ok) {
    throw new Error("Failed to process payment");
  }

  return (await res.json()) as PaymentDto;
}
