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
    statusIndicator.className = `w-4 h-4 rounded-full ${colorClass} shadow-lg`;
}

function addMessageToUI(role, text) {
    const div = document.createElement('div');

    // Beautiful unique colors for User vs AI
    if (role === 'You') {
        // User: Gold gradient with glow
        div.className = 'chat-message p-4 rounded-xl ml-8 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/20';
        div.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div class="text-xs font-bold text-yellow-300">${role}</div>
            </div>
            <div class="text-sm text-white">${text}</div>
        `;
    } else {
        // AI: Dark Blue gradient with glow
        div.className = 'chat-message p-4 rounded-xl mr-8 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-2 border-blue-400/40 shadow-lg shadow-blue-500/20';
        div.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <div class="text-xs font-bold text-blue-300">${role}</div>
            </div>
            <div class="text-sm text-white">${text}</div>
        `;
    }

    chatHistoryEl.appendChild(div);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

    // Update message count
    const messageCount = document.getElementById('message-count');
    if (messageCount) {
        const count = chatHistoryEl.querySelectorAll('.chat-message').length;
        messageCount.textContent = count;
    }
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
            history: JSON.stringify(state.history),
            context: `Role: ${state.jobRole}\nResume: ${state.resumeText}`,
            apiKey: state.apiKey
        })
    })
        .then(res => res.json())
        .then(data => {
            const feedback = data.feedback;

            // Hide interview section
            interviewSection.classList.add('hidden');

            // Create beautiful full-page feedback display
            const feedbackSection = document.createElement('div');
            feedbackSection.id = 'feedback-section';
            feedbackSection.className = 'glass rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl';
            feedbackSection.innerHTML = `
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="inline-block p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-4">
                        <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h1 class="text-4xl sm:text-5xl font-bold mb-3 gradient-text">Interview Complete!</h1>
                    <p class="text-slate-300 text-lg">Here's your detailed performance analysis</p>
                </div>

                <!-- Feedback Content -->
                <div class="space-y-6">
                    <!-- Score Card -->
                    <div class="glass-strong rounded-2xl p-8 text-center">
                        <h2 class="text-2xl font-bold text-white mb-4">Your Score</h2>
                        <div class="inline-block">
                            <div class="relative w-32 h-32">
                                <svg class="transform -rotate-90 w-32 h-32">
                                    <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none" />
                                    <circle cx="64" cy="64" r="56" stroke="url(#gradient)" stroke-width="8" fill="none" 
                                        stroke-dasharray="351.86" stroke-dashoffset="35.186" stroke-linecap="round" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-4xl font-bold gradient-text">9/10</span>
                                </div>
                            </div>
                        </div>
                        <p class="text-slate-300 mt-4">Excellent Performance!</p>
                    </div>

                    <!-- Detailed Feedback -->
                    <div class="glass-strong rounded-2xl p-6">
                        <div class="prose prose-invert max-w-none">
                            <div class="feedback-content text-white">
                                ${marked.parse(feedback)}
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onclick="location.reload()" 
                            class="btn-primary w-full text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            🔄 Start New Interview
                        </button>
                        <button onclick="window.print()" 
                            class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            📄 Print Feedback
                        </button>
                    </div>
                </div>

                <!-- Custom Styles for Feedback Content -->
                <style>
                    .feedback-content h1, .feedback-content h2 {
                        color: #a78bfa;
                        font-weight: bold;
                        margin-top: 1.5rem;
                        margin-bottom: 1rem;
                    }
                    .feedback-content h3 {
                        color: #c4b5fd;
                        font-weight: 600;
                        margin-top: 1rem;
                        margin-bottom: 0.5rem;
                    }
                    .feedback-content ul, .feedback-content ol {
                        margin-left: 1.5rem;
                        margin-top: 0.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .feedback-content li {
                        margin-bottom: 0.5rem;
                        line-height: 1.6;
                    }
                    .feedback-content strong {
                        color: #fbbf24;
                    }
                    .feedback-content p {
                        margin-bottom: 1rem;
                        line-height: 1.8;
                    }
                </style>
            `;

            // Add to page
            document.getElementById('app').appendChild(feedbackSection);
        })
        .catch(err => {
            console.error("Feedback error:", err);
            alert("Error generating feedback. Please try again.");
            updateStatus('Error', 'bg-red-500');
        });
}

// Expose to window for HTML onclick
window.endInterview = endInterview;
