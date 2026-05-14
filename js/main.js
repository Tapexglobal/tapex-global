// Navigation
function toggleMenu() {
    const nav = document.getElementById('navMenu');
    if (nav) nav.classList.toggle('active');
}

// Profile Evaluator Logic (Smart Consultation Flow)
const evalState = { country: 'UK', qual: '12th', score: 0, gap: 0, engType: 'none', engScore: 0 };

function setEvalData(field, val, el) {
    evalState[field] = val;
    if(el && el.parentElement) {
        const btns = el.parentElement.querySelectorAll('.eval-btn');
        btns.forEach(b => b.classList.remove('active'));
        el.classList.add('active');
    }
}

function nextEvalStep(current) {
    const currPanel = document.getElementById(`panel-${current}`);
    const currStep = document.getElementById(`e-step-${current}`);
    if (currPanel) currPanel.classList.remove('active');
    if (currStep) currStep.classList.remove('active');
    
    const next = current + 1;
    const nextPanel = document.getElementById(`panel-${next}`);
    const nextStep = document.getElementById(`e-step-${next}`);
    
    if (nextPanel) nextPanel.classList.add('active');
    if (nextStep) nextStep.classList.add('active');
}

function toggleEngScore() {
    const typeEl = document.getElementById('eval-eng-type');
    const groupEl = document.getElementById('eng-score-group');
    if (!typeEl || !groupEl) return;
    
    const type = typeEl.value;
    evalState.engType = type;
    groupEl.style.display = type === 'none' ? 'none' : 'block';
}

function processConsultation() {
    const qualEl = document.getElementById('eval-qual');
    const scoreEl = document.getElementById('eval-score');
    const gapEl = document.getElementById('eval-gap');
    const engScoreEl = document.getElementById('eval-eng-score');
    
    if (qualEl) evalState.qual = qualEl.value;
    if (scoreEl) evalState.score = parseInt(scoreEl.value) || 0;
    if (gapEl) evalState.gap = parseInt(gapEl.value) || 0;
    if (evalState.engType !== 'none' && engScoreEl) {
        evalState.engScore = parseFloat(engScoreEl.value) || 0;
    }

    // Move to final step
    nextEvalStep(3);
}

function submitEvalLead() {
    const nameEl = document.getElementById('lead-name');
    const phoneEl = document.getElementById('lead-phone');
    
    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';

    if(!name || phone.length < 10) { alert('Please enter valid details to get your roadmap.'); return; }
    
    const msg = encodeURIComponent(`Hello TAPEX UK Lead Mentor! \n\nI completed my Profile Analysis.\nName: ${name}\nWhatsApp: ${phone}\nTarget: ${evalState.country}\n\nPlease share my personalized university roadmap!`);
    window.open(`https://wa.me/447386865322?text=${msg}`, '_blank');
}

// 20s Lead Popup Logic
setTimeout(() => {
    if(!sessionStorage.getItem('tapex_popup_shown')) {
        const modal = document.getElementById('lead-modal');
        if(modal) {
            modal.classList.add('active');
            sessionStorage.setItem('tapex_popup_shown', 'true');
        }
    }
}, 20000);

function closeLeadModal() {
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.remove('active');
}
