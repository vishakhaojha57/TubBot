Replace the entire README.md content in project root with this:

# YouTube AI Chatbot

An application that summarizes YouTube videos using AI. Paste a YouTube URL, get an AI-generated summary, and ask questions about the video content.

## Features

- Automatic video summarization using Google Gemini
- Ask questions about video content
- Works with any YouTube video that has captions
- Fast and simple to use
- Free tier available

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Python, FastAPI, Google Gemini API  
**Other:** youtube-transcript-api, FAISS vector search

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.13+
- Google Gemini API key from https://ai.google.dev/aistudio

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your API key
cp .env.example .env

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend: http://localhost:5173

## How It Works

1. User submits YouTube URL
2. Backend extracts video transcript
3. Split transcript into chunks and create embeddings
4. Find relevant chunks using FAISS vector search
5. Send context to Gemini API for summary
6. Display summary to user

## Project Structure

```
YouTubeChatbot/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/summarize.py
│   │   └── services/
│   │       ├── transcript_service.py
│   │       ├── rag_service.py
│   │       ├── llm_service.py
│   │       └── gemini_queue.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

**Health Check**
```
GET /
```

**Summarize Video**
```
POST /api/v1/summarize
Body: {"url": "https://www.youtube.com/watch?v=..."}
```

## Environment Variables

**Backend (.env)**
```
GEMINI_API_KEY=your_api_key_here
```

**Frontend (.env.local for development)**
```
VITE_API_URL=http://localhost:8000/api
```

**Frontend (.env.production for production)**
```
VITE_API_URL=https://your-backend-url/api
```

## Deployment

See DEPLOYMENT_GUIDE.md for complete deployment instructions.

**Quick Summary:**
- Frontend: Deploy to Vercel
- Backend: Deploy to Render
- Add environment variables on each platform
- Update CORS settings after deployment

## Troubleshooting

**Backend won't start**
- Check Python is installed: `python --version`
- Activate virtual environment first
- Install requirements: `pip install -r requirements.txt`

**Cannot reach API (CORS error)**
- Check backend is running
- Verify VITE_API_URL in .env.local
- Check backend CORS settings in main.py

**Invalid API key error**
- Get key from https://ai.google.dev/aistudio
- Add to backend/.env
- Restart backend server

**Video cannot be summarized**
- Video must have captions/subtitles enabled
- Try with a different video
- Check YouTube transcript API is working

## License

MIT License

## Support

- Backend API docs: http://localhost:8000/docs
- FastAPI: https://fastapi.tiangolo.com/
- Google Gemini: https://ai.google.dev/docs