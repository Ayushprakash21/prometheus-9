# PROMETHEUS-9
> **Autonomous Marketing, Creative Production & Growth Operating System**
> *Charcoal & Copper Edition*

---

## Operating Cycle

```
RESEARCH → STRATEGIZE → CREATE → VALIDATE → PUBLISH → MEASURE → LEARN → OPTIMIZE
```

---

## Brand Identity

- **Official Palette**:
  - **Obsidian Charcoal**: `#202221`
  - **Graphite**: `#414542`
  - **Burnished Copper**: `#A16C50`
  - **Champagne Beige**: `#C9B49B`
  - **Warm Ivory**: `#EEE8DE`
- **Monogram**: Official P9 Monogram (located in `frontend/public/branding/p9-monogram-logo.jpg`)
- **Typography**:
  - Headings: Manrope
  - Body: Inter
  - Metrics / Technical Values: IBM Plex Mono

---

## Architecture

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 (Async + Sync), SQLite (`storage/prometheus9.db`), APScheduler, Fernet OAuth encryption, FFmpeg 9.0.2 integration.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Operating Products**:
  - `ORION-9` (Enterprise Supply Chain Operating System)
  - `ApplyWise AI` (AI-Powered Career & Resume Platform)
  - Strict isolation: features, brand profiles, and claims are isolated per product.

---

## Quick Start

### 1. Start the Backend API Server
```powershell
cd D:\ANtigravity\PROMETHEUS-9\backend
$env:PYTHONPATH = "."
& "C:\Users\Ayush\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`
- System Health: `http://localhost:8000/api/v1/health`

### 2. Start the Frontend Dashboard
```powershell
cd D:\ANtigravity\PROMETHEUS-9\frontend
npm run dev
```
- Dashboard will open at: `http://localhost:3009`

### 3. Run Automated Tests
```powershell
# Run backend tests
cd D:\ANtigravity\PROMETHEUS-9\backend
$env:PYTHONPATH = "."
& "C:\Users\Ayush\AppData\Local\Programs\Python\Python312\python.exe" -m pytest tests -v

# Build frontend
cd D:\ANtigravity\PROMETHEUS-9\frontend
npm run build
```

---

© 2026 PROMETHEUS-9. Autonomous Marketing Operating System.
