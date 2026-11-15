#Requires -Version 5.1
<#
.SYNOPSIS
    Fixes the OpenClaw config.json by prompting for the correct API keys and tokens.

.DESCRIPTION
    This script reads C:\Users\<you>\.openclaw\config.json, creates a timestamped
    backup, then prompts you for your Telegram bot token, Google API key, and
    OpenAI API key. It patches the three fields known to cause token_mismatch
    errors and writes the corrected config back to disk.

    After running this script, restart the OpenClaw gateway so it picks up the
    new configuration.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$configPath = Join-Path $env:USERPROFILE '.openclaw\config.json'

if (-not (Test-Path $configPath)) {
    Write-Error "Config file not found at: $configPath"
    exit 1
}

# --- Backup ---------------------------------------------------------------
$timestamp  = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupPath = "$configPath.bak.$timestamp"
Copy-Item -Path $configPath -Destination $backupPath
Write-Host "Backup created: $backupPath" -ForegroundColor Cyan

# --- Read config ----------------------------------------------------------
$raw    = Get-Content -Path $configPath -Raw -Encoding UTF8
$config = $raw | ConvertFrom-Json

# --- Prompt for secrets ---------------------------------------------------
Write-Host ""
Write-Host "Enter your credentials (input is hidden where marked)." -ForegroundColor Yellow
Write-Host ""

$telegramToken = Read-Host "Telegram bot token (from @BotFather)"
$googleKey     = Read-Host "Google API key"
$openaiKey     = Read-Host "OpenAI API key"

if ([string]::IsNullOrWhiteSpace($telegramToken) -or
    [string]::IsNullOrWhiteSpace($googleKey)     -or
    [string]::IsNullOrWhiteSpace($openaiKey)) {
    Write-Error "All three values are required. No changes were made."
    exit 1
}

# --- Patch fields ---------------------------------------------------------
$config.botToken = $telegramToken

# auth.profiles["google:default"].apiKey
$googleProfile = $config.auth.profiles.'google:default'
if ($null -eq $googleProfile) {
    Write-Error "auth.profiles['google:default'] not found in config. No changes were made."
    exit 1
}
$googleProfile | Add-Member -MemberType NoteProperty -Name 'apiKey' -Value $googleKey -Force

# skills.entries["openai-whisper-api"].apiKey
$whisperEntry = $config.skills.entries.'openai-whisper-api'
if ($null -eq $whisperEntry) {
    Write-Error "skills.entries['openai-whisper-api'] not found in config. No changes were made."
    exit 1
}
$whisperEntry.apiKey = $openaiKey

# --- Write patched config back --------------------------------------------
$config | ConvertTo-Json -Depth 20 | Set-Content -Path $configPath -Encoding UTF8

Write-Host ""
Write-Host "Config updated successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open Task Manager and end any 'openclaw-gateway' or 'openclaw' process."
Write-Host "  2. Restart OpenClaw (double-click the OpenClaw shortcut or run the gateway exe)."
Write-Host "  3. Open the Control UI at http://127.0.0.1:18789/__openclaw__/canvas/"
Write-Host "  4. If prompted, enter the gateway token shown in the gateway startup log."
Write-Host ""
Write-Host "If you still see 'token_mismatch', check that the gateway log shows"
Write-Host "  'Loaded bot token from config' (not 'Generated new token')."
