/**
 * GPATrack - Analytics Dashboard
 * Visualizes academic performance with Chart.js charts
 */

let gpaTrendChart = null;
let creditsChart = null;
let gradeDistributionChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initAnalytics();
});

/**
 * Initialize Analytics Dashboard
 */
function initAnalytics() {
    setupEventListeners();
    loadData();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportToPDF);
    }

    const exportCSVBtn = document.getElementById('exportCSVBtn');
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportToCSV);
    }

    const printBtn = document.getElementById('printReportBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
}

/**
 * Load all data and render charts
 */
function loadData() {
    const semesters = window.Storage.getSemesters();
    const stats = window.Storage.getStatistics();

    // Check if data exists
    const emptyAnalytics = document.getElementById('emptyAnalytics');
    const mainContent = document.querySelector('.analytics-stats')?.closest('.container');

    if (semesters.length === 0) {
        if (emptyAnalytics) emptyAnalytics.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';
        return;
    }

    if (emptyAnalytics) emptyAnalytics.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';

    // Update statistics
    updateStatisticsDisplay(stats, semesters);

    // Render charts
    renderGPATrendChart(semesters);
    renderCreditsChart(semesters);
    renderGradeDistributionChart(semesters);
    renderPerformanceMeter(stats.cgpa);
    updateAchievementBadges(stats, semesters);
}

/**
 * Update statistics display
 */
function updateStatisticsDisplay(stats, semesters) {
    const highestEl = document.getElementById('highestGPA');
    const lowestEl = document.getElementById('lowestGPA');
    const avgEl = document.getElementById('avgGPA');
    const bestEl = document.getElementById('bestSemester');

    if (highestEl) highestEl.textContent = stats.highestGPA.toFixed(2);
    if (lowestEl) lowestEl.textContent = stats.lowestGPA.toFixed(2);
    if (avgEl) avgEl.textContent = stats.averageGPA.toFixed(2);
    if (bestEl) bestEl.textContent = stats.bestSemester || '-';
}

/**
 * Render GPA Trend Chart (Line Chart)
 */
function renderGPATrendChart(semesters) {
    const ctx = document.getElementById('gpaTrendChart');
    if (!ctx) return;

    // Destroy existing chart
    if (gpaTrendChart) {
        gpaTrendChart.destroy();
    }

    const labels = semesters.map(s => `${s.name} ${s.year}`);
    const data = semesters.map(s => s.gpa || 0);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#cbd5e1' : '#64748b';

    gpaTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'GPA',
                data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `GPA: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 10,
                    ticks: {
                        color: textColor,
                        stepSize: 2
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Render Credits per Semester Chart (Bar Chart)
 */
function renderCreditsChart(semesters) {
    const ctx = document.getElementById('creditsChart');
    if (!ctx) return;

    // Destroy existing chart
    if (creditsChart) {
        creditsChart.destroy();
    }

    const labels = semesters.map(s => `${s.name} ${s.year}`);
    const data = semesters.map(s => s.credits || 0);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#cbd5e1' : '#64748b';

    creditsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Credits',
                data,
                backgroundColor: [
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `Credits: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Render Grade Distribution Chart (Pie Chart)
 */
function renderGradeDistributionChart(semesters) {
    const ctx = document.getElementById('gradeDistributionChart');
    if (!ctx) return;

    // Destroy existing chart
    if (gradeDistributionChart) {
        gradeDistributionChart.destroy();
    }

    // Collect all grades from subjects
    const gradeCounts = {
        'O': 0,
        'A+': 0,
        'A': 0,
        'B+': 0,
        'B': 0,
        'C': 0,
        'F': 0
    };

    semesters.forEach(semester => {
        if (semester.subjects && semester.subjects.length > 0) {
            semester.subjects.forEach(subject => {
                if (gradeCounts.hasOwnProperty(subject.grade)) {
                    gradeCounts[subject.grade]++;
                }
            });
        }
    });

    const labels = Object.keys(gradeCounts).filter(key => gradeCounts[key] > 0);
    const data = labels.map(label => gradeCounts[label]);

    // If no subject data, show placeholder
    if (labels.length === 0) {
        labels.push('No Data');
        data.push(1);
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    gradeDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => l === 'No Data' ? l : `Grade ${l}`),
            datasets: [{
                data,
                backgroundColor: [
                    '#22c55e', // O - Green
                    '#3b82f6', // A+ - Blue
                    '#60a5fa', // A - Light Blue
                    '#14b8a6', // B+ - Teal
                    '#2dd4bf', // B - Light Teal
                    '#f59e0b', // C - Orange
                    '#ef4444', // F - Red
                    '#94a3b8'  // No Data - Gray
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: isDark ? '#cbd5e1' : '#64748b',
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render Performance Meter
 */
function renderPerformanceMeter(cgpa) {
    const fillEl = document.getElementById('performanceFill');
    const indicatorEl = document.getElementById('performanceIndicator');
    const ratingEl = document.getElementById('performanceRating');

    if (fillEl) {
        // Gradient from red to green
        setTimeout(() => {
            fillEl.style.width = `${(cgpa / 10) * 100}%`;
        }, 200);
    }

    if (indicatorEl) {
        setTimeout(() => {
            indicatorEl.style.left = `${(cgpa / 10) * 100}%`;
        }, 200);
    }

    if (ratingEl) {
        const rating = window.Utils.getPerformanceRating(cgpa);
        ratingEl.innerHTML = `<span class="rating-text">${rating}</span>`;
    }
}

/**
 * Update Achievement Badges
 */
function updateAchievementBadges(stats, semesters) {
    const badges = document.querySelectorAll('.badge-card');

    badges.forEach(badge => {
        const name = badge.querySelector('.badge-name')?.textContent;

        let unlocked = false;

        switch (name) {
            case 'Academic Excellence':
                unlocked = stats.cgpa >= 9.0;
                break;
            case "Dean's List":
                unlocked = stats.cgpa >= 8.5;
                break;
            case 'Top Performer':
                unlocked = semesters.filter(s => (s.gpa || 0) >= 9.0).length >= 3;
                break;
            case 'Consistent Performer':
                const gpas = semesters.map(s => s.gpa || 0);
                const range = Math.max(...gpas) - Math.min(...gpas);
                unlocked = semesters.length >= 3 && range <= 1.0;
                break;
            case 'Rising Star':
                let improvements = 0;
                for (let i = 1; i < semesters.length; i++) {
                    if ((semesters[i].gpa || 0) > (semesters[i - 1].gpa || 0)) {
                        improvements++;
                    }
                }
                unlocked = improvements >= 3;
                break;
            case 'Scholar':
                unlocked = stats.totalCredits >= 100;
                break;
        }

        badge.classList.toggle('locked', !unlocked);
        badge.classList.toggle('unlocked', unlocked);
    });
}

/**
 * Export to PDF
 */
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const stats = window.Storage.getStatistics();
    const semesters = window.Storage.getSemesters();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text('GPATrack - Academic Report', 20, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Summary
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Summary', 20, 45);

    doc.setFontSize(12);
    doc.text(`Current CGPA: ${stats.cgpa.toFixed(2)}`, 20, 55);
    doc.text(`Total Credits: ${stats.totalCredits}`, 20, 65);
    doc.text(`Completed Semesters: ${stats.completedSemesters}`, 20, 75);

    // Semesters List
    doc.setFontSize(16);
    doc.text('Semester Details', 20, 95);

    let yPos = 105;
    doc.setFontSize(11);

    semesters.forEach((semester, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(`${index + 1}. ${semester.name} ${semester.year}: GPA ${semester.gpa?.toFixed(2) || 'N/A'} (${semester.credits} credits)`, 25, yPos);
        yPos += 10;
    });

    // Save PDF
    doc.save('gpatrack-report.pdf');
    window.Utils.showToast('PDF Exported', 'Your report has been downloaded', 'success');
}

/**
 * Export to CSV
 */
function exportToCSV() {
    const semesters = window.Storage.getSemesters();
    const stats = window.Storage.getStatistics();

    let csvContent = 'data:text/csv;charset=utf-8,';

    // Header
    csvContent += 'GPATrack Academic Report\n';
    csvContent += `Generated,${new Date().toLocaleDateString()}\n\n`;

    // Summary
    csvContent += 'Summary\n';
    csvContent += `Current CGPA,${stats.cgpa.toFixed(2)}\n`;
    csvContent += `Total Credits,${stats.totalCredits}\n`;
    csvContent += `Completed Semesters,${stats.completedSemesters}\n\n`;

    // Semester details
    csvContent += 'Semester Name,Year,GPA,Credits\n';
    semesters.forEach(s => {
        csvContent += `"${s.name}",${s.year},${s.gpa?.toFixed(2) || 'N/A'},${s.credits}\n`;
    });

    // Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'gpatrack-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.Utils.showToast('CSV Exported', 'Your data has been downloaded', 'success');
}

// Update charts when theme changes
const originalToggleTheme = window.Utils.toggleTheme;
window.Utils.toggleTheme = function () {
    originalToggleTheme();
    setTimeout(() => {
        const semesters = window.Storage.getSemesters();
        if (semesters.length > 0) {
            renderGPATrendChart(semesters);
            renderCreditsChart(semesters);
            renderGradeDistributionChart(semesters);
        }
    }, 100);
};
