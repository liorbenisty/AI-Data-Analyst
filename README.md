# AI Data Analyst

An AI-powered data analysis agent that lets you upload datasets (CSV/Excel) and ask analytical questions in plain English. The agent writes Python code, executes it in a sandboxed environment, generates visualizations, and explains the results.

## Tech Stack

- **Frontend**: React 18 + Vite + Material UI
- **Backend**: Python + FastAPI
- **Agent**: LangGraph (stateful graph orchestration with ReAct pattern)
- **LLM**: Mistral (via langchain-mistralai)
- **Analysis**: pandas, matplotlib, numpy
- **Sandbox**: Subprocess-based code execution with safety checks and timeout

## Features

- Upload CSV / Excel files and get instant schema analysis
- Ask questions in natural language — the agent writes and executes Python code
- Auto-generated charts via matplotlib (displayed inline)
- Collapsible code blocks with copy-to-clipboard
- Dark / light theme toggle (Apple-inspired design)
- Backend health check with Mistral API key validation
- Retry logic — if the generated code fails, the agent auto-corrects up to 3 times

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Mistral API key ([get one here](https://console.mistral.ai/api-keys/))

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
MISTRAL_API_KEY=your_key_here
MISTRAL_MODEL=mistral-large-latest
```

Start the backend:

```bash
# Windows (recommended — avoids reload issues with Anaconda)
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Or use the start script
.\start.bat

# macOS/Linux
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173) with API requests proxied to the backend at port 8000.

### Verify It Works

1. Open http://localhost:5173
2. You should see a green dot next to "AI Data Analyst" in the header (backend connected)
3. Upload a CSV file
4. Ask a question like "Show me a summary of the dataset"

## Architecture

```
User Question
     │
     ▼
┌─────────────┐
│ inspect_data│  → Loads schema + sample rows
└──────┬──────┘
       ▼
┌──────────────┐
│ generate_code│  → Mistral writes pandas/matplotlib code
└──────┬───────┘
       ▼
┌──────────────┐
│ execute_code │  → Runs in sandboxed subprocess
└──────┬───────┘
       ▼
┌────────────────┐
│ evaluate_result│  → Checks for errors; retries if needed
└──────┬─────────┘
       ▼
┌─────────────────┐
│ generate_response│ → Mistral summarizes findings
└─────────────────┘
```

## Project Structure

```
AI Data Analyst/
├── frontend/              # React + MUI chat interface
│   └── src/
│       ├── components/    # FileUpload, ChatInterface, MessageBubble, CodeBlock, ChartDisplay
│       ├── hooks/         # useChat, useFileUpload, useBackendStatus, useScrollReveal
│       ├── services/      # Axios API client
│       └── theme/         # MUI dark/light theme
│
├── backend/               # Python FastAPI + LangGraph
│   ├── app/
│   │   ├── agent/         # state.py, nodes.py, graph.py
│   │   ├── services/      # executor.py (sandbox), file_handler.py
│   │   └── routes/        # upload.py, chat.py
│   ├── .env               # API keys (not committed)
│   ├── start.bat          # Windows startup script
│   └── requirements.txt
│
└── README.md
```

## API Endpoints

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| GET    | /api/health       | Health check + key status    |
| POST   | /api/upload       | Upload CSV/Excel file        |
| GET    | /api/files        | List all uploaded files       |
| GET    | /api/files/:id    | Get file metadata            |
| POST   | /api/chat         | Send question, get analysis  |
| GET    | /charts/:filename | Serve generated chart images |
