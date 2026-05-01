import { Entry } from "@napi-rs/keyring";

const SERVICE = "hrvst-cli";
const ACCOUNT = "access_token";

function entry(): Entry {
  return new Entry(SERVICE, ACCOUNT);
}

export function getAccessToken(): string | null {
  return entry().getPassword();
}

export function setAccessToken(token: string): void {
  entry().setPassword(token);
}

export function deleteAccessToken(): void {
  entry().deletePassword();
}
