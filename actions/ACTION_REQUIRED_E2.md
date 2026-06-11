# ACTION_REQUIRED_E2 — Google OAuth Client for Chrome Extension

**Blocks:** E2 (Auth) — Sign in with Google in the extension
**Time needed:** ~10 minutes
**When done say:** "ACTION_REQUIRED_E2 done, continue"

---

## IMPORTANT: You do NOT need the old applyai-47158 project

The backend (`GoogleTokenVerifier.java`) validates Google ID tokens by calling
`https://oauth2.googleapis.com/tokeninfo?id_token=` and only checks that the
`sub` (user ID) field is present. **It does not validate the `aud` (client ID) claim.**

This means you can create a brand new OAuth client in any Google account / any GCP project
and it will work identically. Do not spend time hunting for the old project.

---

## Step 1 — Get your Extension ID

1. First build the extension (if not already done):
   ```
   cd D:\applyai-extension
   npm run build
   ```
2. Open Chrome → go to `chrome://extensions`
3. Make sure **Developer mode** is ON (toggle in the top-right)
4. Click **Load unpacked** → navigate to `D:\applyai-extension\dist` → click Select Folder
5. Copy the **Extension ID** shown under the extension name
   (32-character string like `abcdefghijklmnopabcdefghijklmnop`)

---

## Step 2 — Create a new OAuth client (any Google account works)

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
   — sign in with **any** Google account you can access
2. Click the project selector at the top → **New Project**
   - Project name: `ApplyAI`
   - Click **Create**
   - Wait ~10 seconds, then select the new project
3. In the left sidebar → **APIs & Services → OAuth consent screen**
   - User type: **External** → click Create
   - App name: `ApplyAI`
   - User support email: your email
   - Developer contact email: your email
   - Click **Save and Continue** through all steps (no scopes needed)
   - On the last step click **Back to Dashboard**
4. In the left sidebar → **APIs & Services → Credentials**
5. Click **+ CREATE CREDENTIALS → OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Name: `ApplyAI Chrome Extension`
8. Under **Authorized redirect URIs** click **+ ADD URI** and enter:
   ```
   https://<YOUR_EXTENSION_ID>.chromiumapp.org/oauth2
   ```
   Replace `<YOUR_EXTENSION_ID>` with the 32-character ID from Step 1.
9. Click **Create**
10. A dialog shows your credentials — copy the **Client ID**
    (looks like: `123456789012-abc123def456.apps.googleusercontent.com`)

---

## Step 3 — Add to .env

Open `D:\applyai-extension\.env` and fill in:
```
VITE_API_URL=https://applyai-backend-production-3b67.up.railway.app
VITE_GOOGLE_CLIENT_ID=123456789012-abc123def456.apps.googleusercontent.com
```

---

## Step 4 — Rebuild and reload

```bash
cd D:\applyai-extension
npm run build
```

Then in Chrome → `chrome://extensions` → click the **reload** (↻) icon on the ApplyAI extension.

---

## Done

Say **"ACTION_REQUIRED_E2 done, continue"** and we'll test the full sign-in flow end-to-end.
