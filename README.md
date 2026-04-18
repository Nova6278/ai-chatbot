# 🤖 AI Chatbot – AWS Bedrock + React

A production-ready AI chatbot powered by **AWS Bedrock (Claude 3)** with a React frontend and FastAPI backend.

---

## 📁 Project Structure

```
chatbot/
├── backend/
│   ├── main.py           ← FastAPI backend
│   ├── requirements.txt  ← Python dependencies
│   └── .env              ← AWS credentials (DO NOT COMMIT)
├── frontend/
│   ├── src/
│   │   ├── App.jsx       ← Main chatbot UI
│   │   ├── main.jsx      ← React entry point
│   │   └── index.css     ← Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env              ← Frontend env vars
└── README.md
```

---

## 🔑 Step 1: Get Your AWS Keys

1. Go to **AWS Console** → https://console.aws.amazon.com
2. Navigate to **IAM** → **Users** → Your user → **Security credentials**
3. Click **Create access key** → Choose "Local code"
4. Copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Enable AWS Bedrock Claude 3:
1. Go to **AWS Console** → **Amazon Bedrock**
2. In left sidebar: **Model access** → **Manage model access**
3. Check **Anthropic Claude 3 Haiku** → **Save changes**
4. Wait ~2 minutes for approval

> ✅ You already have Bedrock access — just enable Claude 3 Haiku model!

---

## ⚙️ Step 2: Configure Backend

Edit `backend/.env`:

```env
AWS_ACCESS_KEY_ID=AKIA...your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
CHATBOT_SYSTEM_PROMPT=You are a helpful AI assistant for our company website...
```

---

## 🚀 Step 3: Run the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# OR: venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000
📖 API docs at: http://localhost:8000/docs

---

## 🎨 Step 4: Run the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend running at: http://localhost:3000

---

## 🐳 Docker (Optional — Skip if time-pressed)

```bash
# From project root (not needed for submission)
docker-compose up
```

---

## 🧪 Test the API directly

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## 📦 Features

- ✅ **Real-time streaming** responses
- ✅ **AWS Bedrock** (Claude 3 Haiku) powered
- ✅ **Conversation history** preserved
- ✅ **Suggested questions** for new users
- ✅ **Beautiful dark UI** with glassmorphism
- ✅ **Error handling** + retry support
- ✅ **Customizable system prompt** via .env

---

## 🗂️ Files to NOT commit

Add to `.gitignore`:
```
backend/.env
frontend/.env
backend/venv/
node_modules/
__pycache__/
```

---

## ✅ Submission Checklist

- [ ] Backend running and tested
- [ ] Frontend chatbot works
- [ ] Streaming responses working
- [ ] Custom system prompt configured
- [ ] README complete
- [ ] Screenshots taken for submission
