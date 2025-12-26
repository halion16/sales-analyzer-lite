/**
 * ============================================
 * MAIN APP CONTROLLER - SALES ANALYZER LITE
 * ============================================
 * Coordinates data loading, view switching, and app state
 */

// Global state
window.currentEmployees = null;
window.currentTeamMetrics = null;
window.currentPeriod = null;

/**
 * Initialize app on load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Sales Analyzer LITE initializing...');

    // Setup navigation
    setupNavigation();

    // Setup refresh button
    setupRefreshButton();

    // Load initial data
    await loadData();
});

/**
 * Setup tab navigation
 */
function setupNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view === 'dashboard') {
                renderDashboard(window.currentEmployees, window.currentTeamMetrics);
            } else if (view === 'ranking') {
                renderRankingTable(window.currentEmployees);
            }
        });
    });
}

/**
 * Setup refresh button
 */
function setupRefreshButton() {
    const refreshBtn = document.getElementById('btnRefresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '🔄 Loading...';
            await loadData();
            refreshBtn.disabled = false;
            refreshBtn.textContent = '🔄 Refresh';
        });
    }
}

/**
 * Load and process data
 */
async function loadData() {
    try {
        showLoading(true);

        // For now, use mock data
        // Replace with actual API call: const data = await fetchSalesData(startDate, endDate);
        const mockData = generateMockData();

        // Load HR data (optional)
        try {
            await loadHRData();
        } catch (error) {
            console.warn('HR data not available, continuing without it');
        }

        // Process employee data
        const processed = processEmployeeData(mockData);

        // Store globally
        window.currentEmployees = processed.employees;
        window.currentTeamMetrics = processed.teamMetrics;
        window.currentPeriod = processed.period;

        console.log('✅ Data loaded:', {
            employees: processed.employees.length,
            totalSales: formatCurrency(processed.teamMetrics.totalSales, true)
        });

        // Show dashboard by default
        renderDashboard(processed.employees, processed.teamMetrics);

    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please try again.');
    }
}

/**
 * Process raw employee data
 * @param {Array} rawData - Raw sales data from API
 * @returns {object} Processed data with employees and team metrics
 */
function processEmployeeData(rawData) {
    // Aggregate by employee
    const employeeMap = {};

    rawData.forEach(record => {
        const empName = record.Venditore || record.employee;
        if (!empName) return;

        if (!employeeMap[empName]) {
            employeeMap[empName] = {
                employee: empName,
                totalSales: 0,
                totalTransactions: 0,
                totalQty: 0,
                shops: new Set(),
                periods: {},
                isActive: true
            };
        }

        const emp = employeeMap[empName];
        emp.totalSales += parseFloat(record.Importo || record.totalSales || 0);
        emp.totalTransactions += parseInt(record.NumDoc || record.transactions || 0);
        emp.totalQty += parseInt(record.Quantita || record.qty || 0);

        if (record.Negozio || record.shop) {
            emp.shops.add(record.Negozio || record.shop);
        }
    });

    // Convert to array and calculate metrics
    const employees = Object.values(employeeMap).map(emp => {
        emp.avgTicket = emp.totalSales / emp.totalTransactions;
        emp.upt = emp.totalQty / emp.totalTransactions;

        // Mock growth for now (would come from multi-period comparison)
        emp.growth = (Math.random() - 0.5) * 100; // -50% to +50%

        return emp;
    });

    // Calculate team metrics
    const teamMetrics = {
        totalSales: employees.reduce((sum, e) => sum + e.totalSales, 0),
        totalTransactions: employees.reduce((sum, e) => sum + e.totalTransactions, 0),
        totalQty: employees.reduce((sum, e) => sum + e.totalQty, 0)
    };

    // Calculate team averages
    const teamAverages = {
        sales: teamMetrics.totalSales / employees.length,
        avgTicket: teamMetrics.totalSales / teamMetrics.totalTransactions,
        upt: teamMetrics.totalQty / teamMetrics.totalTransactions
    };

    // Enrich employees with ratings and status
    employees.forEach(emp => {
        const rating = calculateRating(emp, teamAverages);
        const status = calculateStatus(emp, rating.rating);

        // Get HR data if available
        const hrData = getHREmployee(emp.employee);
        const tenureMonths = hrData ? calculateTenure(hrData.data_assunzione) : 0;
        const experience = getExperienceLevel(tenureMonths);
        const employeeType = getEmployeeType(hrData?.ore_settimanali);

        Object.assign(emp, {
            rating: rating.rating,
            ratingScore: rating.score,
            ratingLabel: rating.label,
            ratingColor: rating.color,
            ratingStars: rating.stars,
            status: status.status,
            statusIcon: status.icon,
            statusColor: status.color,
            experience: experience,
            employeeType: employeeType,
            vsTeam: ((emp.totalSales - teamAverages.sales) / teamAverages.sales * 100).toFixed(0)
        });
    });

    return {
        employees,
        teamMetrics,
        period: {
            start: new Date().toLocaleDateString('it-IT'),
            end: new Date().toLocaleDateString('it-IT')
        }
    };
}

/**
 * Generate mock data for testing
 * @returns {Array} Mock sales data
 */
function generateMockData() {
    const employees = [
        'SABRINA GRANDONI',
        'ANNA GRANDONI',
        'MARCO ROBERTI',
        'CRISTINA LUCARELLI',
        'MARINA GABRIELLI'
    ];

    const shops = ['0008-VALMONTONE', '0009-ROMA'];

    const mockData = [];

    employees.forEach(emp => {
        const numRecords = Math.floor(Math.random() * 50) + 50;
        for (let i = 0; i < numRecords; i++) {
            mockData.push({
                Venditore: emp,
                Negozio: shops[Math.floor(Math.random() * shops.length)],
                Importo: Math.random() * 500 + 50,
                NumDoc: 1,
                Quantita: Math.floor(Math.random() * 5) + 1
            });
        }
    });

    return mockData;
}

/**
 * Show help modal
 */
function showHelp() {
    alert(`
Sales Analyzer LITE - Quick Help

DASHBOARD:
- View top 3 performers and employees needing attention
- See key team metrics at a glance

TEAM RANKING:
- Full employee list with ratings (A/B/C/D)
- Filter by shop, employee type, or search by name
- Click any employee for detailed view

EMPLOYEE DETAIL:
- Click any employee row to see detailed metrics
- View vs team comparisons
- See suggested manager actions

Need more help? Contact your administrator.
    `);
}

/**
 * Show about modal
 */
function showAbout() {
    alert(`
Sales Analyzer LITE v1.0

A simplified sales analytics tool for retail managers.

Features:
✅ Quick dashboard with top/bottom performers
✅ Simple A/B/C/D rating system
✅ Mobile-friendly design
✅ Export capabilities
✅ HR integration (tenure, contract type)

Powered by BestStore API
© 2025 - Built with ❤️ by Claude Code
    `);
}
