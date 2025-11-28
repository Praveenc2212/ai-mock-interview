# Ollama Integration Guide

## Setup Instructions

### 1. On High-Spec Laptop (Ollama Server)

```bash
# Install Ollama (if not installed)
# Visit: https://ollama.ai

# Pull a model
ollama pull llama3

# Run Ollama server (expose to network)
# Windows:
$env:OLLAMA_HOST="0.0.0.0:11434"
ollama serve

# Linux/Mac:
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

### 2. Find Ollama Server IP Address

**Windows:**
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### 3. Update .env File

Add to your `.env` file:
```bash
# Ollama Configuration (Optional)
OLLAMA_URL=http://192.168.1.100:11434
OLLAMA_MODEL=llama3
```

### 4. Code Changes Required

The following changes have been made to support Ollama:

#### **main.py Changes:**
1. Added `import requests` for HTTP calls to Ollama
2. Added `useOllama`, `ollamaUrl`, `ollamaModel` fields to `ChatRequest` and `FeedbackRequest`
3. Created `call_ollama()` helper function
4. Modified `/api/chat` endpoint to route to Ollama or Gemini based on `useOllama` flag
5. Modified `/api/feedback` endpoint similarly

#### **Frontend Changes Needed:**
Add Ollama configuration UI in `index.html` and update `app.js` to send Ollama parameters.

---

## Testing Ollama Integration

### Test 1: Check Ollama Server
```bash
curl http://192.168.1.100:11434/api/tags
```

### Test 2: Test Generate Endpoint
```bash
curl http://192.168.1.100:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

### Test 3: From Your Application
1. Start your FastAPI server
2. In the UI, enable "Use Ollama"
3. Enter Ollama URL: `http://192.168.1.100:11434`
4. Select model: `llama3`
5. Start interview

---

## Available Ollama Models

- **llama3** - Meta's Llama 3 (recommended, 8B parameters)
- **llama2** - Meta's Llama 2
- **mistral** - Mistral 7B
- **codellama** - Code-specialized Llama
- **phi** - Microsoft's Phi model (smaller, faster)

Pull models with:
```bash
ollama pull <model-name>
```

---

## Troubleshooting

### Issue: "Connection refused"
- Check if Ollama server is running
- Verify firewall allows port 11434
- Ensure both laptops are on same network

### Issue: "Model not found"
- Pull the model first: `ollama pull llama3`
- Check available models: `ollama list`

### Issue: "Slow responses"
- Use smaller model (phi instead of llama3)
- Check Laptop 2's CPU/GPU usage
- Reduce context length

---

## Performance Comparison

| Aspect | Gemini API | Ollama (Local) |
|--------|------------|----------------|
| Cost | Pay per token | Free |
| Speed | 1-3 seconds | 3-10 seconds (depends on hardware) |
| Privacy | Cloud-based | Fully local |
| Internet | Required | Not required (after setup) |
| Models | Latest Gemini | Open-source models |

---

## Next Steps

To complete the integration, you need to:

1. ✅ Backend changes (Done in this branch)
2. ⏳ Frontend UI for Ollama configuration
3. ⏳ Update `app.js` to send Ollama parameters
4. ⏳ Test end-to-end with actual Ollama server

Would you like me to implement the frontend changes?
