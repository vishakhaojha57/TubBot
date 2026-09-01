# 🤖 YouTube AI Chatbot

> Paste any YouTube video URL, get an AI-powered summary, and chat with the video content — all powered by **Google Gemini** and **RAG (Retrieval-Augmented Generation)**.

---

## 📸 Screenshots

<!-- Replace these with actual screenshots after deployment -->

| Summary View | Chat View |
|:---:|:---:|
| ![Summary Screenshot](https://via.placeholder.com/400x300?text=Summary+View) | ![Chat Screenshot](https://via.placeholder.com/400x300?text=Chat+View) |

---

## ✨ Features

- **🎥 YouTube URL Input** — Paste any YouTube video link to get started
- **📝 AI-Powered Summary** — Get a clean, structured summary of the video in seconds
- **💬 RAG-Powered Chat** — Ask follow-up questions about the video content
- **📌 Timestamped Citations** — Answers include relevant timestamps from the transcript
- **📋 Copy to Clipboard** — One-click copy for summaries and chat messages
- **🔔 Error Toast Notifications** — Floating alerts for errors and success states
- **💀 Skeleton Loading** — Smooth loading placeholders that match content layout
- **🛡️ Error Boundary** — Graceful crash recovery instead of white screens
- **⬆️ Scroll to Top** — Floating button for quick navigation
- **🌙 Dark Mode** — Beautiful dark theme as default
- **📱 Fully Responsive** — Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11 | Runtime |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| Google Gemini | LLM for summaries & chat |
| youtube-transcript-api | Transcript extraction |
| Sentence Transformers | Embedding generation |
| FAISS | Vector similarity search |

---

## 🚀 Local Setup

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Google Gemini API Key** — get one at [Google AI Studio](https://makersuite.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/vishakhaojha/YouTubeChatbot.git
cd YouTubeChatbot
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
echo GOOGLE_API_KEY=your_gemini_api_key_here > .env

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `GOOGLE_API_KEY` | Your Google Gemini API key | ✅ Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://127.0.0.1:8000` |

### Frontend Production (`frontend/.env.production`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Your deployed backend URL on Render |

---

## 🌐 Deployment Guide

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set the **Root Directory** to `frontend`
4. Set the **Framework Preset** to `Vite`
5. Add the environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend-on-render.com`
6. Click **Deploy**

### Backend → Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. Set the **Root Directory** to `backend`
4. Set the **Build Command** to:
   ```
   pip install -r requirements.txt
   ```
5. Set the **Start Command** to:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Add the environment variable:
   - `GOOGLE_API_KEY` = your Gemini API key
7. Click **Deploy**

> ⚠️ **Important:** After deploying, update the CORS origins in `backend/app/main.py` with your actual Vercel frontend URL, and update `frontend/.env.production` with your actual Render backend URL.

---

## 📂 Project Structure

```
YouTubeChatbot/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── summarize.py          # /summarize endpoint
│   │   │   └── chat.py               # /chat endpoint
│   │   ├── services/
│   │   │   ├── transcript_service.py # YouTube transcript extraction
│   │   │   └── llm_service.py        # Gemini LLM integration
│   │   ├── rag/
│   │   │   ├── chunking.py           # Transcript chunking
│   │   │   ├── embeddings.py         # Sentence-transformer embeddings
│   │   │   ├── vector_store.py       # FAISS vector store
│   │   │   └── retrieval.py          # Semantic retrieval
│   │   └── main.py                   # FastAPI app + CORS
│   ├── .env                          # API keys (not in git)
│   ├── requirements.txt
│   ├── Procfile                      # Render deployment
│   └── runtime.txt                   # Python version
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UrlInput.jsx          # YouTube URL input
│   │   │   ├── SummaryCard.jsx       # AI summary display
│   │   │   ├── Loader.jsx            # Loading spinner
│   │   │   ├── ChatBox.jsx           # Chat message container
│   │   │   ├── MessageBubble.jsx     # Individual chat message
│   │   │   ├── CitationCard.jsx      # Timestamp citations
│   │   │   ├── ChatInput.jsx         # Chat input field
│   │   │   ├── ErrorToast.jsx        # Toast notifications
│   │   │   ├── ErrorBoundary.jsx     # Crash recovery
│   │   │   ├── Skeleton.jsx          # Loading placeholder
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   ├── CopyButton.jsx        # Copy to clipboard
│   │   │   └── ScrollToTop.jsx       # Scroll to top button
│   │   ├── pages/
│   │   │   └── Home.jsx              # Main page
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── .env                          # Dev environment
│   ├── .env.production               # Production environment
│   ├── vercel.json                   # Vercel deployment config
│   └── index.html                    # HTML template + SEO
│
└── README.md
```

---

## 🧭 Development Phases

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | YouTube URL → AI Summary | ✅ Complete |
| **Phase 2** | RAG Pipeline (chunking, embeddings, FAISS) | ✅ Complete |
| **Phase 3** | Chat UI with citations & timestamps | ✅ Complete |
| **Phase 4** | UI Polish, Error Handling, Deployment | ✅ Complete |
| **Phase 5** | Future improvements (see below) | 🔮 Planned |

---

## 🔮 Future Improvements (Phase 5 Ideas)

- **🔑 Authentication** — User accounts with saved chat history
- **📊 Multi-Video Comparison** — Compare summaries across multiple videos
- **🌍 Multi-Language Support** — Summarize and chat in different languages
- **📤 Export Options** — Download summaries as PDF or Markdown
- **🎙️ Voice Input** — Ask questions using your microphone
- **📌 Bookmarks** — Save favourite video summaries for later
- **🔍 Semantic Search** — Search across all previously summarised videos
- **📈 Analytics Dashboard** — Track most-asked questions per video
- **🧩 Browser Extension** — Summarise directly from YouTube pages
- **⚡ Streaming Responses** — Show AI answers word-by-word as they generate

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, FastAPI, and Google Gemini
</p>
