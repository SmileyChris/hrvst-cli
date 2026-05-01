import { getConfig, saveConfig } from "./config";
import { getAccessToken } from "./keyring";

const USER_AGENT = "hrvst-cli (https://www.npmjs.com/package/hrvst-cli)";

/**
 * Returns the authenticated user's ID. Cached in config after first lookup.
 */
export async function getUserId(): Promise<number> {
  const config = await getConfig();
  if (config.userId) {
    return config.userId;
  }

  const accessToken = getAccessToken();
  const res = await fetch("https://api.harvestapp.com/v2/users/me", {
    headers: {
      "User-Agent": USER_AGENT,
      Authorization: `Bearer ${accessToken}`,
      "Harvest-Account-ID": config.accountId,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch /users/me: ${res.status}`);
  }

  const user = (await res.json()) as { id: number };
  await saveConfig({ userId: user.id });
  return user.id;
}
