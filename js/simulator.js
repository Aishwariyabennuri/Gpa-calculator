/**
 * GPATrack - What-If Simulator
 * Predicts graduation CGPA and calculates required GPA for targets
 */

document.addEventListener('DOMContentLoaded', () => {
    initSimulator();
});

/**
 * Initialize Simulator
 */
function initSimulator() {
    setupEventListeners();
    loadSavedData();
    loadScenarios();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Prediction form
    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.addEventListener('click', calculatePrediction);
    }

    // Use saved CGPA buttons
    const useSavedBtn = document.getElementById('useSavedCGPA');
    if (useSavedBtn) {
        useSavedBtn.addEventListener('click', () => {
            const stats = window.Storage.getStatistics();
            document.getElementById('currentCGPAInput').value = stats.cgpa.toFixed(2);
        });
    }

    const useSavedTargetBtn = document.getElementById('useSavedCGPATarget');
    if (useSavedTargetBtn) {
        useSavedTargetBtn.addEventListener('click', () => {
            const stats = window.Storage.getStatistics();
            document.getElementById('currentCGPATarget').value = stats.cgpa.toFixed(2);
        });
    }

    // Target calculator
    const calculateTargetBtn = document.getElementById('calculateTargetBtn');
    if (calculateTargetBtn) {
        calculateTargetBtn.addEventListener('click', calculateTarget);
    }

    // Scenario handlers
    const addScenarioBtn = document.getElementById('addScenarioBtn');
    if (addScenarioBtn) {
        addScenarioBtn.addEventListener('click', () => openScenarioModal());
    }

    setupScenarioModalHandlers();
}

/**
 * Load saved data
 */
function loadSavedData() {
    const stats = window.Storage.getStatistics();
    const settings = window.Storage.getSettings();

    // Populate completed semesters
    const completedInput = document.getElementById('completedSemestersInput');
    const completedTargetInput = document.getElementById('completedSemestersTarget');

    if (completedInput) completedInput.value = stats.completedSemesters || '';
    if (completedTargetInput) completedTargetInput.value = stats.completedSemesters || '';

    // Populate total semesters
    const totalInput = document.getElementById('totalSemestersInput');
    const totalTargetInput = document.getElementById('totalSemestersTarget');

    if (totalInput) totalInput.value = settings.totalSemesters || 8;
    if (totalTargetInput) totalTargetInput.value = settings.totalSemesters || 8;
}

/**
 * Calculate CGPA prediction
 */
function calculatePrediction() {
    const currentCGPA = parseFloat(document.getElementById('currentCGPAInput').value);
    const completedSemesters = parseInt(document.getElementById('completedSemestersInput').value);
    const totalSemesters = parseInt(document.getElementById('totalSemestersInput').value);
    const expectedGPA = parseFloat(document.getElementById('expectedGPAInput').value);

    // Validate inputs
    if (isNaN(currentCGPA) || currentCGPA < 0 || currentCGPA > 10) {
        window.Utils.showToast('Invalid Input', 'Please enter a valid current CGPA (0-10)', 'error');
        return;
    }

    if (isNaN(completedSemesters) || completedSemesters < 0) {
        window.Utils.showToast('Invalid Input', 'Please enter a valid number of completed semesters', 'error');
        return;
    }

    if (isNaN(totalSemesters) || totalSemesters < 1 || totalSemesters < completedSemesters) {
        window.Utils.showToast('Invalid Input', 'Total semesters must be greater than completed semesters', 'error');
        return;
    }

    if (isNaN(expectedGPA) || expectedGPA < 0 || expectedGPA > 10) {
        window.Utils.showToast('Invalid Input', 'Please enter a valid expected GPA (0-10)', 'error');
        return;
    }

    // Calculate prediction
    const predictedCGPA = window.Utils.predictGraduationCGPA(
        currentCGPA,
        completedSemesters,
        totalSemesters,
        expectedGPA
    );

    // Show result
    const resultContainer = document.getElementById('predictionResult');
    const predictedValueEl = document.getElementById('predictedCGPA');
    const changeContainer = document.getElementById('cgpaChangeContainer');
    const changeIcon = document.getElementById('changeIcon');
    const changeValue = document.getElementById('cgpaChangeValue');
    const motivationalMessage = document.getElementById('motivationalMessage');

    if (resultContainer) resultContainer.style.display = 'block';
    if (predictedValueEl) predictedValueEl.textContent = predictedCGPA.toFixed(2);

    // Calculate change
    const change = predictedCGPA - currentCGPA;
    if (changeContainer) {
        changeContainer.className = `result-change ${change >= 0 ? 'positive' : 'negative'}`;
        if (changeIcon) {
            changeIcon.className = change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        }
        if (changeValue) {
            changeValue.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
        }
    }

    // Motivational message
    if (motivationalMessage) {
        const message = window.Utils.getMotivationalMessage(predictedCGPA, currentCGPA);
        motivationalMessage.querySelector('p').textContent = message;
    }

    // Animate result
    resultContainer.classList.add('animate-fade-in-up');
}

/**
 * Calculate required GPA for target
 */
function calculateTarget() {
    const currentCGPA = parseFloat(document.getElementById('currentCGPATarget').value);
    const completedSemesters = parseInt(document.getElementById('completedSemestersTarget').value);
    const totalSemesters = parseInt(document.getElementById('totalSemestersTarget').value);
    const targetCGPA = parseFloat(document.getElementById('targetCGPAInput').value);

    // Validate inputs
    if (isNaN(currentCGPA) || currentCGPA < 0 || currentCGPA > 10) {
        window.Utils.showToast('Invalid Input', 'Please enter a valid current CGPA (0-10)', 'error');
        return;
    }

    if (isNaN(completedSemesters) || completedSemesters < 0) {
        window.Utils.showToast('Invalid Input', 'Please enter a valid number of completed semesters', 'error');
        return;
    }

    if (isNaN(totalSemesters) || totalSemesters < 1) {
        window.Utils.showToast('Invalid Input', 'Please enter a valid total number of semesters', 'error');
        return;
    }

    if (completedSemesters >= totalSemesters) {
        window.Utils.showToast('Invalid Input', 'All semesters already completed', 'warning');
        return;
    }

    if (isNaN(targetCGPA) || targetCGPA < 0 || targetCGPA > 10) {
        window.Utils.showToast('Invalid Input', 'Please enter a valid target CGPA (0-10)', 'error');
        return;
    }

    // Calculate required GPA
    const remainingSemesters = totalSemesters - completedSemesters;
    const requiredGPA = window.Utils.calculateRequiredGPA(
        currentCGPA,
        completedSemesters,
        totalSemesters,
        targetCGPA
    );

    // Show result
    const resultContainer = document.getElementById('targetResult');
    const requiredValueEl = document.getElementById('requiredGPA');
    const remainingSemsEl = document.getElementById('remainingSems');
    const improvementEl = document.getElementById('improvementNeeded');
    const feasibilityEl = document.getElementById('feasibilityBadge');
    const motivationalMessage = document.getElementById('targetMotivationalMessage');

    if (resultContainer) resultContainer.style.display = 'block';
    if (requiredValueEl) {
        requiredValueEl.textContent = requiredGPA > 10 ? '10.00+' : requiredGPA.toFixed(2);
        requiredValueEl.className = `result-value ${requiredGPA > 10 ? 'text-danger' : ''}`;
    }
    if (remainingSemsEl) remainingSemsEl.textContent = remainingSemesters;

    // Calculate improvement needed
    const improvement = requiredGPA - currentCGPA;
    if (improvementEl) {
        improvementEl.textContent = requiredGPA > currentCGPA ?
            `+${improvement.toFixed(2)} GPA` :
            `${improvement.toFixed(2)} GPA`;
    }

    // Determine feasibility
    if (feasibilityEl) {
        let feasibility, feasibilityClass;

        if (requiredGPA > 10) {
            feasibility = 'Not Achievable';
            feasibilityClass = 'difficult';
        } else if (requiredGPA >= 9.5) {
            feasibility = 'Very Challenging';
            feasibilityClass = 'difficult';
        } else if (requiredGPA >= 8.5) {
            feasibility = 'Challenging';
            feasibilityClass = 'challenging';
        } else if (requiredGPA >= 7) {
            feasibility = 'Achievable';
            feasibilityClass = 'achievable';
        } else {
            feasibility = 'Easily Achievable';
            feasibilityClass = 'achievable';
        }

        feasibilityEl.textContent = feasibility;
        feasibilityEl.className = `feasibility-badge ${feasibilityClass}`;
    }

    // Motivational message
    if (motivationalMessage) {
        const message = window.Utils.getMotivationalMessage(
            targetCGPA,
            currentCGPA,
            requiredGPA
        );
        motivationalMessage.querySelector('p').textContent = message;
    }

    // Animate result
    resultContainer.classList.add('animate-fade-in-up');
}

/**
 * Scenario Modal Handlers
 */
function setupScenarioModalHandlers() {
    const modal = document.getElementById('scenarioModal');
    const closeBtn = document.getElementById('scenarioModalClose');
    const cancelBtn = document.getElementById('scenarioModalCancel');
    const saveBtn = document.getElementById('scenarioModalSave');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeScenarioModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeScenarioModal);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveScenario);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeScenarioModal();
        });
    }
}

/**
 * Open scenario modal
 */
function openScenarioModal() {
    const modal = document.getElementById('scenarioModal');
    if (modal) {
        document.getElementById('scenarioName').value = '';
        document.getElementById('scenarioGPA').value = '';
        modal.classList.add('active');
        document.getElementById('scenarioName').focus();
    }
}

/**
 * Close scenario modal
 */
function closeScenarioModal() {
    const modal = document.getElementById('scenarioModal');
    if (modal) modal.classList.remove('active');
}

/**
 * Save scenario
 */
function saveScenario() {
    const name = document.getElementById('scenarioName').value.trim();
    const gpa = parseFloat(document.getElementById('scenarioGPA').value);

    if (!name) {
        window.Utils.showToast('Missing Name', 'Please enter a scenario name', 'error');
        return;
    }

    if (isNaN(gpa) || gpa < 0 || gpa > 10) {
        window.Utils.showToast('Invalid GPA', 'Please enter a valid GPA (0-10)', 'error');
        return;
    }

    // Get current stats for prediction
    const stats = window.Storage.getStatistics();
    const settings = window.Storage.getSettings();

    // Calculate predicted graduation CGPA for this scenario
    const predictedCGPA = window.Utils.predictGraduationCGPA(
        stats.cgpa || 0,
        stats.completedSemesters || 0,
        settings.totalSemesters || 8,
        gpa
    );

    // Save scenario
    window.Storage.addScenario({
        name,
        expectedGPA: gpa,
        predictedCGPA
    });

    closeScenarioModal();
    loadScenarios();

    window.Utils.showToast('Scenario Added', `${name} scenario has been added`, 'success');
}

/**
 * Delete scenario
 */
function deleteScenario(id) {
    window.Storage.deleteScenario(id);
    loadScenarios();
    window.Utils.showToast('Scenario Removed', 'Scenario has been removed', 'success');
}

/**
 * Load and render scenarios
 */
function loadScenarios() {
    const container = document.getElementById('scenariosGrid');
    const emptyState = document.getElementById('emptyScenarios');

    if (!container) return;

    const scenarios = window.Storage.getScenarios();

    if (scenarios.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Get settings for comparison
    const settings = window.Storage.getSettings();

    container.innerHTML = scenarios.map((scenario, index) => `
        <div class="scenario-card animate-fade-in-up" style="animation-delay: ${index * 0.05}s">
            <button class="scenario-remove" onclick="deleteScenario('${scenario.id}')" title="Remove scenario">
                <i class="fas fa-times"></i>
            </button>
            <div class="scenario-name">${escapeHtml(scenario.name)}</div>
            <div class="scenario-gpa">${scenario.predictedCGPA.toFixed(2)}</div>
            <div class="scenario-label">Predicted CGPA</div>
            <div class="scenario-label" style="margin-top: 4px;">(${scenario.expectedGPA} GPA/sem)</div>
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

// Make delete available globally
window.deleteScenario = deleteScenario;
