# 🤖 Nova — AI Chatbot powered by AWS Bedrock

> A real-time streaming AI chatbot built with FastAPI and React, powered by Meta Llama 3 via AWS Bedrock. Features server-sent events for live token streaming, suggested prompts, and a clean glassmorphism UI.

**Live Demo:** [ai-chatbot-nine-gold-55.vercel.app](https://ai-chatbot-nine-gold-55.vercel.app) 
**GitHub:** [github.com/Nova6278/ai-chatbot](https://github.com/Nova6278/ai-chatbot)

⚠️ Note: Backend is hosted locally via tunnel.
If the live demo is unavailable, please check back 
after a few minutes or contact me at rajdeepoff78@gmail.com

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Local Setup Guide](#local-setup-guide)
- [Environment Variables](#environment-variables)
- [How Streaming Works](#how-streaming-works)

---

## ✨ Features

- **Real-time Streaming** — Responses stream token-by-token via Server-Sent Events (SSE), just like ChatGPT
- **AWS Bedrock Integration** — Powered by Meta Llama 3 8B running on AWS Bedrock (no OpenAI dependency)
- **Multi-turn Conversations** — Full conversation history sent with every request for contextual replies
- **Suggested Questions** — Quick-start prompts shown on first load
- **Typing Indicator** — Animated dots while waiting for the first token
- **Live Cursor** — Blinking cursor during streaming to indicate active generation
- **Clear Chat** — Reset conversation with one click
- **Customizable Persona** — Bot personality configurable via environment variable

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| AI Model | Meta Llama 3 8B Instruct (AWS Bedrock) |
| Streaming | Server-Sent Events (SSE) |
| AWS SDK | boto3 |
| Env Config | python-dotenv |

---

## 🏗 Architecture

```
┌──────────────────────┐         ┌─────────────────────┐
│   React Frontend     │ ──SSE──▶│   FastAPI Backend    │
│   (Vite dev server)  │◀────────│   Port 8000          │
└──────────────────────┘         └──────────┬──────────┘
                                             │  boto3
                                             ▼
                                  ┌─────────────────────┐
                                  │    AWS Bedrock       │
                                  │  Meta Llama 3 8B     │
                                  └─────────────────────┘
```

**Streaming Flow:**
1. User sends message → Frontend POSTs full conversation history to `/chat/stream`
2. Backend formats prompt in Llama 3 chat template and calls Bedrock streaming API
3. Bedrock streams tokens back → FastAPI yields SSE chunks
4. Frontend reads the stream, appends tokens in real-time to the UI
5. On `[DONE]` signal → stream closes, final message saved to state

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check, confirms API is running |
| GET | `/health` | Returns status + active model ID |
| POST | `/chat` | Non-streaming chat (returns full response) |
| POST | `/chat/stream` | **Streaming chat via SSE** (main endpoint) |
| GET | `/models` | Lists available Bedrock models |

### Request format for `/chat` and `/chat/stream`

```json
{
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi! How can I help?" },
    { "role": "user", "content": "What is AWS Bedrock?" }
  ],
  "stream": true
}
```

### SSE Response format

```
data: {"text": "AWS"}
data: {"text": " Bedrock"}
data: {"text": " is"}
...
data: [DONE]
```

---

## 📁 Project Structure

```
ai-chatbot/
├── backend/
│   ├── main.py           ← FastAPI app (all routes + Bedrock integration)
│   ├── requirements.txt  ← Python dependencies
│   └── .env              ← AWS credentials (not committed)
└── frontend/
    ├── src/
    │   ├── App.jsx       ← Full chatbot UI with streaming
    │   ├── main.jsx      ← React entry point
    │   └── index.css     ← Tailwind base styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env              ← Frontend API URL config
```

---

## 💻 Local Setup Guide

### Prerequisites

- Python 3.9+
- Node.js 18+
- An AWS account with Bedrock access
- AWS IAM credentials (Access Key + Secret Key)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Nova6278/ai-chatbot.git
cd ai-chatbot
```

---

### Step 2 — Enable AWS Bedrock Model Access

1. Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. Search for **Amazon Bedrock** in the top bar
3. Click **Model access** in the left sidebar
4. Click **Manage model access**
5. Enable **Meta Llama 3 8B Instruct**
6. Click **Save changes** (takes ~1 minute to activate)

---

### Step 3 — Get AWS Credentials

1. Go to **IAM** → **Users** → your user → **Security credentials**
2. Click **Create access key** → select **Local code**
3. Copy both the **Access Key ID** and **Secret Access Key**

---

### Step 4 — Configure Backend

```bash
cd backend
```

Create a `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

BEDROCK_MODEL_ID=meta.llama3-8b-instruct-v1:0

CHATBOT_SYSTEM_PROMPT=You are a helpful, friendly, and intelligent AI assistant. You provide clear, accurate, and concise responses. Always be polite and professional.
```

---

### Step 5 — Start the Backend

```bash
# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

✅ You should see:
```
INFO: Uvicorn running on http://127.0.0.1:8000
```

Test it: open [http://localhost:8000/health](http://localhost:8000/health) in your browser.

---

### Step 6 — Configure Frontend

```bash
cd ../frontend
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

---

### Step 7 — Start the Frontend

```bash
npm install
npm run dev
```

✅ Open [http://localhost:5173](http://localhost:5173) — start chatting!

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | ✅ | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS IAM secret key |
| `AWS_REGION` | ✅ | AWS region (e.g. `us-east-1`) |
| `BEDROCK_MODEL_ID` | ✅ | Bedrock model ID (default: Llama 3 8B) |
| `CHATBOT_SYSTEM_PROMPT` | Optional | Custom bot personality/instructions |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default: `http://localhost:8000`) |

---

## ⚙️ How Streaming Works

The backend uses FastAPI's `StreamingResponse` with `text/event-stream` media type. When Bedrock streams tokens back via `invoke_model_with_response_stream`, each chunk is immediately yielded to the frontend as an SSE event:

```python
async def generate():
    response = bedrock.invoke_model_with_response_stream(...)
    for event in response["body"]:
        chunk_data = json.loads(event["chunk"]["bytes"])
        text = chunk_data.get("generation", "")
        if text:
            yield f"data: {json.dumps({'text': text})}\n\n"
    yield "data: [DONE]\n\n"

return StreamingResponse(generate(), media_type="text/event-stream")
```

The frontend reads the stream using the `ReadableStream` API and appends tokens to the UI in real time, with a blinking cursor to indicate active generation.

---

## 🔄 Available Models

You can switch the model in `backend/.env`:

| Model ID | Name | Notes |
|----------|------|-------|
| `meta.llama3-8b-instruct-v1:0` | Meta Llama 3 8B | Default — fast, free tier |
| `meta.llama3-70b-instruct-v1:0` | Meta Llama 3 70B | More capable, slower |
| `anthropic.claude-3-haiku-20240307-v1:0` | Claude 3 Haiku | Requires Anthropic access |

---

## 🚨 Common Errors

| Error | Fix |
|-------|-----|
| `Could not connect to backend` | Make sure uvicorn is running on port 8000 |
| `AccessDeniedException` | Enable the model in Bedrock Model Access |
| `InvalidClientTokenId` | Double-check AWS keys in `backend/.env` |
| `ValidationException` | Wrong model ID format — check the table above |

---

## 👤 Author

**Rajdeep** — [@Nova6278](https://github.com/Nova6278)
