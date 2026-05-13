const GEMINI_API_KEY = "AIzaSyAHXWnp2uzT0wIP0riKH9rH1gF5Y5xxHOU"; 

const SYSTEM_PROMPT = `You are the AI Assistant for 'TAPEX Global Services', an elite study abroad consultancy. 
- Focus: UK (Main Focus), Australia, Canada, Germany.
- UK Advantage: No IELTS needed if Inter 2nd year English marks are 60/100+. 18-month post-study work visa. 100% loan assistance.
- Mentor: Uday Kiran is based in Leicester, UK.
- Encourage users to "Talk to our UK Director" for a personalized plan.
Keep answers very brief, max 2 short paragraphs.`;

let chatHistory = [];

function toggleAI() {
    const widget = document.getElementById('ai-chat-widget');
    if (widget) widget.style.display = widget.style.display === 'flex' ? 'none' : 'flex';
}

async function sendAIMessage() {
    const inputEl = document.getElementById('ai-input');
    const msg = inputEl.value.trim();
    if(!msg) return;

    appendMessage('user', msg);
    inputEl.value = '';
    const typingId = appendMessage('bot', 'Thinking...');

    try {
        // Correct API Structure for Gemini 1.5 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: SYSTEM_PROMPT + "\n\nUser Question: " + msg }]
                }]
            })
        });
        
        const data = await response.json();

        // Debugging for you (Check Browser Console F12)
        if (data.error) {
            console.error("Gemini Error:", data.error);
            throw new Error(data.error.message);
        }

        if (!data.candidates || !data.candidates[0].content) {
            throw new Error("Invalid Response");
        }

        const botReply = data.candidates[0].content.parts[0].text;
        document.getElementById(typingId).innerText = botReply;

    } catch(err) {
        console.error("AI Assistant Error:", err);
        // Beautiful Fallback UI
        document.getElementById(typingId).innerHTML = `
            <div style="background:#fff3cd; color:#856404; padding:12px; border-radius:8px; border-left:4px solid #ffeba2; font-size:13px;">
                <b>Server Busy:</b> High traffic for Sep 2026 intake. Routing you to our UK Director.<br><br>
                <a href="https://wa.me/447386865322" target="_blank" style="background:#25D366; color:white; padding:8px 12px; border-radius:4px; text-decoration:none; display:inline-block; font-weight:bold;">
                    <i class="fab fa-whatsapp"></i> Chat with UK Director
                </a>
            </div>`;
    }
}

function appendMessage(sender, text) {
    const body = document.getElementById('ai-body');
    const msgDiv = document.createElement('div');
    const id = 'msg-' + Date.now();
    msgDiv.id = id;
    msgDiv.className = `ai-msg ${sender}`;
    msgDiv.innerText = text;
    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;
    return id;
}
