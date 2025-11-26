// Basic skeleton for app.js
console.log("App loaded");

const uploadForm = document.getElementById('upload-form');
const uploadSection = document.getElementById('upload-section');
const interviewSection = document.getElementById('interview-section');
const webcam = document.getElementById('webcam');
const chatHistoryEl = document.getElementById('chat-history');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

let state = {
    apiKey: '',
    jobRole: '',
    resumeText: '',
    history: [], // Array of {role: 'user' | 'model', parts: [text]}
    isListening: false,
    isSpeaking: false,
    isProcessing: false
};

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Speech Recognition is not supported in this browser. Please use Chrome.");
}

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;

recognition.onstart = () => {
    state.isListening = true;
    updateStatus('Listening...', 'bg-red-500');
    console.log("🎤 Speech recognition started - speak now!");
};

recognition.onend = () => {
    state.isListening = false;
    console.log("🎤 Speech recognition ended");
    if (state.isSpeaking || state.isProcessing) {
        return;
    }
    // Auto-restart if not speaking/processing
    setTimeout(() => {
        if (!state.isSpeaking && !state.isProcessing && !uploadSection.classList.contains('hidden')) {
            // Don't restart if we are still in upload section, wait for interview start
            return;
        }
        if (!state.isSpeaking && !state.isProcessing && interviewSection.classList.contains('hidden') === false) {
            try {
                recognition.start();
                console.log("🔄 Restarting speech recognition...");
            } catch (e) {
                console.log("Recognition start error:", e);
            }
        }
    }, 1000);
};

recognition.onerror = (event) => {
    console.error("🚨 Speech recognition error:", event.error);
    if (event.error === 'no-speech') {
        console.log("No speech detected. Try speaking louder or closer to the microphone.");
    } else if (event.error === 'not-allowed') {
        alert("Microphone access denied! Please allow microphone access in your browser settings.");
    } else if (event.error === 'audio-capture') {
        alert("No microphone found! Please connect a microphone.");
    }
    updateStatus(`Error: ${event.error}`, 'bg-red-500');
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("✅ User said:", transcript);
    addMessageToUI('You', transcript);
    handleUserResponse(transcript);
};

// Webcam Setup
async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        webcam.srcObject = stream;
        console.log("Webcam access granted");
    } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Please allow camera access to proceed.");
    }
}

function updateStatus(text, colorClass) {
    statusText.textContent = text;
    statusIndicator.className = `w-3 h-3 rounded-full ${colorClass} animate-pulse`;
}

function addMessageToUI(role, text) {
    const div = document.createElement('div');
    div.className = `p-3 rounded-lg ${role === 'You' ? 'bg-blue-600/20 ml-8 border border-blue-500/30' : 'bg-slate-700/50 mr-8 border border-slate-600/30'}`;
    div.innerHTML = `<div class="text-xs text-slate-400 mb-1 font-bold">${role}</div><div class="text-sm">${text}</div>`;
    chatHistoryEl.appendChild(div);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
}

function speak(text) {
    if ('speechSynthesis' in window) {
        state.isSpeaking = true;
        updateStatus('AI Speaking...', 'bg-green-500');

        window.speechSynthesis.cancel(); // Cancel previous

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            state.isSpeaking = false;
            // Start listening after AI finishes speaking
            try {
                recognition.start();
            } catch (e) {
                console.log("Recognition already started");
            }
        };
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("TTS not supported");
        // Fallback or just log
        state.isSpeaking = false;
        try {
            recognition.start();
        } catch (e) {
            console.log("Recognition already started");
        }
    }
}

async function handleUserResponse(message) {
    state.isProcessing = true;
    updateStatus('Thinking...', 'bg-yellow-500');

    // Add user message to history
    state.history.push({ role: 'user', parts: [message] });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                history: state.history,
                message: message,
                context: `Role: ${state.jobRole}\nResume: ${state.resumeText}`,
                apiKey: state.apiKey
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.response;

        // Add AI response to history
        state.history.push({ role: 'model', parts: [aiResponse] });

        addMessageToUI('Interviewer', aiResponse);
        speak(aiResponse);

    } catch (error) {
        console.error("Chat error:", error);
        addMessageToUI('System', `Error: ${error.message}`);
        speak("I'm sorry, I encountered an error. Please try again.");
    } finally {
        state.isProcessing = false;
    }
}

function startInterview() {
    // Initial greeting
    const greeting = `Hello! I see you're applying for the ${state.jobRole} position. I've reviewed your resume. Shall we begin the interview?`;
    state.history.push({ role: 'model', parts: [greeting] });
    addMessageToUI('Interviewer', greeting);
    speak(greeting);
}

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    state.apiKey = document.getElementById('api-key').value;
    state.jobRole = document.getElementById('job-role').value;
    const resumeFile = document.getElementById('resume-file').files[0];

    if (!state.jobRole || !resumeFile) {
        alert("Please provide both a job role and a resume.");
        return;
    }

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('job_role', state.jobRole);

    updateStatus('Uploading...', 'bg-blue-500');

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.status === 'success') {
            state.resumeText = data.extracted_text;

            // Switch view
            uploadSection.classList.add('hidden');
            interviewSection.classList.remove('hidden');

            await setupWebcam();
            startInterview();
        }
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. See console.");
        updateStatus('Upload Failed', 'bg-red-500');
    }
});

function endInterview() {
    state.isListening = false;
    state.isSpeaking = false;
    recognition.stop();
    window.speechSynthesis.cancel();

    updateStatus('Generating Feedback...', 'bg-purple-500');

    // Call feedback API
    fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            history: JSON.stringify(state.history), // Send as string or handle list in backend
            context: `Role: ${state.jobRole}\nResume: ${state.resumeText}`,
            apiKey: state.apiKey
        })
    })
        .then(res => res.json())
        .then(data => {
            const feedback = data.feedback;
            // Display feedback (simple alert or modal for now, or replace chat)
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'p-6 bg-slate-800 rounded-xl border border-purple-500/50 mt-4';
            feedbackDiv.innerHTML = `<h2 class="text-xl font-bold mb-4 text-purple-400">Interview Feedback</h2><div class="prose prose-invert">${marked.parse(feedback)}</div>`;

            // Hide chat and show feedback
            chatHistoryEl.innerHTML = '';
            chatHistoryEl.appendChild(feedbackDiv);
            updateStatus('Interview Complete', 'bg-green-500');
        })
        .catch(err => {
            console.error("Feedback error:", err);
            alert("Error generating feedback");
            updateStatus('Error', 'bg-red-500');
        });
}

// Expose to window for HTML onclick
window.endInterview = endInterview;
