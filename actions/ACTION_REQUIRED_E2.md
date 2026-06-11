# ACTION_REQUIRED_E2 — Google OAuth Client for Chrome Extension

**Blocks:** E2 (Auth) — Sign in with Google in the extension
**Time needed:** ~5 minutes
**When done say:** "ACTION_REQUIRED_E2 done, continue E3"

---

## Why this is needed

The extension uses `chrome.identity.launchWebAuthFlow` to get a Google ID token.
This requires a Google OAuth 2.0 Client ID with the extension's redirect URI registered.

---

## Step 1 — Get your Extension ID

1. Open Chrome → go to `chrome://extensions`
2. Make sure **Developer mode** is ON (top right toggle)
3. Click **Load unpacked** → select `D:\applyai-extension\dist`
4. Copy the **Extension ID** (looks like: `abcdefghijklmnopabcdefghijklmnop`)

---

## Step 2 — Add OAuth Client in Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your existing project (the one used for the mobile app Firebase)
3. Navigate to **APIs & Services → Credentials**
4. Click **+ CREATE CREDENTIALS → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `ApplyAI Chrome Extension`
7. Under **Authorized redirect URIs**, click **+ ADD URI** and enter:
   ```
   https://<YOUR_EXTENSION_ID>.chromiumapp.org/oauth2
   ```
   Replace `<YOUR_EXTENSION_ID>` with the ID from Step 1.
8. Click **Create**
9. Copy the **Client ID** (looks like: `1234567890-abc...apps.googleusercontent.com`)

---

## Step 3 — Add to .env

Open `D:\applyai-extension\.env` and add:
```
VITE_GOOGLE_CLIENT_ID=1234567890-abc...apps.googleusercontent.com
```

---

## Step 4 — Rebuild

```bash
cd D:\applyai-extension
npm run build
```

Then in Chrome → `chrome://extensions` → click the **reload** icon on the ApplyAI extension.

---

## Done

Say **"ACTION_REQUIRED_E2 done, continue"** and we'll test the full sign-in flow.
