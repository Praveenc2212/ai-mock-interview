# AI Mock Interview System

An AI-powered mock interview platform that conducts voice-based technical interviews using Google Gemini AI. The system analyzes your resume, asks relevant questions based on the job role, and provides detailed feedback on your performance.

## Features

- 📄 **Resume Analysis**: Upload your PDF resume for personalized questions
- 🎤 **Voice Interaction**: Speak your answers naturally using speech recognition
- 🤖 **AI Interviewer**: Powered by Google Gemini for intelligent questioning
- 📹 **Live Webcam**: Professional interview experience with video feed
- 📊 **Detailed Feedback**: Get scores and improvement suggestions after the interview
- 🎨 **Modern UI**: Beautiful glassmorphism design with TailwindCSS

## Tech Stack

- **Backend**: Python, FastAPI
- **Frontend**: HTML, JavaScript, TailwindCSS
- **AI**: Google Gemini API
- **Speech**: Web Speech API (Recognition & Synthesis)
- **PDF Processing**: pypdf

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-mock-interview.git
   cd ai-mock-interview
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   Get your API key from: https://aistudio.google.com/app/apikey

4. **Run the application**
   ```bash
   python main.py
   ```

5. **Open in browser**
   
   Navigate to: http://localhost:8000/static/index.html

## Usage

1. **Enter API Key** (optional if set in .env)
2. **Provide Job Role** - Describe the position you're applying for
3. **Upload Resume** - PDF format only
4. **Start Interview** - Allow microphone and camera permissions
5. **Answer Questions** - Speak naturally when the AI asks questions
6. **Get Feedback** - Click "End Interview" to receive your score and suggestions

## Browser Compatibility

- **Recommended**: Google Chrome (best speech recognition support)
- **Required**: Microphone and camera permissions

## Project Structure

```
ai-mock-interview/
├── main.py              # FastAPI backend server
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not in git)
├── static/
│   ├── index.html      # Frontend UI
│   └── app.js          # Client-side logic
└── README.md           # This file
```

## API Endpoints

- `GET /` - API health check
- `POST /api/upload` - Upload resume and job role
- `POST /api/chat` - Send user response, get AI question
- `POST /api/feedback` - Get interview feedback and score

## Security Notes

⚠️ **Never commit your `.env` file or API keys to GitHub!**

The `.gitignore` file is configured to exclude sensitive files.

## Deployment

Ready to deploy your AI Mock Interview System? Check out our comprehensive deployment guide:

📚 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete guide for deploying to:
- **Render** (Recommended - easiest setup, 750 free hours/month)
- **Railway** (Great UX, $5 free credit/month)
- **Fly.io** (Advanced control, 3 free VMs)

All platforms offer free tiers perfect for this application!


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Google Gemini AI for powering the interview intelligence
- FastAPI for the robust backend framework
- Web Speech API for voice interaction capabilities
