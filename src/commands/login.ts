import chalk from "chalk";
import open from "open";
import http from "http";
import { URLSearchParams } from "url";
import { Arguments } from "yargs";
import { saveConfig } from "../utils/config";
import { setAccessToken } from "../utils/keyring";
import { refreshUserId } from "../utils/me";

const BASE_URL = "https://id.getharvest.com";
const CLIENT_ID = "xqrh-rWpCecJlp9L-i0dwu_K";
export const PORT = 5006;

export const command = "login";
export const description = "Log into Harvest";
export const builder = {
  url: {
    type: "boolean" as const,
    default: false,
    describe: "Print the authorization URL instead of opening a browser",
  },
};

export const handler = async (args: Arguments): Promise<void> => {
  const server = http
    .createServer(async (req, res) => {
      const queryString = req.url?.split("?")[1] || "";
      const params = new URLSearchParams(queryString);

      const error = params.get("error");
      if (error) {
        console.error(chalk.red(error));
      } else {
        const accessToken = params.get("access_token");
        const scope = params.get("scope");

        if (accessToken && scope?.match(/^harvest:\d+$/)) {
          setAccessToken(accessToken);
          await saveConfig({
            accountId: scope.split(":")[1],
          });
          try {
            await refreshUserId();
          } catch (e) {
            console.error(
              chalk.yellow(
                `Warning: could not fetch user info: ${(e as Error).message}`,
              ),
            );
          }
          console.log(
            chalk.green("Success! You are now authenticated with Harvest."),
          );
        } else {
          console.error(
            chalk.red("Error getting access token and account id."),
          );
        }
      }

      res.write(LOGIN_HTML);
      res.end();

      req.socket.end();
      req.socket.destroy();
      server.close();
    })
    .listen(PORT);

  const authUrl = `${BASE_URL}/oauth2/authorize?client_id=${CLIENT_ID}&response_type=token`;

  if (args.url) {
    console.log(authUrl);
  } else {
    open(authUrl);
  }
};

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>hrvst-cli</title>
  </head>
  <body style="background: #eee; font-family: Arial, Helvetica, sans-serif">
    <main
      style="
        display: flex;
        flex-grow: 1;
        justify-content: center;
        margin: 80px auto;
      "
    >
      <div
        style="
          background: #fff;
          background-clip: padding-box;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          box-shadow: 0 2px 10px rgb(0 0 0 / 10%);
          padding: 1em;
          text-align: center;
        "
      >
        <h1 style="font-weight: 600; margin: 0.25em 0">hrvst-cli</h1>
        <p>You may now close this window and return to the CLI.</p>
      </div>
    </main>
  </body>
</html>`;
