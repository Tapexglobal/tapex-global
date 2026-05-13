const GEMINI_API_KEY = "AIzaSyAHXWnp2uzT0wIP0riKH9rH1gF5Y5xxHOU"; 

// Simplified Prompt for maximum compatibility
const SYSTEM_PROMPT = "You are TAPEX AI, a study abroad expert. Focus on UK, Australia, Canada, Germany. Mention Uday Kiran (Leicester, UK) as Lead Mentor. Keep it very short.";

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
    const typingId = appendMessage('bot', 'Connecting to server...');

    try {
        // v1 is more stable than v1beta for front-end calls
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${SYSTEM_PROMPT}\n\nQuestion: ${msg}` }]
                }]
            })
        });
        
        const data = await response.json();

        // If Google returns an error, show it in Console (F12)
        if (data.error) {
            console.error("GOOGLE API ERROR:", data.error);
            throw new Error(data.error.message);
        }

        const botReply = data.candidates[0].content.parts[0].text;
        document.getElementById(typingId).innerText = botReply;

    } catch(err) {
        console.error("FRONTEND FETCH ERROR:", err);
        // Fallback message
        document.getElementById(typingId).innerHTML = `
            <div style="background:#fff3cd; color:#856404; padding:10px; border-radius:8px; border-left:4px solid #ffeba2; font-size:12px;">
                <b>System Offline:</b> September intake traffic is high. Please connect with our UK Director directly.<br><br>
                <a href="https://wa.me/447386865322" target="_blank" style="background:#25D366; color:white; padding:8px 12px; border-radius:4px; text-decoration:none; display:inline-block; font-weight:bold; font-size:11px;">
                    <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                </a>
            </div>`;
    }
}

function appendMessage(sender, text) {
    const body = document.getElementById('ai-body');
    if (!body) return '';
    const msgDiv = document.createElement('div');
    const id = 'msg-' + Date.now();
    msgDiv.id = id;
    msgDiv.className = `ai-msg ${sender}`;
    msgDiv.innerText = text;
    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;
    return id;
}
