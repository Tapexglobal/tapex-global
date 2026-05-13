const GEMINI_API_KEY = "AIzaSyAHXWnp2uzT0wIP0riKH9rH1gF5Y5xxHOU"; 

const SYSTEM_PROMPT = `
You are the AI Assistant for 'TAPEX Global Services', an elite study abroad consultancy.
- Focus: UK (Main Focus), Australia, Canada, Germany.
- UK Advantage: No IELTS needed if Inter 2nd year English marks are 60/100+. 18-month post-study work visa. 100% loan assistance available.
- Mentor Location: Lead Mentor Uday Kiran is physically based in Leicester, UK.
- We have a UK Career Hub for enrolled students to find verified part-time jobs (McDonalds, Starbucks, Warehouses, etc.) and graduate sponsorship jobs.
Encourage the user to "Talk to our UK Director" for a personalized plan.
Keep answers very brief, max 2 short paragraphs.
`;

let chatHistory = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Understood. I am ready to assist TAPEX students." }] }
];

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
    const typingId = appendMessage('bot', 'Typing...');

    try {
        chatHistory.push({ role: "user", parts: [{ text: msg }] });
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: chatHistory })
        });
        
        const data = await response.json();
        if(data.error) throw new Error(data.error.message);
        
        const botReply = data.candidates[0].content.parts[0].text;
        chatHistory.push({ role: "model", parts: [{ text: botReply }] });
        document.getElementById(typingId).innerText = botReply;

    } catch(err) {
        document.getElementById(typingId).innerHTML = `Due to high traffic, I am routing you to our UK Director. <br><br><a href="https://wa.me/447386865322" target="_blank" style="color:var(--navy); font-weight:bold;">Click here to chat on WhatsApp.</a>`;
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
