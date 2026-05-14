/**
 * GEMINI API INTEGRATION
 * Direct API Call with robust error handling and Lead Generation Logic.
 */
const GEMINI_API_KEY = "AIzaSyAHXWnp2uzT0wIP0riKH9rH1gF5Y5xxHOU";
let messageCount = 0;

const SYSTEM_PROMPT = `
You are the AI Assistant for 'TAPEX Global Services', an elite study abroad consultancy. 
Focus: UK (Main Focus), Australia, Canada, Germany.
UK Advantage: No IELTS needed if Inter 2nd year English marks are 60/100+. 18-month post-study work visa. 100% loan assistance available.
Mentor Location: Lead Mentor Uday Kiran is physically based in Leicester, UK.
We have a UK Career Hub for enrolled students to find verified part-time jobs and graduate sponsorship jobs.
Always be friendly, premium, fast, persuasive but helpful.
NEVER say "Due to high traffic".
Keep answers to 2 short paragraphs max.
`;

let chatContext = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Understood. I am ready to assist TAPEX students." }] }
];

function toggleAI() {
    const el = document.getElementById('ai-widget');
    if(el) {
        el.style.display = el.style.display === 'none' || el.style.display === '' ? 'flex' : 'none';
    }
}

function fillAIInput(text) {
    const inputEl = document.getElementById('ai-input-field');
    const sugEl = document.getElementById('ai-suggestions');
    if (inputEl) inputEl.value = text;
    sendAIMessage();
    if (sugEl) sugEl.style.display = 'none';
}

function handleAIKey(e) {
    if(e.key === 'Enter') sendAIMessage();
}

async function sendAIMessage() {
    const input = document.getElementById('ai-input-field');
    if (!input) return;
    
    const text = input.value.trim();
    if(!text) return;

    appendMsg('user', text);
    input.value = '';
    messageCount++;
    
    // Capture Lead after 3 messages
    if(messageCount >= 3) {
        appendMsg('bot', 'To give you the best personalized guidance and exact university matches, could you please connect with our UK Director directly on WhatsApp? <br><br><a href="https://wa.me/447386865322" target="_blank" style="color:var(--navy); font-weight:bold; text-decoration:underline;">Click here to chat instantly.</a>');
        return;
    }

    const typingId = appendMsg('bot', '<i class="fas fa-ellipsis-h fa-fade"></i>');

    try {
        chatContext.push({ role: "user", parts: [{ text: text }] });
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: chatContext })
        });
        
        const data = await response.json();
        
        if(data.error) throw new Error(data.error.message);
        
        const reply = data.candidates[0].content.parts[0].text;
        chatContext.push({ role: "model", parts: [{ text: reply }] });
        
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.innerHTML = reply.replace(/\n/g, '<br>');

    } catch (error) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) {
            typingEl.innerHTML = "I'm temporarily unavailable. Please try again in a few seconds or connect with our UK mentor on WhatsApp at <a href='https://wa.me/447386865322' target='_blank' style='color:var(--navy); font-weight:bold;'>+447386865322</a>.";
        }
    }
}

function appendMsg(sender, text) {
    const body = document.getElementById('ai-body');
    if (!body) return null;
    
    const div = document.createElement('div');
    const id = 'msg-' + Date.now();
    div.id = id;
    div.className = `ai-msg ${sender}`;
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return id;
}
