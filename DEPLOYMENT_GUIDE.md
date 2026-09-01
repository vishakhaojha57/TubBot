# Complete Deployment Guide - YouTube AI Chatbot

## 📋 Table of Contents
1. [Quick Start (5 min)](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Monitoring](#monitoring)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- GitHub account with your code pushed
- Gemini API key (get it free from https://ai.google.dev/aistudio)
- Render account (https://render.com)
- Vercel account (https://vercel.com)

### Deploy in 3 Steps

**Step 1: Deploy Backend (Render)**
```bash
1. https://render.com → Create Web Service
2. Connect GitHub repo
3. Set Runtime: Python 3
4. Set Start Command:
   uvicorn app.main:app --host 0.0.0.0 --port 8000
5. Add Secret: GEMINI_API_KEY = [your key]
6. Deploy
7. Copy Backend URL from Render
```

**Step 2: Deploy Frontend (Vercel)**
```bash
1. https://vercel.com/new
2. Import same GitHub repo
3. Select "Vite" as framework
4. Add Env Var: VITE_API_URL = [Render Backend URL]/api
5. Deploy
6. Your app is live! ✅
```

**Step 3: Update Backend CORS**
```python
# In backend/app/main.py, add your Vercel URL:
allow_origins=[
    "https://your-app.vercel.app",  # Add this line
]
# Commit and redeploy
```

---

## Detailed Setup

### Option A: Vercel + Render (Recommended for Beginners)

#### Backend on Render

1. **Sign up**: https://render.com
2. **Create Web Service**:
   - Connect GitHub repository
   - Branch: main
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
3. **Environment**:
   - Python version: 3.13
4. **Environment Variables** (Add via Dashboard):
   ```
   GEMINI_API_KEY = sk-proj-...
   PYTHONUNBUFFERED = true
   ```
5. **Deploy**: Click Deploy button, wait 2-3 minutes

**Result**: Backend running at `https://your-backend.onrender.com`

#### Frontend on Vercel

1. **Sign up**: https://vercel.com
2. **Import Project**:
   - GitHub repo → Import
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   ```
   VITE_API_URL = https://your-backend.onrender.com/api
   ```
4. **Deploy**: Click Deploy

**Result**: Frontend running at `https://your-app.vercel.app`

---

### Option B: Docker (For Advanced Users)

#### Local Testing with Docker Compose

```bash
# 1. Create .env file
echo "GEMINI_API_KEY=your_key" > .env

# 2. Start services
docker-compose up -d

# 3. Check services
docker-compose ps

# 4. View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# 5. Stop services
docker-compose down
```

#### Deploy to Google Cloud Run

```bash
# 1. Build and push image
docker build -t gcr.io/your-project/youtube-chatbot:latest .
docker push gcr.io/your-project/youtube-chatbot:latest

# 2. Deploy to Cloud Run
gcloud run deploy youtube-chatbot \
  --image gcr.io/your-project/youtube-chatbot:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=your_key
```

---

## CI/CD Pipeline

### GitHub Actions (Auto-Deploy on Push)

#### Render Auto-Deploy
1. Go to Render dashboard
2. Click Web Service → Settings
3. Scroll to "Deploy Hook"
4. Copy the webhook URL
5. In GitHub: Settings → Webhooks → Add webhook
6. Paste the Render URL
7. Now every push to main triggers automatic redeploy

#### Vercel Auto-Deploy
- Vercel integrates automatically with GitHub
- Every push to main auto-deploys

---

## Production Checklist

### Before Going Live

```
Security:
- [ ] GEMINI_API_KEY never committed to GitHub
- [ ] .env file in .gitignore ✓
- [ ] No API keys in environment-specific files

Configuration:
- [ ] Backend CORS includes production frontend URL
- [ ] Frontend VITE_API_URL points to production backend
- [ ] runtime.txt specifies Python 3.13

Testing:
- [ ] Backend health check: https://your-backend.onrender.com/
- [ ] API docs accessible: https://your-backend.onrender.com/docs
- [ ] Frontend loads: https://your-app.vercel.app
- [ ] Test summarize endpoint with sample YouTube URL
- [ ] Check browser console for CORS/errors

Monitoring:
- [ ] Render logs accessible
- [ ] Vercel logs accessible
- [ ] Set up error notifications (email/Slack)
```

---

## Environment Variables Reference

### Backend (Render Secrets)
```
GEMINI_API_KEY=sk-proj-xxxxx
PYTHONUNBUFFERED=1
```

### Frontend (Vercel Environment)
```
# Production
VITE_API_URL=https://your-backend.onrender.com/api

# Development (local)
VITE_API_URL=http://localhost:8000/api
```

---

## Monitoring & Debugging

### Check Backend Status

```bash
# Health check
curl https://your-backend.onrender.com/

# Expected response:
# {"status":"ok","message":"TubBot API is running 🚀"}

# API docs
https://your-backend.onrender.com/docs
```

### View Logs

**Render Logs**:
1. Render Dashboard → Select Web Service
2. Click "Logs" tab
3. Scroll to see errors in real-time

**Vercel Logs**:
1. Vercel Dashboard → Select Project
2. Click "Deployments"
3. Select latest deployment
4. Click "Runtime Logs" or "Build Logs"

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS error in browser | Add frontend URL to backend `allow_origins` |
| "Cannot reach API" | Check Render logs, verify GEMINI_API_KEY is set |
| Blank frontend | Check Vercel logs, verify VITE_API_URL |
| 500 error on summarize | Check GEMINI_API_KEY is valid, check Render logs |
| Slow response | Render free tier takes ~50s first request, normal |

---

## Scaling & Performance

### When to Upgrade

| Metric | Free Tier Limit | Solution |
|--------|-----------------|----------|
| Uptime | 99% | Pay tier: 99.95% SLA |
| Memory | 512MB | Render: Upgrade to 2GB |
| Requests | Unlimited | Render: Auto-scales |
| Cold Starts | ~50s first request | Pay tier: Always-on |

### Performance Tips

1. **Backend**: Enable gzip compression in Render settings
2. **Frontend**: Vercel automatically optimizes with edge caching
3. **API**: Use LRU cache for repeated requests
4. **Images**: Use HTTPS CDN for any media

---

## Cost Breakdown

| Component | Free | Starter | Pro |
|-----------|------|---------|-----|
| Render Backend | 750 hrs/mo | $7/mo | $12/mo |
| Vercel Frontend | ✅ Unlimited | $20/mo | $150/mo |
| Gemini API | 500 req/day free | Pay as you go | $1.50 per 1M tokens |
| **Total** | **$0** | **~$20** | **$50+** |

---

## Disaster Recovery

### Backup Strategy

```bash
# Local backup
git clone https://github.com/yourusername/YouTubeChatbot.git backup/

# Database backups (if you add persistence)
# Render: Download backups from dashboard
# Firebase/Supabase: Automatic daily backups
```

### Rollback

```bash
# On Vercel: Click deployment → Rollback
# On Render: Click deployment history → Redeploy previous version
```

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Get Gemini API key
3. ✅ Create accounts on Render & Vercel
4. ✅ Deploy backend first
5. ✅ Deploy frontend with correct API URL
6. ✅ Update CORS on backend
7. ✅ Test production URLs
8. ✅ Set up monitoring/alerts
9. ✅ Share with users! 🎉

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev
- **Gemini API Docs**: https://ai.google.dev/docs

---

## Questions?

Check DEPLOY_QUICK_START.md for a concise checklist or refer to specific sections above.
