/**
 * TAPEX UK CAREER HUB ENGINE
 * Fetches natively from Google Apps Script JSON Endpoint (Zero Lag / Cloudflare Optimized)
 */

const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw0qgbjVNKyd2kF3kSVfQN6yD8KTFVYra29Rm5vDv4rG4RFW6IlPSYPdWXeHv0J0lfs/exec";

let ukJobs =[];

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('jobs-UK-container')) loadUKJobs();
});

async function loadUKJobs() {
    const container = document.getElementById('jobs-UK-container');
    container.innerHTML = `<div class="text-center w-100 p-30"><i class="fas fa-spinner fa-spin fa-2x text-gold"></i><p class="mt-15 text-navy">Fetching Verified Student & Professional UK Opportunities...</p></div>`;

    try {
        const response = await fetch(APPS_SCRIPT_WEB_APP_URL);
        const data = await response.json();
        
        if(!data.jobs || data.jobs.length === 0) {
            container.innerHTML = `<p class="text-center w-100">No live UK jobs found. Please check back later.</p>`; 
            return;
        }
        
        // Filter out junk and keep only genuine UK jobs
        ukJobs = data.jobs.filter(job => {
            const c = String(job.Country || '').toLowerCase();
            const t = String(job.JobTitle || '').toLowerCase();
            // Basic sanity check to ensure it's a real job title
            return (c === 'uk' || c.includes('united kingdom')) && t.length > 3;
        });
        
        renderUKJobs('all');
    } catch (error) {
        console.error("Error fetching jobs:", error);
        container.innerHTML = `<p class="text-center w-100 text-red">Connection delayed. Please join our WhatsApp group for direct job updates.</p>`;
    }
}

window.filterUKJobs = function(sector, el) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('btn-navy');
        b.classList.add('btn-outline');
    });
    el.classList.remove('btn-outline');
    el.classList.add('btn-navy');
    renderUKJobs(sector);
};

function renderUKJobs(sector) {
    const container = document.getElementById('jobs-UK-container');
    let html = ''; 
    let count = 0;

    ukJobs.forEach(job => {
        const title = String(job.JobTitle).toLowerCase();
        const emp = String(job.EmployerName).toLowerCase();
        const cat = String(job.Category).toLowerCase();
        const pool = title + " " + cat + " " + emp;
        
        let match = sector === 'all';
        
        // Smart filtering for genuine student brands
        if(sector === 'retail' && (pool.includes('retail') || pool.includes('tesco') || pool.includes('asda') || pool.includes('sainsbury') || pool.includes('aldi'))) match = true;
        if(sector === 'warehouse' && (pool.includes('warehouse') || pool.includes('picker') || pool.includes('amazon') || pool.includes('evri') || pool.includes('packer'))) match = true;
        if(sector === 'hospitality' && (pool.includes('hospitality') || pool.includes('wait') || pool.includes('kitchen') || pool.includes('mcdonald') || pool.includes('kfc') || pool.includes('burger king') || pool.includes('subway') || pool.includes('starbucks') || pool.includes('costa'))) match = true;
        if(sector === 'fashion' && (pool.includes('fashion') || pool.includes('clothing') || pool.includes('apparel') || pool.includes('zara') || pool.includes('primark'))) match = true;
        if(sector === 'graduate' && (pool.includes('graduate') || pool.includes('sponsor') || pool.includes('tier 2') || pool.includes('professional'))) match = true;

        if(match) {
            count++;
            const salary = job.MinimumSalary && job.MinimumSalary !== 'Competitive' ? `${job.MinimumSalary} - ${job.MaximumSalary}` : "Competitive Pay";
            const categoryBadge = job.Category || 'Verified';
            
            html += `
            <div class="glass-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <strong class="text-muted text-sm" style="text-transform:uppercase;">${job.EmployerName || 'Verified Employer'}</strong>
                    <span style="background:#e8f5e9; color:#1b5e20; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:800;">${categoryBadge}</span>
                </div>
                <h3 style="font-size:18px; margin-bottom:5px; color:var(--navy); line-height:1.3;">${job.JobTitle}</h3>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:15px;"><i class="fas fa-map-marker-alt"></i> ${job.LocationName || 'UK Nationwide'}</div>
                <div style="color:var(--gold); font-weight:800; margin-bottom:20px;">${salary}</div>
                <a href="${job.ApplyLink || '#'}" target="_blank" class="btn btn-navy w-100">Apply Direct</a>
            </div>`;
        }
    });

    if(count === 0) html = `<p class="text-center w-100">No genuine jobs matched this sector right now. Try another filter.</p>`;
    container.innerHTML = html;
    document.getElementById('job-count-display').innerHTML = `Showing <b>${count} Verified UK Opportunities</b>`;
}
