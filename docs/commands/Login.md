# Login

To authenticate with Harvest's REST API, [client side OAuth2](https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/#for-client-side-applications) is used. To initiate this, run:

```
hrvst login
```

You’ll be prompted to launch your browser and log in to Harvest to grant Harvest CLI access to your account.

The access token is stored in your operating system's keyring (macOS Keychain, Windows Credential Manager, or Secret Service on Linux). The non-secret account ID is stored in `~/.hrvst/config.json`.

#### Options

| Option  | Description                                                                                                                                   | Required |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `--url` | Print the authorization URL instead of opening a browser. The local callback server still listens, so you can paste the URL into any browser. | false    |
