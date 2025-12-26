/**
 * ============================================
 * DASHBOARD COMPONENT - VISTA 1
 * ============================================
 * Top Performers + Needs Attention + Team Metrics
 */

/**
 * Render Dashboard View
 * @param {Array} employees - Array of employee performance data
 * @param {object} teamMetrics - Team aggregate metrics
 */
function renderDashboard(employees, teamMetrics) {
    if (!employees || !employees.length) {
        showError('No employee data available');
        return;
    }

    // Calculate team averages
    const teamAverages = {
        sales: teamMetrics.totalSales / employees.length,
        avgTicket: teamMetrics.totalSales / teamMetrics.totalTransactions,
        upt: teamMetrics.totalQty / teamMetrics.totalTransactions
    };

    // Enrich employees with ratings and status
    const enrichedEmployees = employees.map(emp => {
        const rating = calculateRating(emp, teamAverages);
        const status = calculateStatus(emp, rating.rating);

        // Get HR data if available
        const hrData = getHREmployee(emp.employee);
        const tenureMonths = hrData ? calculateTenure(hrData.data_assunzione) : 0;
        const experience = getExperienceLevel(tenureMonths);
        const employeeType = getEmployeeType(hrData?.ore_settimanali);

        return {
            ...emp,
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
        };
    });

    // Sort by rating score
    const sorted = [...enrichedEmployees].sort((a, b) => b.ratingScore - a.ratingScore);

    // Top 3 performers
    const topPerformers = sorted.slice(0, 3);

    // Bottom 3 (needs attention) - but only show if rating C or D
    const needsAttention = sorted
        .filter(emp => emp.rating === 'C' || emp.rating === 'D')
        .slice(-3)
        .reverse();

    // Render Top Performers
    renderTopPerformers(topPerformers);

    // Render Needs Attention
    renderNeedsAttention(needsAttention);

    // Render Team Metrics
    renderTeamMetrics(teamMetrics, enrichedEmployees);

    // Show dashboard view
    showView('dashboard');
}

/**
 * Render Top Performers list
 * @param {Array} performers - Top performers
 */
function renderTopPerformers(performers) {
    const container = document.getElementById('topPerformersContainer');
    if (!container) return;

    if (!performers || !performers.length) {
        container.innerHTML = '<p style="text-align: center; color: #95a5a6; padding: 20px;">No data available</p>';
        return;
    }

    const html = performers.map((emp, index) => `
        <div class="performer-item" onclick="showEmployeeDetail('${emp.employee}')">
            <div class="performer-info">
                <div class="performer-rank">${['🥇', '🥈', '🥉'][index] || (index + 1)}</div>
                <div>
                    <div class="performer-name">${emp.employee}</div>
                    <div class="performer-metric">${formatCurrency(emp.totalSales, true)} • ${emp.ratingStars} ${emp.rating}</div>
                </div>
            </div>
            <div>
                <span class="performer-badge badge-success">${emp.vsTeam > 0 ? '+' : ''}${emp.vsTeam}% vs team</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Render Needs Attention list
 * @param {Array} performers - Underperformers
 */
function renderNeedsAttention(performers) {
    const container = document.getElementById('needsAttentionContainer');
    if (!container) return;

    if (!performers || !performers.length) {
        container.innerHTML = '<p style="text-align: center; color: #27ae60; padding: 20px;">✅ All employees performing well!</p>';
        return;
    }

    const html = performers.map((emp, index) => `
        <div class="performer-item" onclick="showEmployeeDetail('${emp.employee}')">
            <div class="performer-info">
                <div class="performer-rank">${emp.statusIcon}</div>
                <div>
                    <div class="performer-name">${emp.employee}</div>
                    <div class="performer-metric">${formatCurrency(emp.totalSales, true)} • ${emp.ratingStars} ${emp.rating}</div>
                </div>
            </div>
            <div>
                <span class="performer-badge ${emp.rating === 'D' ? 'badge-danger' : 'badge-warning'}">${emp.vsTeam}% vs team</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Render Team Metrics
 * @param {object} teamMetrics - Team aggregate metrics
 * @param {Array} employees - All employees
 */
function renderTeamMetrics(teamMetrics, employees) {
    const container = document.getElementById('teamMetricsContainer');
    if (!container) return;

    // Calculate average growth
    const employeesWithGrowth = employees.filter(e => e.growth != null && isFinite(e.growth));
    const avgGrowth = employeesWithGrowth.length > 0
        ? employeesWithGrowth.reduce((sum, e) => sum + e.growth, 0) / employeesWithGrowth.length
        : 0;

    const avgTicket = teamMetrics.totalSales / teamMetrics.totalTransactions;
    const avgUPT = teamMetrics.totalQty / teamMetrics.totalTransactions;

    const html = `
        <div class="metric-item">
            <div class="metric-label">Total Sales</div>
            <div class="metric-value">${formatCurrency(teamMetrics.totalSales, true)}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Employees</div>
            <div class="metric-value">${employees.length}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Avg Ticket</div>
            <div class="metric-value">${formatCurrency(avgTicket, false)}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Avg UPT</div>
            <div class="metric-value">${avgUPT.toFixed(2)}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Team Trend</div>
            <div class="metric-value">
                <span class="${avgGrowth >= 0 ? 'trend-up' : 'trend-down'}">
                    ${getTrendArrow(avgGrowth)} ${formatPercent(avgGrowth)}
                </span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Export data for payroll
 */
function exportData() {
    if (!window.currentEmployees || !window.currentEmployees.length) {
        showToast('No data to export', 'error');
        return;
    }

    const exportData = window.currentEmployees.map(emp => ({
        Name: emp.employee,
        Sales: emp.totalSales,
        Transactions: emp.totalTransactions,
        'Avg Ticket': emp.avgTicket,
        UPT: emp.upt,
        'Growth %': emp.growth || 0,
        Rating: emp.rating,
        Status: emp.status
    }));

    const filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
}
