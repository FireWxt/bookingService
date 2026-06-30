import "dotenv/config";

export const IDENTITY_SERVICE_URL =
  process.env.IDENTITY_SERVICE_URL ?? "http://localhost:3000";
export const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL ?? "http://localhost:3001";
export const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ?? "http://localhost:3002";

// Jeton partagé entre les services pour authentifier les appels inter-services.
export const HOST_TOKEN = process.env.HOST_TOKEN ?? "tp-secret-host-token";
