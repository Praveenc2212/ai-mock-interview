# Ollama Configuration for AI Mock Interview System

## Your Ollama Server Details

**IP Address:** 192.168.137.135  
**Port:** 11434  
**Full URL:** http://192.168.137.135:11434  
**Available Model:** phi4:latest

## Testing Your Setup

### Test 1: Check Server (✅ PASSED)
```powershell
curl http://192.168.137.135:11434/api/tags
```

### Test 2: Generate Response
```powershell
curl http://192.168.137.135:11434/api/generate -Method Post -Body '{"model":"phi4","prompt":"Hello, how are you?","stream":false}' -ContentType "application/json"
```

## Environment Variables

Add to your `.env` file:
```bash
# Ollama Configuration
OLLAMA_URL=http://192.168.137.135:11434
OLLAMA_MODEL=phi4
```

## Code Integration

The backend needs these changes:

### 1. Add to ChatRequest in main.py:
```python
useOllama: Optional[bool] = False
ollamaUrl: Optional[str] = "http://192.168.137.135:11434"
ollamaModel: Optional[str] = "phi4"
```

### 2. Add Ollama helper function:
```python
import requests

async def call_ollama(prompt: str, ollama_url: str, model: str = "phi4") -> str:
    response = requests.post(
        f"{ollama_url}/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=60
    )
    return response.json()["response"]
```

### 3. Update chat endpoint:
```python
if request.useOllama:
    ai_response = await call_ollama(system_prompt, request.ollamaUrl, request.ollamaModel)
    return {"response": ai_response}
else:
    # Use Gemini (existing code)
```

## Frontend Changes Needed

Add to the upload form in `index.html`:

```html
<!-- Ollama Configuration -->
<div class="space-y-2">
    <label class="flex items-center gap-2">
        <input type="checkbox" id="use-ollama" class="rounded">
        <span>Use Local Ollama AI</span>
    </label>
    <input type="text" id="ollama-url" 
           value="http://192.168.137.135:11434"
           placeholder="Ollama URL"
           class="input-field w-full">
    <input type="text" id="ollama-model" 
           value="phi4"
           placeholder="Model name"
           class="input-field w-full">
</div>
```

Update `app.js` to send these values in the chat request.

## Ready to Implement?

Would you like me to create the complete modified files?
