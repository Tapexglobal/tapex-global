const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw0qgbjVNKyd2kF3kSVfQN6yD8KTFVYra29Rm5vDv4rG4RFW6IlPSYPdWXeHv0J0lfs/exec";

let ukJobs = [];

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('jobs-UK-container')) {
        loadUKJobs();
    }
});

async function loadUKJobs() {

    const container = document.getElementById('jobs-UK-container');

    container.innerHTML = `
        <div class="text-center w-100 p-30">
            <i class="fas fa-spinner fa-spin fa-2x text-gold"></i>
            <p class="mt-15 text-navy">
                Loading Live UK Jobs...
            </p>
        </div>
    `;

    try {

        const response = await fetch(APPS_SCRIPT_WEB_APP_URL);

        const data = await response.json();

        console.log(data);

        if (!data.jobs || data.jobs.length === 0) {

            container.innerHTML = `
                <p class="text-center w-100">
                    No jobs found right now.
                </p>
            `;

            return;
        }

        ukJobs = data.jobs;

        renderUKJobs('all');

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p class="text-center w-100 text-red">
                Failed to load UK jobs.
            </p>
        `;
    }
}

window.filterUKJobs = function(sector, el) {

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('btn-navy');
        btn.classList.add('btn-outline');
    });

    if (el) {
        el.classList.remove('btn-outline');
        el.classList.add('btn-navy');
    }

    renderUKJobs(sector);
};

function renderUKJobs(sector) {

    const container = document.getElementById('jobs-UK-container');

    let html = '';

    let count = 0;

    ukJobs.forEach(job => {

        const pool = `
            ${job.JobTitle}
            ${job.Category}
            ${job.EmployerName}
        `.toLowerCase();

        let match = sector === 'all';

        if (sector === 'retail' && pool.includes('retail')) {
            match = true;
        }

        if (sector === 'warehouse' && pool.includes('warehouse')) {
            match = true;
        }

        if (sector === 'hospitality' && (
            pool.includes('hospitality') ||
            pool.includes('barista') ||
            pool.includes('cafe') ||
            pool.includes('restaurant')
        )) {
            match = true;
        }

        if (sector === 'graduate' && (
            pool.includes('graduate') ||
            pool.includes('sponsorship')
        )) {
            match = true;
        }

        if (match) {

            count++;

            html += `
                <div class="glass-card">

                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">

                        <strong class="text-muted text-sm">
                            ${job.EmployerName || 'Employer'}
                        </strong>

                        <span style="
                            background:#e8f5e9;
                            color:#1b5e20;
                            padding:4px 8px;
                            border-radius:4px;
                            font-size:11px;
                            font-weight:800;
                        ">
                            ${job.Category || 'Verified'}
                        </span>

                    </div>

                    <h3 style="
                        font-size:18px;
                        margin-bottom:10px;
                        color:var(--navy);
                    ">
                        ${job.JobTitle}
                    </h3>

                    <div style="
                        font-size:13px;
                        color:var(--text-muted);
                        margin-bottom:15px;
                    ">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.LocationName}
                    </div>

                    <div style="
                        color:var(--gold);
                        font-weight:800;
                        margin-bottom:20px;
                    ">
                        ${job.MinimumSalary || 'Competitive'}
                    </div>

                    <a
                        href="${job.ApplyLink}"
                        target="_blank"
                        class="btn btn-navy w-100"
                    >
                        Apply Direct
                    </a>

                </div>
            `;
        }
    });

    if (count === 0) {

        html = `
            <p class="text-center w-100">
                No jobs found in this category.
            </p>
        `;
    }

    container.innerHTML = html;

    document.getElementById('job-count-display').innerHTML =
        `Showing ${count} Verified UK Opportunities`;
}
