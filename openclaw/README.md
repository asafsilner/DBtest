# OpenClaw Token Mismatch Fix

## What the error means

When the OpenClaw Control UI shows **"Auth failed. Update the token or password in Control UI settings, then click Connect."** and the gateway log contains a line like:

```
reason=token_mismatch
```

it means the token the Control UI is sending does not match the token the gateway is expecting. The gateway generates or loads its auth token at startup; if the config is wrong, every connection attempt is rejected.

## Root cause

`config.json` has three fields that must hold real API credentials:

| Field | Should contain | Common mistake |
|-------|---------------|----------------|
| `botToken` | Telegram bot token (`xxxxxxx:AAE…`) | Gateway auth token placed here by accident |
| `auth.profiles["google:default"].apiKey` | Google API key (`AIzaSy…`) | Field missing entirely |
| `skills.entries["openai-whisper-api"].apiKey` | OpenAI API key (`sk-proj-…`) | Google key placed here by mistake |

When `botToken` holds the wrong value, the gateway may generate a new random token at startup, so the value stored in Control UI settings no longer matches — causing `token_mismatch` on every connect.

## Quick fix — run the PowerShell script

1. Open **PowerShell** on the Windows machine where OpenClaw is installed.
2. Navigate to the directory containing this file:
   ```powershell
   cd path\to\this\repo\openclaw
   ```
3. Run the script:
   ```powershell
   .\fix-config.ps1
   ```
4. When prompted, enter:
   - Your **Telegram bot token** (obtain from [@BotFather](https://t.me/BotFather) if you don't have one)
   - Your **Google API key** (from Google Cloud Console)
   - Your **OpenAI API key** (from platform.openai.com)
5. The script creates a timestamped backup before making any changes.
6. After the script finishes, restart the OpenClaw gateway (see below).

## Manual fix steps

If the script fails, edit the file directly:

1. Open `C:\Users\<YourName>\.openclaw\config.json` in a text editor.
2. Find `"botToken"` and set it to your Telegram bot token:
   ```json
   "botToken": "1234567890:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```
3. Find `auth` → `profiles` → `google:default` and add or update `apiKey`:
   ```json
   "google:default": {
     "apiKey": "AIzaSy..."
   }
   ```
4. Find `skills` → `entries` → `openai-whisper-api` and set `apiKey` to your OpenAI key:
   ```json
   "openai-whisper-api": {
     "apiKey": "sk-proj-..."
   }
   ```
5. Save the file and restart the gateway.

## Restarting the gateway

- Open **Task Manager** → find any process named `openclaw-gateway`, `openclaw`, or similar → **End Task**.
- Then relaunch OpenClaw (desktop shortcut or the gateway executable).

## Verifying the fix

After restarting:

1. Check the gateway startup log. You should see the bot token being loaded from config (not a freshly generated token).
2. Open the Control UI at:
   ```
   http://127.0.0.1:18789/__openclaw__/canvas/
   ```
3. The gateway log should **not** contain `reason=token_mismatch`.
4. The Control UI should connect and show the canvas without any auth error.

## Backup files

The script writes a backup to the same directory as `config.json` with a timestamp suffix, e.g.:

```
C:\Users\<YourName>\.openclaw\config.json.bak.20250115_143022
```

To restore a backup:

```powershell
Copy-Item "$env:USERPROFILE\.openclaw\config.json.bak.<timestamp>" `
          "$env:USERPROFILE\.openclaw\config.json"
```
