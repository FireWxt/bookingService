import { HOST_TOKEN, IDENTITY_SERVICE_URL } from "../config.js";

export async function userExists(userId: number): Promise<boolean> {
  const res = await fetch(`${IDENTITY_SERVICE_URL}/users/${userId}/exists`, {
    headers: { "X-Host-Token": HOST_TOKEN },
  });
  if (!res.ok) {
    return false;
  }

  const data = (await res.json()) as { exists: boolean };
  return data.exists;
}
