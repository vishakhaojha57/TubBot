# YouTube AI Chatbot - Deployment Plan

## Project Overview
- **Frontend**: React + Vite (TypeScript/JSX)
- **Backend**: FastAPI + Uvicorn (Python)
- **Key Dependencies**: Google Gemini API, YouTube Transcript API, FAISS

---

## Recommended Deployment Architecture

### Option 1: Vercel (Frontend) + Render/Railway (Backend) ⭐ **RECOMMENDED**

**Why?**
- Free tier available for both
- Easy CI/CD integration with GitHub
- Automatic deployments on push
- Good for startup/portfolio projects

#### Frontend - Vercel
```
1. Prerequisites:
   - Push code to GitHub
   - Create Vercel account (vercel.com)

2. Deployment Steps:
   a. Import project from GitHub
   b. Set build command: npm run build
   c. Set output directory: dist
   d. Add environment variables:
      - VITE_API_URL=https://your-backend-url.com/api
   
3. Vercel Config (already included in vercel.json):
   - Framework: Vite
   - Node version: 18+
```

#### Backend - Render.com or Railway.app

**Render Setup:**
```
1. Prerequisites:
   - Push backend to GitHub (or separate repo)
   - Create Render account

2. Deployment Steps:
   a. Create new Web Service
   b. Connect GitHub repository
   c. Build Command: pip install -r requirements.txt
   d. Start Command: uvicorn app.main:app --host 0.0.0.0 --port 8000
   e. Environment Variables:
      - GEMINI_API_KEY=your_key_here
      - PYTHONUNBUFFERED=1
   f. Specify Python version in runtime.txt ✓ (already in repo)

3. Auto-deploy on git push
```

---

## Option 2: Docker + Cloud Run (Google Cloud) / Lambda (AWS)

**Better for production-grade deployments**

### Backend Dockerfile
```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose (Local Testing)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000/api
```

---

## Step-by-Step Deployment Guide (Vercel + Render)

### Phase 1: Pre-Deployment Setup (5 mins)

```bash
# 1. Create .env.example files (no secrets)
# Backend: backend/.env.example
GEMINI_API_KEY=your_api_key_here

# 2. Update frontend API URL
# Create .env.production in frontend/
VITE_API_URL=https://your-backend-render.onrender.com/api

# 3. Update CORS in backend/app/main.py
# Add production frontend URL to allow_origins
```

### Phase 2: Backend Deployment (Render)

```
1. Go to render.com → Create Web Service
2. Connect GitHub repo (or push backend folder)
3. Configure:
   - Name: youtube-chatbot-api
   - Environment: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port 8000
   - Region: US (or closest to you)

4. Add Secrets (Environment Variables):
   - GEMINI_API_KEY = [paste your actual key]
   - PYTHONUNBUFFERED = true

5. Deploy → Copy backend URL (e.g., https://youtube-chatbot-api.onrender.com)
```

### Phase 3: Frontend Deployment (Vercel)

```
1. Go to vercel.com → Import project
2. Select GitHub repo
3. Project settings:
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist

4. Add Environment Variables:
   - VITE_API_URL=https://youtube-chatbot-api.onrender.com/api

5. Deploy → Get production URL
```

### Phase 4: Update CORS & API URLs

```python
# backend/app/main.py - Update CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",              # Local dev
        "http://localhost:3000",              # Local dev
        "https://your-frontend-vercel.app",   # Production Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Pre-Deployment Checklist

- [ ] `.env` file NOT committed to GitHub (add to .gitignore)
- [ ] `requirements.txt` up to date
- [ ] `runtime.txt` specifies Python version
- [ ] Frontend `.env.production` configured with correct API URL
- [ ] Backend CORS configured for production domain
- [ ] Gemini API key securely stored in Render secrets
- [ ] Test API locally: `http://localhost:8000/docs`
- [ ] Test health endpoint: `http://localhost:8000/`

---

## Environment Variables Summary

### Backend (Render Secrets)
```
GEMINI_API_KEY=sk-...
PYTHONUNBUFFERED=true
```

### Frontend (Vercel Environment)
```
VITE_API_URL=https://youtube-chatbot-api.onrender.com/api
```

---

## Monitoring & Logs

**Render Dashboard:**
- Real-time logs available
- Metrics: CPU, Memory, Requests
- Auto-restart on crash

**Vercel Dashboard:**
- Build logs & deployment history
- Edge function analytics
- Performance monitoring

---

## Cost Estimate (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel Frontend | ✅ Unlimited deployments | $20+/mo |
| Render Backend | ✅ 750 hours/month (1 service) | $7+/mo |
| Gemini API | Free (500 requests/day) | Pay as you go |
| **Total** | **~$0 (free tier)** | ~$27+/mo |

---

## Post-Deployment Steps

1. **Test Production:**
   ```bash
   curl https://your-backend.onrender.com/
   # Should return: {"status": "ok", "message": "TubBot API is running 🚀"}
   ```

2. **Setup Auto-Scaling** (if needed):
   - Render: Enable auto-scaling for traffic spikes
   - Vercel: Already auto-scales

3. **Monitor & Debug:**
   - Check Render logs for API errors
   - Check Vercel logs for frontend issues
   - Monitor Gemini API quota

4. **CI/CD Pipeline:**
   - GitHub → Auto-deploys to Render (backend) & Vercel (frontend)
   - No manual deployment needed after setup

---

## Troubleshooting

**CORS Errors?**
- Update `allow_origins` in backend/app/main.py
- Redeploy backend

**API Not Responding?**
- Check Render logs: `Backend API → Logs`
- Verify GEMINI_API_KEY is set
- Test health endpoint

**Frontend Not Loading?**
- Check Vercel logs
- Verify `VITE_API_URL` is correct
- Clear browser cache

---

## Quick Start Script

```bash
# 1. Prepare backend
cd backend
echo "GEMINI_API_KEY=your_key" > .env

# 2. Test locally
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 4. Deploy via Render & Vercel UI
```

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Get Gemini API key
3. ✅ Create Render account
4. ✅ Create Vercel account
5. ✅ Deploy backend first
6. ✅ Deploy frontend with backend URL
7. ✅ Test production endpoints
8. ✅ Monitor logs & performance

