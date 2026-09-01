# Quick Deployment Checklist

## 🎯 Recommended Stack: Vercel (Frontend) + Render (Backend)

### Pre-Deployment (Do This First)
- [ ] Push project to GitHub
- [ ] Get Gemini API key from Google AI Studio
- [ ] Create Render account (render.com)
- [ ] Create Vercel account (vercel.com)
- [ ] Verify `.env` is in `.gitignore` ✓
- [ ] Verify `runtime.txt` has Python version ✓

---

## 🚀 Deployment in 10 Minutes

### Step 1: Deploy Backend (5 mins)
```
1. Go to render.com/dashboard
2. Click "New +" → Web Service
3. Connect your GitHub repo
4. Configuration:
   - Name: youtube-chatbot-api
   - Runtime: Python 3
   - Build: pip install -r requirements.txt
   - Start: uvicorn app.main:app --host 0.0.0.0 --port 8000
5. Add Environment Variable:
   - GEMINI_API_KEY = [your key here]
6. Click Deploy
7. ⏳ Wait 2-3 minutes, copy the URL
```

### Step 2: Deploy Frontend (5 mins)
```
1. Go to vercel.com/new
2. Import your GitHub repo
3. Set:
   - Framework: Vite
   - Build: npm run build
   - Output: dist
4. Add Environment Variable:
   - VITE_API_URL = [your Render backend URL]/api
5. Click Deploy
6. ✅ Done! Your app is live
```

### Step 3: Update CORS (1 min)
```python
# backend/app/main.py
# Add your Vercel frontend URL to allow_origins
allow_origins=[
    "http://localhost:5173",
    "https://your-app.vercel.app",  # Add this
]
# Redeploy backend
```

---

## 🔑 Environment Variables Needed

| Where | Variable | Value |
|-------|----------|-------|
| Render Secrets | `GEMINI_API_KEY` | Your Google AI API key |
| Vercel Env | `VITE_API_URL` | `https://your-backend.onrender.com/api` |

---

## ✅ Final Checks

- [ ] Backend health check works: `https://your-backend.onrender.com/`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] API docs accessible: `https://your-backend.onrender.com/docs`
- [ ] No CORS errors in browser console
- [ ] Test with a YouTube URL in production

---

## 📊 Cost Breakdown

| Service | Monthly Cost |
|---------|--------------|
| Render Backend (free tier) | **$0** |
| Vercel Frontend (free tier) | **$0** |
| Gemini API (free tier) | **$0** |
| **Total** | **$0/month** ✨ |

---

## 🐛 Troubleshooting

**"CORS error" →** Update backend CORS, redeploy

**"API not responding" →** Check Render logs, verify GEMINI_API_KEY

**"Frontend blank" →** Check Vercel logs, verify VITE_API_URL

**"API times out" →** Render free tier may need 50s to wake up, click the link again

---

## 📚 Links to Keep

- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Gemini API: https://ai.google.dev
- Render Logs: https://dashboard.render.com → Select service → Logs

