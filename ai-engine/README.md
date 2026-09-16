# PRISM AI Engine (Python FastAPI)

High-performance asynchronous AI sidecar engine for PRISM English Placement & Learning Platform.

---

## 🚀 Quickstart (Local Development)

### 1. Masuk ke folder `ai-engine`
```bash
cd ai-engine
```

### 2. Buat & Aktifkan Virtual Environment (.venv)

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
```

**Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

### 3. Install Dependensi
```bash
pip install -r requirements.txt
```

---

### 4. Jalankan Server FastAPI
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check:** [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 🔒 Keamanan & Integrasi Next.js

Setiap endpoint internal dilindungi oleh header:
```http
X-Internal-Secret: <INTERNAL_API_KEY>
```
Konfigurasi kunci rahasia ini diatur melalui file `.env` baik di Next.js maupun di `ai-engine/.env`.
