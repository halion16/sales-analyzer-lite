/**
 * ============================================
 * UTILITY FUNCTIONS - SALES ANALYZER LITE
 * ============================================
 */

/**
 * Format currency in EUR
 * @param {number} amount - Amount to format
 * @param {boolean} compact - Use compact notation (K, M)
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, compact = false) {
    if (compact && amount >= 1000) {
        if (amount >= 1000000) {
            return '€' + (amount / 1000000).toFixed(1) + 'M';
        } else {
            return '€' + (amount / 1000).toFixed(0) + 'K';
        }
    }
    return '€' + amount.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

/**
 * Format number with Italian locale
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimals
 * @returns {string} Formatted number
 */
function formatNumber(num, decimals = 0) {
    return num.toLocaleString('it-IT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {boolean} showSign - Show + sign for positive
 * @returns {string} Formatted percentage
 */
function formatPercent(value, showSign = true) {
    const sign = showSign && value > 0 ? '+' : '';
    return sign + value.toFixed(1) + '%';
}

/**
 * Get trend arrow based on value
 * @param {number} value - Trend value (percentage)
 * @returns {string} Arrow emoji
 */
function getTrendArrow(value) {
    if (value > 10) return '↗';
    if (value > 0) return '→';
    if (value > -10) return '→';
    return '↘';
}

/**
 * Get trend color based on value
 * @param {number} value - Trend value (percentage)
 * @returns {string} Color code
 */
function getTrendColor(value) {
    if (value > 0) return '#27ae60';
    if (value < 0) return '#e74c3c';
    return '#95a5a6';
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type ('success', 'error', 'info')
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show loading overlay
 * @param {boolean} show - Show or hide
 */
function showLoading(show = true) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showError(message) {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');

    if (errorState && errorMessage) {
        errorMessage.textContent = message;
        errorState.style.display = 'block';
    }

    // Hide loading
    showLoading(false);
}

/**
 * Hide all views
 */
function hideAllViews() {
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
}

/**
 * Show specific view
 * @param {string} viewName - View name ('dashboard', 'ranking', 'detail')
 */
function showView(viewName) {
    // Hide all views first
    hideAllViews();

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Show requested view
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.style.display = 'block';
    }

    // Hide loading/error states
    showLoading(false);
    const errorState = document.getElementById('errorState');
    if (errorState) errorState.style.display = 'none';
}

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {string} filename - Filename
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data || !data.length) {
        showToast('No data to export', 'error');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export completed!', 'success');
}

/**
 * Add CSS animations
 */
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .view {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Add animations on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addAnimations);
} else {
    addAnimations();
}
