import fs from "fs";
import ospath from "ospath";
import path from "path";
import { setAccessToken } from "./keyring";

export interface Config {
  accountId: string;
  userId?: number;
  accountConfig: Record<string, AccountConfig>;
}

export interface AccountConfig {
  aliases: Record<string, Alias>;
}

export interface Alias {
  projectId: number;
  taskId: number;
}

export class ConfigNotFoundError extends Error {}

export async function getConfig(): Promise<Config> {
  let parsed: Config & { accessToken?: string };
  try {
    const config = await fs.promises.readFile(await configPath(), "utf-8");
    parsed = JSON.parse(config);
  } catch (error) {
    throw new ConfigNotFoundError();
  }

  if (parsed.accessToken) {
    const { accessToken, ...rest } = parsed;
    try {
      setAccessToken(accessToken);
      await fs.promises.writeFile(await configPath(), JSON.stringify(rest));
    } catch {
      // If keyring is unavailable, leave the file as-is so the user keeps
      // working; the next API call will surface the keyring error.
    }
    return rest;
  }

  return parsed;
}

export async function saveConfig(config: Partial<Config>): Promise<void> {
  try {
    const existingConfig = await getConfig();

    await fs.promises.writeFile(
      await configPath(),
      JSON.stringify(Object.assign({}, existingConfig, config)),
    );
  } catch (error) {
    await fs.promises.writeFile(await configPath(), JSON.stringify(config));
  }
}

async function configPath(): Promise<string> {
  const dir = path.join(ospath.home(), ".hrvst");

  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir);
  }

  return path.join(dir, "config.json");
}
