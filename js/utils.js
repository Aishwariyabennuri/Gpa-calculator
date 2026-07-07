/**
 * GPATrack - Utility Functions
 * Common utilities for calculations, validation, and UI helpers
 */

window.Utils = {
    // ==================== Grade System ====================
    GRADE_POINTS: {
        'O': 10,
        'A+': 9,
        'A': 8,
        'B+': 7,
        'B': 6,
        'C': 5,
        'F': 0
    },

    /**
     * Get grade points for a grade
     * @param {string} grade - Grade letter
     * @returns {number} Grade points
     */
    getGradePoints(grade) {
        return this.GRADE_POINTS[grade] ?? 0;
    },

    /**
     * Calculate GPA from subjects array
     * @param {Array} subjects - Array of subject objects {credits, grade}
     * @returns {number} GPA value
     */
    calculateGPA(subjects) {
        if (!subjects || subjects.length === 0) return 0;

        let totalCredits = 0;
        let totalGradePoints = 0;

        subjects.forEach(subject => {
            const credits = parseFloat(subject.credits) || 0;
            const gradePoints = this.getGradePoints(subject.grade);
            totalCredits += credits;
            totalGradePoints += credits * gradePoints;
        });

        if (totalCredits === 0) return 0;
        return parseFloat((totalGradePoints / totalCredits).toFixed(2));
    },

    /**
     * Calculate CGPA from semesters array
     * @param {Array} semesters - Array of semester objects {gpa, credits}
     * @returns {number} CGPA value
     */
    calculateCGPA(semesters) {
        if (!semesters || semesters.length === 0) return 0;

        let totalCredits = 0;
        let totalGradePoints = 0;

        semesters.forEach(semester => {
            const credits = parseFloat(semester.credits) || 0;
            const gpa = parseFloat(semester.gpa) || 0;
            totalCredits += credits;
            totalGradePoints += gpa * credits;
        });

        if (totalCredits === 0) return 0;
        return parseFloat((totalGradePoints / totalCredits).toFixed(2));
    },

    /**
     * Calculate percentage from GPA (approximate)
     * @param {number} gpa - GPA value
     * @returns {number} Percentage
     */
    gpaToPercentage(gpa) {
        return parseFloat((gpa * 9.5).toFixed(2));
    },

    /**
     * Predict graduation CGPA
     * @param {number} currentCGPA - Current CGPA
     * @param {number} completedSemesters - Number of completed semesters
     * @param {number} totalSemesters - Total number of semesters
     * @param {number} expectedGPA - Expected average GPA for remaining semesters
     * @returns {number} Predicted CGPA
     */
    predictGraduationCGPA(currentCGPA, completedSemesters, totalSemesters, expectedGPA) {
        if (completedSemesters >= totalSemesters) return currentCGPA;

        const remainingSemesters = totalSemesters - completedSemesters;
        const predictedCGPA = ((currentCGPA * completedSemesters) + (expectedGPA * remainingSemesters)) / totalSemesters;

        return parseFloat(predictedCGPA.toFixed(2));
    },

    /**
     * Calculate required GPA to achieve target CGPA
     * @param {number} currentCGPA - Current CGPA
     * @param {number} completedSemesters - Number of completed semesters
     * @param {number} totalSemesters - Total number of semesters
     * @param {number} targetCGPA - Target graduation CGPA
     * @returns {number} Required GPA per remaining semester
     */
    calculateRequiredGPA(currentCGPA, completedSemesters, totalSemesters, targetCGPA) {
        if (completedSemesters >= totalSemesters) return 0;

        const remainingSemesters = totalSemesters - completedSemesters;
        const requiredGPA = ((targetCGPA * totalSemesters) - (currentCGPA * completedSemesters)) / remainingSemesters;

        return parseFloat(requiredGPA.toFixed(2));
    },

    // ==================== Validation ====================

    /**
     * Validate subject input
     * @param {Object} subject - Subject object {name, credits, grade}
     * @returns {Object} {valid: boolean, errors: string[]}
     */
    validateSubject(subject) {
        const errors = [];

        if (!subject.name || subject.name.trim() === '') {
            errors.push('Subject name is required');
        }

        if (!subject.credits || subject.credits < 1 || subject.credits > 10) {
            errors.push('Credits must be between 1 and 10');
        }

        if (!subject.grade || !this.GRADE_POINTS.hasOwnProperty(subject.grade)) {
            errors.push('Invalid grade selected');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate semester input
     * @param {Object} semester - Semester object {name, year, gpa, credits}
     * @returns {Object} {valid: boolean, errors: string[]}
     */
    validateSemester(semester) {
        const errors = [];

        if (!semester.name || semester.name.trim() === '') {
            errors.push('Semester name is required');
        }

        if (!semester.year || semester.year < 2000 || semester.year > 2100) {
            errors.push('Year must be between 2000 and 2100');
        }

        if (semester.gpa !== undefined) {
            if (isNaN(semester.gpa) || semester.gpa < 0 || semester.gpa > 10) {
                errors.push('GPA must be between 0 and 10');
            }
        }

        if (semester.credits !== undefined) {
            if (!semester.credits || semester.credits < 1 || semester.credits > 30) {
                errors.push('Credits must be between 1 and 30');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Check for duplicate subject names
     * @param {Array} subjects - Array of subjects
     * @param {string} name - Name to check
     * @param {string} excludeId - ID to exclude from check
     * @returns {boolean} True if duplicate exists
     */
    isDuplicateSubjectName(subjects, name, excludeId = null) {
        return subjects.some(s =>
            s.name.toLowerCase() === name.toLowerCase() && s.id !== excludeId
        );
    },

    // ==================== Toast Notifications ====================

    /**
     * Show toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Type: success, error, warning, info
     * @param {number} duration - Duration in ms (default: 3000)
     */
    showToast(title, message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(title)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'fadeInRight 0.2s ease reverse forwards';
            setTimeout(() => toast.remove(), 200);
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.remove();
        });
    },

    // ==================== Modal Dialogs ====================

    /**
     * Show confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Modal message
     * @param {Function} onConfirm - Callback on confirm
     */
    showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');
        const closeBtn = document.getElementById('confirmClose');

        if (!modal) return;

        titleEl.textContent = title;
        messageEl.textContent = message;

        modal.classList.add('active');

        const closeModal = () => {
            modal.classList.remove('active');
            // Remove event listeners
            confirmBtn.replaceWith(confirmBtn.cloneNode(true));
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            closeBtn.replaceWith(closeBtn.cloneNode(true));
        };

        document.getElementById('confirmOk').addEventListener('click', () => {
            closeModal();
            if (typeof onConfirm === 'function') onConfirm();
        });

        document.getElementById('confirmCancel').addEventListener('click', closeModal);
        document.getElementById('confirmClose').addEventListener('click', closeModal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    },

    // ==================== Theme ====================

    /**
     * Toggle dark/light theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        window.Storage.saveTheme(newTheme);

        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    },

    /**
     * Apply saved theme
     */
    applyTheme() {
        const savedTheme = window.Storage.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    },

    // ==================== Navigation ====================

    /**
     * Toggle mobile navigation
     */
    toggleMobileNav() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');

        if (navMenu && navToggle) {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        }
    },

    /**
     * Handle navbar scroll effects
     */
    handleNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    },

    /**
     * Handle back to top button visibility
     */
    handleBackToTop() {
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    },

    // ==================== Helpers ====================

    /**
     * Escape HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Get performance rating based on CGPA
     * @param {number} cgpa - CGPA value
     * @returns {string} Performance rating
     */
    getPerformanceRating(cgpa) {
        if (cgpa >= 9.5) return 'Outstanding';
        if (cgpa >= 9.0) return 'Excellent';
        if (cgpa >= 8.5) return 'Very Good';
        if (cgpa >= 8.0) return 'Good';
        if (cgpa >= 7.0) return 'Above Average';
        if (cgpa >= 6.0) return 'Average';
        if (cgpa >= 5.0) return 'Below Average';
        return 'Needs Improvement';
    },

    /**
     * Get CSS class for GPA color
     * @param {number} gpa - GPA value
     * @returns {string} CSS class
     */
    getGPAClass(gpa) {
        if (gpa >= 9) return 'excellent';
        if (gpa >= 8) return 'good';
        if (gpa >= 7) return 'average';
        if (gpa >= 6) return 'below-average';
        return 'poor';
    },

    /**
     * Get motivational message based on context
     * @param {number} predictedCGPA - Predicted CGPA
     * @param {number} currentCGPA - Current CGPA
     * @param {number} requiredGPA - Required GPA (optional)
     * @returns {string} Motivational message
     */
    getMotivationalMessage(predictedCGPA, currentCGPA, requiredGPA = null) {
        const messages = {
            improvement: [
                "You're on the path to excellence! Keep up the great work.",
                "Amazing! Your dedication will pay off. Stay focused!",
                "That's the spirit! Your future self will thank you.",
                "Incredible growth potential! Keep pushing forward."
            ],
            maintain: [
                "Consistency is key! Stay on track.",
                "Great work! Keep maintaining your performance.",
                "You're doing well! Continue the momentum."
            ],
            challenge: [
                "It's challenging but not impossible. Push your limits!",
                "With determination, you can achieve this goal!",
                "Nothing worth having comes easy. Keep trying!",
                "Believe in yourself! You're capable of more."
            ],
            difficult: [
                "This is a tough goal. Consider adjusting your target.",
                "Every expert was once a beginner. Start somewhere!",
                "Set realistic milestones. Progress is progress!"
            ]
        };

        if (requiredGPA !== null) {
            if (requiredGPA > 10) {
                return "This target requires more than maximum GPA. Consider adjusting your goal.";
            }
            if (requiredGPA >= 9.5) {
                return this.getRandomMessage(messages.difficult);
            }
            if (requiredGPA >= 8) {
                return this.getRandomMessage(messages.challenge);
            }
        }

        if (predictedCGPA >= currentCGPA + 0.5) {
            return this.getRandomMessage(messages.improvement);
        }

        if (predictedCGPA >= currentCGPA) {
            return this.getRandomMessage(messages.maintain);
        }

        return this.getRandomMessage(messages.challenge);
    },

    /**
     * Get random message from array
     * @param {Array} messages - Array of messages
     * @returns {string} Random message
     */
    getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    },

    /**
     * Animate number counting
     * @param {HTMLElement} element - Element to update
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Duration in ms
     */
    animateCount(element, start, end, duration = 500) {
        const startTime = performance.now();
        const range = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (range * easeOut);

            element.textContent = current.toFixed(2);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    },

    /**
     * Parse URL parameters
     * @returns {Object} URL parameters object
     */
    getUrlParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Initialize common UI elements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    window.Utils.applyTheme();

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => window.Utils.toggleTheme());
    }

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => window.Utils.toggleMobileNav());
    }

    // Scroll handlers
    window.addEventListener('scroll', () => {
        window.Utils.handleNavbarScroll();
        window.Utils.handleBackToTop();
    });

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Close mobile nav on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');
            if (navMenu && navMenu.classList.contains('active')) {
                window.Utils.toggleMobileNav();
            }
        });
    });
});
