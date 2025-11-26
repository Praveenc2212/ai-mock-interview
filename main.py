import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from pypdf import PdfReader
import io
from typing import Optional
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure Gemini
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

from typing import Optional, Union, List

class ChatRequest(BaseModel):
    history: Union[str, List[dict]]
    message: str
    context: str
    apiKey: Optional[str] = None

class FeedbackRequest(BaseModel):
    history: str
    context: str
    apiKey: Optional[str] = None

@app.get("/")
async def read_root():
    return {"message": "AI Mock Interview System API"}

@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...), job_role: str = Form(...)):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        content = await file.read()
        pdf = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
            
        return {"status": "success", "text_length": len(text), "extracted_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        print("=" * 80)
        print("🎤 CHAT REQUEST RECEIVED")
        print(f"📝 User Message: {request.message}")
        print(f"📚 History Length: {len(request.history) if isinstance(request.history, list) else 'N/A'}")
        print("=" * 80)
        
        if request.apiKey:
            genai.configure(api_key=request.apiKey)
        elif os.getenv("GEMINI_API_KEY"):
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        else:
            raise HTTPException(status_code=401, detail="API Key not provided")

        # Format history if it's a list
        history_text = ""
        if isinstance(request.history, list):
            for msg in request.history:
                role = msg.get("role", "unknown")
                content = msg.get("parts", [""])[0] if isinstance(msg.get("parts"), list) else msg.get("content", "")
                history_text += f"{role}: {content}\n"
        else:
            history_text = request.history

        # Construct the prompt
        system_prompt = f"""You are an expert technical interviewer. 
        Context: The candidate has applied for the following role: {request.context}
        
        Your goal is to conduct a professional interview. 
        1. Ask relevant technical and behavioral questions based on the role and their resume (if provided in context).
        2. Ask only ONE question at a time.
        3. Keep your responses concise and conversational (suitable for voice output).
        4. If the candidate's answer is too brief, ask for elaboration.
        
        Current Conversation History:
        {history_text}
        
        User's latest response: {request.message}
        
        Respond with ONLY your next question or comment.
        """
        
        print(f"🔑 Using API Key: {request.apiKey[:5]}..." if request.apiKey else "🔑 Using Env API Key")
        print(f"📏 Prompt length: {len(system_prompt)}")
        
        # Try multiple model names as fallback - MUST include models/ prefix
        model_names = [
            'models/gemini-flash-latest',
            'models/gemini-pro-latest',
            'models/gemini-2.0-flash-lite-001',
            'models/gemini-2.5-flash-lite'
        ]
        
        response = None
        last_error = None
        
        for model_name in model_names:
            try:
                print(f"🤖 Trying model: {model_name}")
                model = genai.GenerativeModel(model_name)
                print("⏳ Generating AI response...")
                response = model.generate_content(system_prompt)
                print(f"✅ AI Response Generated with {model_name}: {response.text[:100]}...")
                break  # Success! Exit loop
            except Exception as e:
                last_error = e
                print(f"❌ Model {model_name} failed: {str(e)[:100]}")
                continue  # Try next model
        
        if response is None:
            raise Exception(f"All models failed. Last error: {last_error}")
        
        return {"response": response.text}
    except Exception as e:
        print(f"CRITICAL ERROR in chat: {e}")
        import traceback
        with open("server_error.log", "a") as f:
            f.write(f"Error in chat: {str(e)}\n")
            traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/feedback")
async def generate_feedback(request: FeedbackRequest):
    try:
        if request.apiKey:
            genai.configure(api_key=request.apiKey)
        elif os.getenv("GEMINI_API_KEY"):
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        else:
            raise HTTPException(status_code=401, detail="API Key not provided")

        prompt = f"""You are an expert interview coach. Review the following interview transcript and provide detailed feedback.
        
        Context: {request.context}
        
        Transcript:
        {request.history}
        
        Please provide:
        1. A score out of 10.
        2. Key strengths.
        3. Areas for improvement.
        4. Specific suggestions for better answers.
        
        Format the output as Markdown.
        """
        
        model = genai.GenerativeModel('models/gemini-flash-latest')
        response = model.generate_content(prompt)
        
        return {"feedback": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
