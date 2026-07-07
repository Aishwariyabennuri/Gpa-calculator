/**
 * GPATrack - Local Storage Management
 * Handles all data persistence using browser Local Storage
 */

window.Storage = {
    // Storage Keys
    KEYS: {
        SEMESTERS: 'gpatrack_semesters',
        THEME: 'gpatrack_theme',
        SETTINGS: 'gpatrack_settings',
        SUBJECTS: 'gpatrack_subjects',
        SCENARIOS: 'gpatrack_scenarios'
    },

    // Default Settings
    DEFAULT_SETTINGS: {
        totalCreditsRequired: 160,
        totalSemesters: 8,
        theme: 'light'
    },

    /**
     * Initialize storage with default values if empty
     */
    init() {
        if (!this.get(this.KEYS.SEMESTERS)) {
            this.set(this.KEYS.SEMESTERS, []);
        }
        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, this.DEFAULT_SETTINGS);
        }
        if (!this.get(this.KEYS.SCENARIOS)) {
            this.set(this.KEYS.SCENARIOS, []);
        }
        // Load saved theme
        const savedTheme = this.get(this.KEYS.THEME);
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    },

    /**
     * Get data from local storage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    /**
     * Set data in local storage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    /**
     * Remove data from local storage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    /**
     * Clear all app data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
        this.init();
    },

    // ==================== Semesters ====================

    /**
     * Get all semesters
     * @returns {Array} Array of semester objects
     */
    getSemesters() {
        return this.get(this.KEYS.SEMESTERS) || [];
    },

    /**
     * Save all semesters
     * @param {Array} semesters - Array of semester objects
     */
    saveSemesters(semesters) {
        this.set(this.KEYS.SEMESTERS, semesters);
    },

    /**
     * Add a new semester
     * @param {Object} semester - Semester object
     * @returns {Object} Added semester with generated ID
     */
    addSemester(semester) {
        const semesters = this.getSemesters();
        semester.id = this.generateId();
        semester.createdAt = new Date().toISOString();
        semesters.push(semester);
        this.saveSemesters(semesters);
        return semester;
    },

    /**
     * Update an existing semester
     * @param {string} id - Semester ID
     * @param {Object} updates - Updated fields
     * @returns {Object|null} Updated semester or null
     */
    updateSemester(id, updates) {
        const semesters = this.getSemesters();
        const index = semesters.findIndex(s => s.id === id);
        if (index !== -1) {
            semesters[index] = { ...semesters[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveSemesters(semesters);
            return semesters[index];
        }
        return null;
    },

    /**
     * Delete a semester
     * @param {string} id - Semester ID
     * @returns {boolean} Success status
     */
    deleteSemester(id) {
        const semesters = this.getSemesters();
        const filtered = semesters.filter(s => s.id !== id);
        if (filtered.length !== semesters.length) {
            this.saveSemesters(filtered);
            return true;
        }
        return false;
    },

    /**
     * Get semester by ID
     * @param {string} id - Semester ID
     * @returns {Object|null} Semester object or null
     */
    getSemesterById(id) {
        const semesters = this.getSemesters();
        return semesters.find(s => s.id === id) || null;
    },

    // ==================== Settings ====================

    /**
     * Get settings
     * @returns {Object} Settings object
     */
    getSettings() {
        return this.get(this.KEYS.SETTINGS) || this.DEFAULT_SETTINGS;
    },

    /**
     * Update settings
     * @param {Object} updates - Updated settings
     */
    updateSettings(updates) {
        const settings = this.getSettings();
        this.set(this.KEYS.SETTINGS, { ...settings, ...updates });
    },

    // ==================== Theme ====================

    /**
     * Get current theme
     * @returns {string} Theme name
     */
    getTheme() {
        return this.get(this.KEYS.THEME) || 'light';
    },

    /**
     * Save theme preference
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        this.set(this.KEYS.THEME, theme);
    },

    // ==================== Scenarios ====================

    /**
     * Get all scenarios
     * @returns {Array} Array of scenario objects
     */
    getScenarios() {
        return this.get(this.KEYS.SCENARIOS) || [];
    },

    /**
     * Save scenarios
     * @param {Array} scenarios - Array of scenario objects
     */
    saveScenarios(scenarios) {
        this.set(this.KEYS.SCENARIOS, scenarios);
    },

    /**
     * Add a scenario
     * @param {Object} scenario - Scenario object
     * @returns {Object} Added scenario with ID
     */
    addScenario(scenario) {
        const scenarios = this.getScenarios();
        scenario.id = this.generateId();
        scenario.createdAt = new Date().toISOString();
        scenarios.push(scenario);
        this.saveScenarios(scenarios);
        return scenario;
    },

    /**
     * Delete a scenario
     * @param {string} id - Scenario ID
     * @returns {boolean} Success status
     */
    deleteScenario(id) {
        const scenarios = this.getScenarios();
        const filtered = scenarios.filter(s => s.id !== id);
        this.saveScenarios(filtered);
        return true;
    },

    // ==================== Helpers ====================

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Export all data as JSON
     * @returns {string} JSON string
     */
    exportData() {
        const data = {
            semesters: this.getSemesters(),
            scenarios: this.getScenarios(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    /**
     * Import data from JSON
     * @param {string} jsonString - JSON data string
     * @returns {boolean} Success status
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.semesters) this.saveSemesters(data.semesters);
            if (data.scenarios) this.saveScenarios(data.scenarios);
            if (data.settings) this.set(this.KEYS.SETTINGS, data.settings);
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    },

    /**
     * Get statistics summary
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const semesters = this.getSemesters();
        const settings = this.getSettings();

        if (semesters.length === 0) {
            return {
                cgpa: 0,
                totalCredits: 0,
                totalGradePoints: 0,
                completedSemesters: 0,
                highestGPA: 0,
                lowestGPA: 0,
                averageGPA: 0,
                bestSemester: null,
                worstSemester: null,
                remainingSemesters: settings.totalSemesters,
                creditsCompleted: 0,
                creditsRemaining: settings.totalCreditsRequired,
                progressPercentage: 0
            };
        }

        // Calculate total credits and grade points
        let totalCredits = 0;
        let totalGradePoints = 0;
        const gpas = [];

        semesters.forEach(semester => {
            totalCredits += semester.credits || 0;
            totalGradePoints += (semester.gpa || 0) * (semester.credits || 0);
            if (semester.gpa) gpas.push(semester.gpa);
        });

        // Calculate CGPA
        const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;

        // Find highest and lowest GPA
        const sortedByGPA = [...semesters].sort((a, b) => (b.gpa || 0) - (a.gpa || 0));
        const highestGPA = sortedByGPA[0]?.gpa || 0;
        const lowestGPA = sortedByGPA[sortedByGPA.length - 1]?.gpa || 0;

        // Average GPA
        const averageGPA = gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0;

        // Best and worst semesters
        const bestSemester = sortedByGPA[0] ? `${sortedByGPA[0].name} ${sortedByGPA[0].year}` : null;
        const worstSemester = sortedByGPA[sortedByGPA.length - 1] ?
            `${sortedByGPA[sortedByGPA.length - 1].name} ${sortedByGPA[sortedByGPA.length - 1].year}` : null;

        // Progress calculations
        const creditsCompleted = totalCredits;
        const creditsRemaining = Math.max(0, settings.totalCreditsRequired - creditsCompleted);
        const progressPercentage = Math.min(100, (creditsCompleted / settings.totalCreditsRequired) * 100);

        return {
            cgpa: parseFloat(cgpa.toFixed(2)),
            totalCredits,
            totalGradePoints,
            completedSemesters: semesters.length,
            highestGPA: parseFloat(highestGPA.toFixed(2)),
            lowestGPA: parseFloat(lowestGPA.toFixed(2)),
            averageGPA: parseFloat(averageGPA.toFixed(2)),
            bestSemester,
            worstSemester,
            remainingSemesters: Math.max(0, settings.totalSemesters - semesters.length),
            creditsCompleted,
            creditsRemaining,
            progressPercentage: parseFloat(progressPercentage.toFixed(1))
        };
    }
};

// Initialize storage on load
window.Storage.init();
