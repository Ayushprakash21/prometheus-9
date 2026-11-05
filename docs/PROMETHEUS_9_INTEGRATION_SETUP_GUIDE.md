# PROMETHEUS-9 — INTEGRATION & ENVIRONMENT SETUP GUIDE
## Step-by-Step Production Configuration Handbook
**Platform:** PROMETHEUS-9 Autonomous Growth Operating System  
**Version:** 1.0.0 Production  

---

## 1. PREREQUISITES & ENVIRONMENT REQUIREMENTS

- **Operating System:** Linux, macOS, or Windows 10/11
- **Python:** 3.12+ (64-bit)
- **Node.js:** 20.x or 22.x LTS
- **FFmpeg:** 6.x or 7.x (Available in system PATH for hardware-accelerated video rendering)
- **Git:** 2.40+

---

## 2. REPOSITORY INITIALIZATION

```bash
# Clone the repository
git clone https://github.com/Ayushprakash21/prometheus-9.git
cd prometheus-9

# Backend Setup
cd backend
python -m venv .venv

# On Linux / macOS:
source .venv/bin/activate
# On Windows PowerShell:
.venv\Scripts\Activate.ps1

pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Run automated test suite
pytest tests -v
```

---

## 3. ENVIRONMENT VARIABLES CONFIGURATION

Copy `.env.example` to `.env` in the `backend/` directory:

```env
# SERVER & SECURITY
PROJECT_NAME="PROMETHEUS-9"
VERSION="1.0.0"
ENVIRONMENT="production"
SECRET_KEY="generate-a-secure-random-64-character-hex-string"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=14

# DATABASE (SQLite WAL for local persistence; PostgreSQL for cloud cluster)
DATABASE_URL="sqlite+aiosqlite:///storage/prometheus9.db"

# STORAGE & ASSET DIRECTORY
STORAGE_DIR="storage/assets"
MAX_ASSET_SIZE_MB=50

# AI MODEL PROVIDERS (Encrypted in Vault)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
OPENAI_API_KEY="sk-proj-YourOpenAiApiKeyHere"
ANTHROPIC_API_KEY="sk-ant-YourAnthropicApiKeyHere"
LOCAL_OLLAMA_URL="http://localhost:11434"

# SOCIAL PLATFORM OAUTH CREDENTIALS
YOUTUBE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="your-google-oauth-client-secret"
YOUTUBE_REDIRECT_URI="https://prometheus-9.pages.dev/api/v1/publishing/oauth/youtube/callback"

LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_REDIRECT_URI="https://prometheus-9.pages.dev/api/v1/publishing/oauth/linkedin/callback"

TWITTER_CLIENT_ID="your-x-client-id"
TWITTER_CLIENT_SECRET="your-x-client-secret"
TWITTER_REDIRECT_URI="https://prometheus-9.pages.dev/api/v1/publishing/oauth/x/callback"

META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
META_REDIRECT_URI="https://prometheus-9.pages.dev/api/v1/publishing/oauth/meta/callback"
```

---

## 4. AI MODEL PROVIDER SETUP

### A. Google Gemini API (Recommended Tier 1 & 2 Engine)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create an API Key.
3. In PROMETHEUS-9, navigate to **Administration → AI Provider Configuration**.
4. Enable `gemini-1.5-pro` for deep research and `gemini-1.5-flash` for high-velocity script writing.
5. Click **Test Latency** to verify sub-350ms response times.

### B. Anthropic Claude API (Creative Director Tier)
1. Register at [Anthropic Console](https://console.anthropic.com/).
2. Generate an API Key with `claude-3-5-sonnet` permissions.
3. Paste the key into PROMETHEUS-9 AI Providers vault.

### C. Local Ollama (Zero-Outbound Fallback)
1. Download Ollama from [ollama.com](https://ollama.com).
2. Pull the instruction model:
   ```bash
   ollama pull llama3.3:70b-instruct
   ```
3. Set `LOCAL_OLLAMA_URL=http://localhost:11434` to enable offline, zero-data-leakage drafting.

---

## 5. SOCIAL MEDIA OAUTH 2.0 INTEGRATION

### A. YouTube Data API v3
1. In [Google Cloud Console](https://console.cloud.google.com/), enable the **YouTube Data API v3**.
2. Configure the OAuth Consent Screen and add the scopes:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/yt-analytics.readonly`
3. Create an **OAuth 2.0 Client ID** (Web Application).
4. Add the Authorized Redirect URI:
   `https://prometheus-9.pages.dev/api/v1/publishing/oauth/youtube/callback`

### B. LinkedIn Marketing API
1. In [LinkedIn Developers](https://developer.linkedin.com/), create an Application.
2. Request product access to **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect**.
3. Add scopes: `w_member_social`, `r_liteprofile`, `r_organization_social`.
4. Copy Client ID and Client Secret into the PROMETHEUS-9 Social Accounts tab.

### C. X (Twitter) API v2
1. In [X Developer Portal](https://developer.x.com/), create a Project with User Authentication settings.
2. Select **OAuth 2.0** with **Read and Write** and **Direct Message** permissions.
3. Set the Type of App to **Web App**.

---

## 6. FFMPEG PROGRAMMATIC VIDEO ENGINE SETUP

PROMETHEUS-9 automatically searches for FFmpeg in your system PATH.

### Installation Check
```bash
ffmpeg -version
```
Expected output:
```
ffmpeg version 7.1 or 6.x ... Copyright (c) 2000-2024 the FFmpeg developers
```

### Windows Installation
```powershell
winget install Gyan.FFmpeg
```

### Linux Installation
```bash
sudo apt update && sudo apt install -y ffmpeg
```

---

## 7. FRONTEND PRODUCTION DEPLOYMENT (CLOUDFLARE PAGES)

```bash
cd frontend
npm install
npm run build

# Deploy to Cloudflare Pages edge network
npx wrangler pages deploy dist --project-name=prometheus-9
```

Production deployment URL: **`https://prometheus-9.pages.dev`**
