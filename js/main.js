// Mobile Menu
function toggleMenu() {
    document.getElementById('mobileMenu').classList.toggle('active');
}

// Global State
const S = { country: 'UK', hasTest: false, testType: 'ielts', testScore: 0, inter2: 0, qual: 'inter', gap: 0, funds: 0 };

// Evaluator Logic
function setCTg(field, val, el) {
    S[field] = val;
    el.parentElement.querySelectorAll('.c-tb').forEach(b => b.classList.remove('on'));
    el.classList.add('on');
    
    if(field === 'country') {
        const divInter = document.getElementById('c-div-inter');
        const divTest = document.getElementById('c-div-test');
        const engToggle = document.getElementById('c-eng-type-toggle');
        
        if(val === 'UK') {
            engToggle.style.display = 'block';
            document.getElementById('c-btn-no-test').click();
        } else {
            engToggle.style.display = 'none';
            document.getElementById('c-btn-yes-test').click();
            const hints = {
                Australia: 'IELTS min 6.5 overall.',
                Canada: 'IELTS 6.5 strongly recommended.',
                Germany: 'IELTS 6.0 for English programs.'
            };
            document.getElementById('c-test-hint').textContent = hints[val] || '';
        }
    }
}

function toggleCTest(has) {
    S.hasTest = has;
    document.getElementById('c-btn-no-test').classList.toggle('on', !has);
    document.getElementById('c-btn-yes-test').classList.toggle('on', has);
    document.getElementById('c-div-inter').style.display = has ? 'none' : 'block';
    document.getElementById('c-div-test').style.display = has ? 'block' : 'none';
}

function showCSec(id, step) {
    document.querySelectorAll('.c-sec').forEach(s => s.classList.remove('show'));
    document.getElementById(id).classList.add('show');
    
    for(let i=1; i<=4; i++) {
        const st = document.getElementById('st'+i);
        st.classList.remove('active', 'done');
        if(i < step) { st.classList.add('done'); st.querySelector('.c-sn').textContent = '✓'; }
        else if(i === step) { st.classList.add('active'); st.querySelector('.c-sn').textContent = i; }
        else { st.querySelector('.c-sn').textContent = i; }
    }
}

function stepCEng() { showCSec('c-sec2', 2); }
function stepCProf() { showCSec('c-sec3', 3); }
function stepCFin() { S.qual = document.getElementById('c-qual').value; showCSec('c-sec4', 4); }

let finalScore = 0;
function calcCScore() {
    S.inter2 = parseInt(document.getElementById('c-inter2')?.value) || 0;
    S.testScore = parseFloat(document.getElementById('c-test-score')?.value) || 0;
    
    let raw = 0; let issues =[];
    if(!S.hasTest && S.country === 'UK') {
        if(S.inter2 === 0) { raw += 15; issues.push("⚠️ English marks missing. We will assist you."); }
        else if(S.inter2 < 60) { raw += 60; issues.push("💡 Average marks. TAPEX tie-ups will secure admission."); }
        else { raw += 85; issues.push("✅ English marks are excellent for UK."); }
    } else {
        if(S.testScore === 0) { raw += 15; issues.push("⚠️ Test score missing. Expert trainers will guide you."); }
        else if(S.testScore < 6.0) { raw += 45; issues.push("⚠️ Test score low. We handle exceptions."); }
        else { raw += 85; issues.push(`✅ ${document.getElementById('c-test-type').value.toUpperCase()} accepted.`); }
    }

    if(S.qual === 'pg') { raw = Math.min(raw, 70); issues.push("🎓 Masters profile detected. Specialized path required."); }
    if(S.gap > 0) {
        if(S.country === 'UK') { raw += 10; issues.push("✅ UK accepts gaps easily."); }
        else { raw -= 5; issues.push("⚠️ Gaps strict. We will write a strong SOP."); }
    } else { raw += 10; }

    let fs = (raw + (Math.random()*5)).toFixed(1);
    finalScore = fs > 99 ? 99.1 : fs;

    showCSec('c-sec-result', 4);
    
    // Animate SVG Ring
    setTimeout(() => {
        document.getElementById('c-ring-fg').style.strokeDashoffset = 471 - (finalScore / 100) * 471;
        let c = 0;
        const iv = setInterval(() => {
            c += 2;
            if(c >= finalScore) { c = finalScore; clearInterval(iv); }
            document.getElementById('c-rnum').textContent = Math.round(c);
        }, 20);
    }, 100);

    document.getElementById('c-issues').innerHTML = issues.map(i => `<p style="font-size:14px; margin-bottom:10px; color:#555;">${i}</p>`).join('');
}

// Lead Forms
function submitCWhatsApp() {
    const name = document.getElementById('c-name').value.trim();
    const phone = document.getElementById('c-phone').value.trim();
    if(!name || phone.length < 10) { alert('Please enter valid details.'); return; }
    
    const msg = encodeURIComponent(`Hello TAPEX Director! 🌍\n\nI checked my Profile Score.\n👤 Name: ${name}\n📱 WhatsApp: +91${phone}\n🎯 Destination: ${S.country}\n🏆 Score: ${finalScore}%\n\nPlease assign a Mentor to fulfill my study abroad dream!`);
    window.open(`https://wa.me/447386865322?text=${msg}`, '_blank');
}

// Lead Popup
setTimeout(() => {
    if(!localStorage.getItem('tapex_lead')) { document.getElementById('leadPopup').style.display = 'flex'; }
}, 15000);

function closePopup() { document.getElementById('leadPopup').style.display = 'none'; localStorage.setItem('tapex_lead', 'true'); }
function submitPopup() { closePopup(); window.open('https://forms.gle/GyJEoy8KbLDTE36q7', '_blank'); }
