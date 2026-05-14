/**
 * LIVE UK JOBS ENGINE
 * Fast loading, Skeletons, Caching, Filtering.
 */
const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw0qgbjVNKyd2kF3kSVfQN6yD8KTFVYra29Rm5vDv4rG4RFW6IlPSYPdWXeHv0J0lfs/exec';
let globalJobs = [];
const CACHE_KEY = 'tapex_jobs_cache';

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('jobs-container')) {
        loadJobs();
    }
});

async function loadJobs() {
    const container = document.getElementById('jobs-container');
    if (!container) return;

    // Retrieve from cache if exists for instant load
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem('tapex_jobs_time');
    
    if (cachedData && cacheTime && (Date.now() - cacheTime < 1800000)) {
        globalJobs = JSON.parse(cachedData);
        renderJobs('all');
        const countDisplay = document.getElementById('job-count-display');
        if (countDisplay) countDisplay.innerHTML += ' <span style="font-size:12px; color:var(--green);">(Live Syncing...)</span>';
    } else {
        container.innerHTML = Array(6).fill(`
            <div class="job-card">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width:50%"></div>
            </div>`).join('');
    }

    try {
        const res = await fetch(APPS_SCRIPT_WEB_APP_URL);
        const data = await res.json();
        
        if (data && data.jobs && data.jobs.length > 0) {
            globalJobs = data.jobs;
            localStorage.setItem(CACHE_KEY, JSON.stringify(globalJobs));
            localStorage.setItem('tapex_jobs_time', Date.now());
            renderJobs('all');
        } else if (globalJobs.length === 0) {
            container.innerHTML = '<p class="text-center w-100">No jobs match this category right now. Check back later.</p>';
        }
    } catch (err) {
        console.error("Job Fetch Error: ", err);
        if (globalJobs.length === 0) {
            container.innerHTML = '<p class="text-center w-100 text-muted">Unable to load live jobs. Please check your internet connection.</p>';
        }
    }
}

window.filterJobs = function(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('btn-navy');
        b.classList.add('btn-outline-navy');
    });
    if (btn) {
        btn.classList.remove('btn-outline-navy');
        btn.classList.add('btn-navy');
    }
    renderJobs(category);
}

function renderJobs(category) {
    const container = document.getElementById('jobs-container');
    const countDisplay = document.getElementById('job-count-display');
    if (!container) return;

    let html = '';
    let count = 0;

    globalJobs.forEach(job => {
        const jobCat = String(job.Category || 'Part-Time').toLowerCase();
        const searchPool = `${String(job.JobTitle)} ${jobCat} ${String(job.EmployerName)}`.toLowerCase();
        
        let show = false;
        if(category === 'all') show = true;
        else if(category === 'part-time' && (jobCat.includes('part') || searchPool.includes('assistant') || searchPool.includes('crew'))) show = true;
        else if(category === 'sponsorship' && (searchPool.includes('sponsor') || searchPool.includes('graduate') || searchPool.includes('professional'))) show = true;
        else if(category === 'warehouse' && (searchPool.includes('warehouse') || searchPool.includes('packer') || searchPool.includes('logistics'))) show = true;

        if(show) {
            count++;
            const salary = job.MinimumSalary && job.MinimumSalary !== 'Competitive' ? `${job.MinimumSalary} - ${job.MaximumSalary}` : 'Competitive Pay';
            const sourceBadge = job.Source ? `<span class="job-badge">${job.Source}</span>` : `<span class="job-badge">Verified</span>`;
            
            html += `
            <div class="job-card">
                <div class="flex-between mb-10">
                    <span class="job-company">${job.EmployerName || 'Premium Employer'}</span>
                    ${sourceBadge}
                </div>
                <h3 class="job-title">${job.JobTitle}</h3>
                <div class="text-sm text-muted"><i class="fas fa-map-marker-alt"></i> ${job.LocationName || 'UK Wide'}</div>
                <div class="job-salary">${salary}</div>
                <a href="${job.ApplyLink || '#'}" target="_blank" class="btn btn-navy w-100">Apply Direct <i class="fas fa-external-link-alt"></i></a>
            </div>`;
        }
    });

    container.innerHTML = count > 0 ? html : '<p class="text-center w-100">No jobs match this category right now.</p>';
    if (countDisplay) {
        countDisplay.innerHTML = `Showing <b>${count}</b> Verified UK Opportunities`;
    }
}
