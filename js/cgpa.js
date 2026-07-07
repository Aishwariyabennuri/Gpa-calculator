/**
 * GPATrack - CGPA Calculator
 * Handles cumulative GPA tracking across all semesters
 */

document.addEventListener('DOMContentLoaded', () => {
    initCGPACalculator();
});

/**
 * Initialize CGPA Calculator
 */
function initCGPACalculator() {
    setupEventListeners();
    updateDisplay();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add manual semester button
    const addManualBtn = document.getElementById('addManualBtn');
    if (addManualBtn) {
        addManualBtn.addEventListener('click', () => openSemesterModal());
    }

    // Add manual from empty state
    const addManualEmptyBtn = document.getElementById('addManualEmptyBtn');
    if (addManualEmptyBtn) {
        addManualEmptyBtn.addEventListener('click', () => openSemesterModal());
    }

    // Clear all button
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => clearAllSemesters());
    }

    // Modal handlers
    setupModalHandlers();
}

/**
 * Setup modal handlers
 */
function setupModalHandlers() {
    const modal = document.getElementById('semesterModal');
    const closeBtn = document.getElementById('semesterModalClose');
    const cancelBtn = document.getElementById('semesterModalCancel');
    const saveBtn = document.getElementById('semesterModalSave');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSemesterModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeSemesterModal);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveSemesterFromModal);
    }

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSemesterModal();
            }
        });
    }
}

/**
 * Open semester modal for add/edit
 */
let editingSemesterId = null;

function openSemesterModal(semester = null) {
    const modal = document.getElementById('semesterModal');
    const titleEl = document.getElementById('semesterModalTitle');

    if (!modal) return;

    // Set title
    if (titleEl) {
        titleEl.textContent = semester ? 'Edit Semester' : 'Add Semester';
    }

    // Populate fields if editing
    if (semester) {
        editingSemesterId = semester.id;
        document.getElementById('editSemesterName').value = semester.name || '';
        document.getElementById('editSemesterYear').value = semester.year || new Date().getFullYear();
        document.getElementById('editSemesterGPA').value = semester.gpa || '';
        document.getElementById('editSemesterCredits').value = semester.credits || '';
    } else {
        editingSemesterId = null;
        document.getElementById('editSemesterName').value = '';
        document.getElementById('editSemesterYear').value = new Date().getFullYear();
        document.getElementById('editSemesterGPA').value = '';
        document.getElementById('editSemesterCredits').value = '';
    }

    modal.classList.add('active');
    document.getElementById('editSemesterName').focus();
}

/**
 * Close semester modal
 */
function closeSemesterModal() {
    const modal = document.getElementById('semesterModal');
    if (modal) {
        modal.classList.remove('active');
    }
    editingSemesterId = null;
}

/**
 * Save semester from modal
 */
function saveSemesterFromModal() {
    const name = document.getElementById('editSemesterName').value.trim();
    const year = parseInt(document.getElementById('editSemesterYear').value);
    const gpa = parseFloat(document.getElementById('editSemesterGPA').value);
    const credits = parseInt(document.getElementById('editSemesterCredits').value);

    // Validate
    const validation = window.Utils.validateSemester({ name, year, gpa, credits });
    if (!validation.valid) {
        window.Utils.showToast('Validation Error', validation.errors[0], 'error');
        return;
    }

    if (editingSemesterId) {
        // Update existing semester
        window.Storage.updateSemester(editingSemesterId, { name, year, gpa, credits });
        window.Utils.showToast('Semester Updated', `${name} has been updated`, 'success');
    } else {
        // Add new semester
        window.Storage.addSemester({ name, year, gpa, credits });
        window.Utils.showToast('Semester Added', `${name} has been added`, 'success');
    }

    closeSemesterModal();
    updateDisplay();
}

/**
 * Edit semester
 */
function editSemester(id) {
    const semester = window.Storage.getSemesterById(id);
    if (semester) {
        openSemesterModal(semester);
    }
}

/**
 * Delete semester
 */
function deleteSemester(id) {
    const semester = window.Storage.getSemesterById(id);
    if (!semester) return;

    window.Utils.showConfirmModal(
        'Delete Semester',
        `Are you sure you want to delete "${semester.name} ${semester.year}"? This cannot be undone.`,
        () => {
            window.Storage.deleteSemester(id);
            window.Utils.showToast('Semester Deleted', `${semester.name} has been removed`, 'success');
            updateDisplay();
        }
    );
}

/**
 * Clear all semesters
 */
function clearAllSemesters() {
    const semesters = window.Storage.getSemesters();
    if (semesters.length === 0) {
        window.Utils.showToast('Nothing to Clear', 'No semesters to remove', 'info');
        return;
    }

    window.Utils.showConfirmModal(
        'Clear All Semesters',
        'This will permanently delete all semester data. Are you sure?',
        () => {
            window.Storage.saveSemesters([]);
            window.Utils.showToast('All Data Cleared', 'All semesters have been removed', 'success');
            updateDisplay();
        }
    );
}

/**
 * Update all display elements
 */
function updateDisplay() {
    const semesters = window.Storage.getSemesters();
    const stats = window.Storage.getStatistics();

    // Update CGPA circle
    updateCGPACircle(stats.cgpa);

    // Update stats
    const completedEl = document.getElementById('completedSemesters');
    if (completedEl) completedEl.textContent = stats.completedSemesters;

    const creditsEl = document.getElementById('totalCreditsAll');
    if (creditsEl) creditsEl.textContent = stats.totalCredits;

    const gradePointsEl = document.getElementById('totalGradePoints');
    if (gradePointsEl) gradePointsEl.textContent = stats.totalGradePoints.toFixed(1);

    // Update performance badge
    const performanceText = document.getElementById('performanceText');
    if (performanceText) {
        performanceText.textContent = window.Utils.getPerformanceRating(stats.cgpa);
    }

    // Render semesters list
    renderSemestersList(semesters);
}

/**
 * Update CGPA circle visualization
 */
function updateCGPACircle(cgpa) {
    const circleEl = document.getElementById('cgpaCircle');
    const valueEl = document.getElementById('cgpaValue');

    if (valueEl) {
        // Animate the number
        const currentValue = parseFloat(valueEl.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();
        const range = cgpa - currentValue;

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = currentValue + (range * easeOut);
            valueEl.textContent = current.toFixed(2);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // Update circle progress
    if (circleEl) {
        // SVG circle: radius = 45, circumference = 2 * π * 45 ≈ 283
        const circumference = 283;
        const progress = (cgpa / 10) * circumference;
        circleEl.style.strokeDashoffset = circumference - progress;
    }
}

/**
 * Render semesters list
 */
function renderSemestersList(semesters) {
    const container = document.getElementById('semestersList');
    const emptyState = document.getElementById('emptySemesters');

    if (!container) return;

    if (semesters.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = semesters.map((semester, index) => `
        <div class="semester-item-card animate-fade-in-up" style="animation-delay: ${index * 0.05}s">
            <div class="semester-item-info">
                <span class="semester-item-title">${escapeHtml(semester.name)} ${semester.year}</span>
                <span class="semester-item-details">${semester.credits || 0} credits</span>
            </div>
            <div class="semester-item-gpa-value">${semester.gpa?.toFixed(2) || '0.00'}</div>
            <div class="semester-item-actions">
                <button class="edit-btn" onclick="editSemester('${semester.id}')" title="Edit semester">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteSemester('${semester.id}')" title="Delete semester">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.editSemester = editSemester;
window.deleteSemester = deleteSemester;
