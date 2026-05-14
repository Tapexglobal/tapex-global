// Navigation
function toggleMenu() {
    const nav = document.getElementById('navMenu');
    if (nav) nav.classList.toggle('active');
}

// Profile Evaluator Logic
const evalState = { country: 'UK', qual: '12th', score: 0, gap: 0, backlogs: 0, engType: 'none', engScore: 0 };

function setEvalData(field, val, el) {
    evalState[field] = val;
    const btns = el.parentElement.querySelectorAll('.eval-btn');
    btns.forEach(b => b.classList.remove('active'));
    el.classList.add('active');
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

function calculateRealisticScore() {
    const qualEl = document.getElementById('eval-qual');
    const scoreEl = document.getElementById('eval-score');
    const gapEl = document.getElementById('eval-gap');
    const backlogEl = document.getElementById('eval-backlogs');
    const engScoreEl = document.getElementById('eval-eng-score');
    
    if (qualEl) evalState.qual = qualEl.value;
    if (scoreEl) evalState.score = parseInt(scoreEl.value) || 0;
    if (gapEl) evalState.gap = parseInt(gapEl.value) || 0;
    if (backlogEl) evalState.backlogs = parseInt(backlogEl.value) || 0;
    if (evalState.engType !== 'none' && engScoreEl) {
        evalState.engScore = parseFloat(engScoreEl.value) || 0;
    }

    let probability = 0;
    let feedback = "";

    if(evalState.country === 'UK') {
        probability = 85; 
        if(evalState.score < 55) { probability -= 15; feedback += "Marks are slightly low, but partner universities accept 55%+. "; }
        if(evalState.gap > 2) { probability -= 5; feedback += "Study gap is acceptable for UK. "; }
        if(evalState.backlogs > 5) { probability -= 10; feedback += "Backlogs are high, but manageable. "; }
        if(evalState.engType === 'none') { feedback += "MOI / English marks accepted for UK! "; }
    } else {
        probability = 70;
        if(evalState.score < 65) { probability -= 20; feedback += "GPA is strictly evaluated. "; }
        if(evalState.gap > 1) { probability -= 15; feedback += "Study gaps require strong justification. "; }
        if(evalState.backlogs > 2) { probability -= 15; feedback += "Backlogs severely impact visa chances here. "; }
        if(evalState.engType === 'none') { probability -= 30; feedback += "IELTS/PTE is highly recommended. "; }
        else if(evalState.engScore < 6.5) { probability -= 15; feedback += "Aim for minimum 6.5 overall. "; }
    }

    if(probability > 95) probability = 95;
    if(probability < 30) probability = 35;

    const finalScoreEl = document.getElementById('final-score');
    const feedbackEl = document.getElementById('score-feedback');
    const titleEl = document.getElementById('score-title');

    if (finalScoreEl) finalScoreEl.innerText = `${probability}%`;
    if (feedbackEl) feedbackEl.innerText = feedback || "Your profile meets standard requirements.";
    
    if (titleEl) {
        if(probability >= 80) titleEl.innerText = "Excellent Profile!";
        else if(probability >= 60) titleEl.innerText = "Good Profile!";
        else titleEl.innerText = "Needs Expert Guidance";
    }

    nextEvalStep(3);
}

function submitEvalLead() {
    const nameEl = document.getElementById('lead-name');
    const phoneEl = document.getElementById('lead-phone');
    const scoreEl = document.getElementById('final-score');
    
    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const score = scoreEl ? scoreEl.innerText : '';

    if(!name || phone.length < 10) { alert('Please enter valid details.'); return; }
    
    const msg = encodeURIComponent(`Hello TAPEX Director! \n\nI checked my Profile Score.\nName: ${name}\nWhatsApp: ${phone}\nTarget: ${evalState.country}\nScore: ${score}\n\nPlease share my roadmap!`);
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
