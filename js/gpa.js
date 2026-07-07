/**
 * GPATrack - GPA Calculator
 * Handles semester GPA calculation with subject management
 */

// Current subjects being entered (not yet saved)
let currentSubjects = [];

document.addEventListener('DOMContentLoaded', () => {
    initGPACalculator();
});

/**
 * Initialize GPA Calculator
 */
function initGPACalculator() {
    // Set current year
    const yearInput = document.getElementById('semesterYear');
    if (yearInput) {
        yearInput.value = new Date().getFullYear();
    }

    // Event listeners
    setupEventListeners();

    // Initialize display
    updateDisplay();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Add subject button
    const addBtn = document.getElementById('addSubjectBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => addSubject());
    }

    // Enter key on inputs
    ['subjectName', 'subjectCredits', 'subjectGrade'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addSubject();
            });
        }
    });

    // Clear all button
    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => clearAll());
    }

    // Save semester button
    const saveBtn = document.getElementById('saveSemesterBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveSemester());
    }
}

/**
 * Add a subject to the list
 */
function addSubject() {
    const nameInput = document.getElementById('subjectName');
    const creditsInput = document.getElementById('subjectCredits');
    const gradeSelect = document.getElementById('subjectGrade');

    // Get values
    const name = nameInput.value.trim();
    const credits = parseInt(creditsInput.value);
    const grade = gradeSelect.value;

    // Validate
    const validation = window.Utils.validateSubject({ name, credits, grade });
    if (!validation.valid) {
        window.Utils.showToast('Validation Error', validation.errors[0], 'error');
        return;
    }

    // Check for duplicates
    if (window.Utils.isDuplicateSubjectName(currentSubjects, name)) {
        window.Utils.showToast('Duplicate Subject', 'A subject with this name already exists', 'warning');
        return;
    }

    // Add subject
    const subject = {
        id: generateId(),
        name,
        credits,
        grade
    };

    currentSubjects.push(subject);

    // Clear inputs
    nameInput.value = '';
    creditsInput.value = '';
    gradeSelect.value = '';
    nameInput.focus();

    // Update display
    updateDisplay();

    // Show success toast
    window.Utils.showToast('Subject Added', `${name} added successfully`, 'success');
}

/**
 * Delete a subject
 */
function deleteSubject(id) {
    currentSubjects = currentSubjects.filter(s => s.id !== id);
    updateDisplay();
    window.Utils.showToast('Subject Removed', 'Subject has been removed', 'info');
}

/**
 * Clear all subjects
 */
function clearAll() {
    if (currentSubjects.length === 0) {
        window.Utils.showToast('Nothing to Clear', 'No subjects to remove', 'info');
        return;
    }

    window.Utils.showConfirmModal(
        'Clear All Subjects',
        'Are you sure you want to remove all subjects? This cannot be undone.',
        () => {
            currentSubjects = [];
            updateDisplay();
            window.Utils.showToast('Cleared', 'All subjects have been removed', 'success');
        }
    );
}

/**
 * Save semester to storage
 */
function saveSemester() {
    const nameInput = document.getElementById('semesterName');
    const yearInput = document.getElementById('semesterYear');

    const name = nameInput.value.trim();
    const year = parseInt(yearInput.value);

    // Validate
    if (!name) {
        window.Utils.showToast('Missing Information', 'Please enter a semester name', 'error');
        return;
    }

    if (currentSubjects.length === 0) {
        window.Utils.showToast('No Subjects', 'Please add at least one subject before saving', 'warning');
        return;
    }

    // Calculate GPA and credits
    const gpa = window.Utils.calculateGPA(currentSubjects);
    const totalCredits = currentSubjects.reduce((sum, s) => sum + s.credits, 0);
    const earnedCredits = currentSubjects
        .filter(s => s.grade !== 'F')
        .reduce((sum, s) => sum + s.credits, 0);

    // Create semester object
    const semester = {
        name,
        year,
        gpa,
        credits: totalCredits,
        earnedCredits,
        subjects: [...currentSubjects]
    };

    // Save to storage
    window.Storage.addSemester(semester);

    // Show success message
    window.Utils.showToast(
        'Semester Saved',
        `${name} ${year} saved with GPA ${gpa.toFixed(2)}`,
        'success'
    );

    // Clear form
    currentSubjects = [];
    nameInput.value = '';
    updateDisplay();
}

/**
 * Update all display elements
 */
function updateDisplay() {
    updateSubjectsTable();
    updateResults();
}

/**
 * Update the subjects table
 */
function updateSubjectsTable() {
    const tbody = document.getElementById('subjectsBody');
    const emptyTable = document.getElementById('emptyTable');
    const tableContainer = document.querySelector('.table-container');
    const countEl = document.getElementById('subjectCount');

    if (!tbody) return;

    // Update count
    if (countEl) {
        countEl.textContent = `${currentSubjects.length} subject${currentSubjects.length !== 1 ? 's' : ''}`;
    }

    if (currentSubjects.length === 0) {
        tbody.innerHTML = '';
        if (emptyTable) emptyTable.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
        return;
    }

    if (emptyTable) emptyTable.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'block';

    tbody.innerHTML = currentSubjects.map((subject, index) => {
        const gradePoints = window.Utils.getGradePoints(subject.grade);
        const isFailed = subject.grade === 'F';

        return `
            <tr class="${isFailed ? 'failed-subject' : ''} animate-fade-in">
                <td>${index + 1}</td>
                <td>${escapeHtml(subject.name)} ${isFailed ? '<span class="badge badge-danger">Failed</span>' : ''}</td>
                <td class="center">${subject.credits}</td>
                <td class="center">
                    <span class="grade-badge grade-${subject.grade.replace('+', 'plus')}">${subject.grade}</span>
                </td>
                <td class="center">${(gradePoints * subject.credits).toFixed(1)}</td>
                <td class="center">
                    <button class="action-btn delete" onclick="deleteSubject('${subject.id}')" title="Delete subject">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update results display
 */
function updateResults() {
    const gpa = window.Utils.calculateGPA(currentSubjects);
    const totalCredits = currentSubjects.reduce((sum, s) => sum + s.credits, 0);
    const earnedCredits = currentSubjects
        .filter(s => s.grade !== 'F')
        .reduce((sum, s) => sum + s.credits, 0);
    const totalGradePoints = currentSubjects.reduce((sum, s) => {
        return sum + (window.Utils.getGradePoints(s.grade) * s.credits);
    }, 0);

    const failedCount = currentSubjects.filter(s => s.grade === 'F').length;
    const percentage = window.Utils.gpaToPercentage(gpa);

    // Update elements
    const gpaEl = document.getElementById('semesterGPA');
    if (gpaEl) gpaEl.textContent = gpa.toFixed(2);

    const creditsEl = document.getElementById('totalCreditsSem');
    if (creditsEl) creditsEl.textContent = totalCredits;

    const earnedEl = document.getElementById('earnedCredits');
    if (earnedEl) earnedEl.textContent = earnedCredits;

    const percentageEl = document.getElementById('percentage');
    if (percentageEl) percentageEl.textContent = `${percentage.toFixed(2)}%`;

    // Failed subjects warning
    const failedWarning = document.getElementById('failedWarning');
    const failedCountEl = document.getElementById('failedCount');

    if (failedWarning) {
        if (failedCount > 0) {
            failedWarning.style.display = 'flex';
            if (failedCountEl) failedCountEl.textContent = failedCount;
        } else {
            failedWarning.style.display = 'none';
        }
    }
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make deleteSubject available globally
window.deleteSubject = deleteSubject;
