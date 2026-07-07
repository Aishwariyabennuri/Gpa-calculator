/**
 * GPATrack - Home Dashboard
 * Main entry point for the application
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    initDashboard();
});

/**
 * Initialize dashboard components
 */
function initDashboard() {
    updateStatistics();
    renderRecentSemesters();
    setupScrollAnimations();
}

/**
 * Update all statistics displays
 */
function updateStatistics() {
    const stats = window.Storage.getStatistics();

    // Update CGPA display
    const cgpaEl = document.getElementById('currentCGPA');
    if (cgpaEl) {
        animateNumber(cgpaEl, stats.cgpa);
    }

    // Update latest semester GPA
    const semesters = window.Storage.getSemesters();
    const latestGPAEl = document.getElementById('latestGPA');
    if (latestGPAEl && semesters.length > 0) {
        animateNumber(latestGPAEl, semesters[semesters.length - 1].gpa || 0);
    }

    // Update credits
    const creditsEl = document.getElementById('totalCredits');
    if (creditsEl) {
        creditsEl.textContent = stats.totalCredits;
    }

    // Update credit progress text
    const creditProgressEl = document.getElementById('creditProgress');
    if (creditProgressEl) {
        const settings = window.Storage.getSettings();
        creditProgressEl.textContent = `of ${settings.totalCreditsRequired} credits`;
    }

    // Update remaining semesters
    const remainingEl = document.getElementById('remainingSemesters');
    if (remainingEl) {
        remainingEl.textContent = stats.remainingSemesters;
    }

    // Update progress bar
    const progressBar = document.getElementById('graduationProgress');
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.width = `${stats.progressPercentage}%`;
        }, 100);
    }

    // Update progress percentage
    const progressPercentage = document.getElementById('progressPercentage');
    if (progressPercentage) {
        progressPercentage.textContent = `${stats.progressPercentage}%`;
    }

    // Update progress stats
    const completedCreditsStat = document.getElementById('completedCreditsStat');
    if (completedCreditsStat) {
        completedCreditsStat.textContent = stats.creditsCompleted;
    }

    const remainingCreditsStat = document.getElementById('remainingCreditsStat');
    if (remainingCreditsStat) {
        remainingCreditsStat.textContent = stats.creditsRemaining;
    }

    // Update CGPA change indicator
    const cgpaChangeEl = document.getElementById('cgpaChange');
    if (cgpaChangeEl && semesters.length > 1) {
        const prevGPA = semesters[semesters.length - 2]?.gpa || 0;
        const currGPA = semesters[semesters.length - 1]?.gpa || 0;
        const change = currGPA - prevGPA;

        if (change !== 0) {
            cgpaChangeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}`;
            cgpaChangeEl.className = `stat-change ${change > 0 ? 'positive' : 'negative'}`;
        }
    }
}

/**
 * Animate number counting
 */
function animateNumber(element, target, duration = 500) {
    const start = parseFloat(element.textContent) || 0;
    const startTime = performance.now();
    const range = target - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (range * easeOut);
        element.textContent = current.toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Render recent semesters
 */
function renderRecentSemesters() {
    const container = document.getElementById('recentSemesters');
    if (!container) return;

    const semesters = window.Storage.getSemesters();

    if (semesters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No semesters added yet. Start by calculating your GPA!</p>
                <a href="gpa.html" class="btn btn-primary">
                    <i class="fas fa-calculator"></i> Add Your First Semester
                </a>
            </div>
        `;
        return;
    }

    // Show last 4 semesters
    const recentSemesters = semesters.slice(-4).reverse();

    container.innerHTML = recentSemesters.map((semester, index) => `
        <div class="semester-item animate-fade-in-up" style="animation-delay: ${index * 0.1}s">
            <div class="semester-item-header">
                <span class="semester-item-name">${escapeHtml(semester.name)} ${semester.year}</span>
                <span class="semester-item-gpa">${semester.gpa?.toFixed(2) || '0.00'}</span>
            </div>
            <span class="semester-item-credits">${semester.credits || 0} credits</span>
        </div>
    `).join('');
}

/**
 * Setup scroll animations
 */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Real-time updates via storage events
window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('gpatrack_')) {
        updateStatistics();
        renderRecentSemesters();
    }
});

// Refresh data periodically when tab becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateStatistics();
        renderRecentSemesters();
    }
});
