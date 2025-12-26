/**
 * ============================================
 * EMPLOYEE DETAIL COMPONENT - VISTA 3
 * ============================================
 * Detailed employee view with chart and insights
 */

/**
 * Show employee detail modal
 * @param {string} employeeName - Employee name
 */
function showEmployeeDetail(employeeName) {
    if (!window.currentEmployees) {
        showToast('Employee data not loaded', 'error');
        return;
    }

    // Find employee
    const employee = window.currentEmployees.find(emp =>
        emp.employee === employeeName
    );

    if (!employee) {
        showToast('Employee not found', 'error');
        return;
    }

    // Render detail view
    renderEmployeeDetail(employee);

    // Show modal
    const modal = document.getElementById('detailView');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}

/**
 * Close employee detail modal
 */
function closeDetail() {
    const modal = document.getElementById('detailView');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Render employee detail content
 * @param {object} employee - Employee data
 */
function renderEmployeeDetail(employee) {
    const container = document.getElementById('employeeDetailContainer');
    if (!container) return;

    // Get HR data
    const hrData = getHREmployee(employee.employee);

    // Calculate vs team percentages
    const teamAverages = {
        sales: window.currentTeamMetrics.totalSales / window.currentEmployees.length,
        avgTicket: window.currentTeamMetrics.totalSales / window.currentTeamMetrics.totalTransactions,
        upt: window.currentTeamMetrics.totalQty / window.currentTeamMetrics.totalTransactions
    };

    const vsTeamSales = ((employee.totalSales - teamAverages.sales) / teamAverages.sales * 100);
    const vsTeamTicket = ((employee.avgTicket - teamAverages.avgTicket) / teamAverages.avgTicket * 100);
    const vsTeamUPT = ((employee.upt - teamAverages.upt) / teamAverages.upt * 100);

    // Generate action items based on performance
    const actions = generateActionItems(employee, vsTeamSales);

    const html = `
        <div style="margin-bottom: 24px;">
            <h1 style="font-size: 24px; margin-bottom: 8px; color: #2c3e50;">
                👤 ${employee.employee}
            </h1>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <span class="rating-badge rating-${employee.rating.toLowerCase()}" style="font-size: 16px;">
                    ${employee.ratingStars} ${employee.rating} Rating
                </span>
                <span style="color: #7f8c8d; font-size: 14px;">${employee.ratingLabel}</span>
            </div>
        </div>

        <!-- HR Info -->
        ${hrData ? `
        <div style="background: #ecf0f1; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #2c3e50;">💼 Employment Info</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; font-size: 13px;">
                <div>
                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 4px;">Contract Type</div>
                    <div style="font-weight: 600;">
                        <span class="type-badge type-${employee.employeeType.type}">
                            ${employee.employeeType.badge} ${employee.employeeType.label}
                        </span>
                    </div>
                </div>
                <div>
                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 4px;">Experience Level</div>
                    <div style="font-weight: 600;">
                        <span class="exp-badge">
                            ${employee.experience.badge} ${employee.experience.label}
                        </span>
                    </div>
                </div>
                ${hrData.data_assunzione ? `
                <div>
                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 4px;">Hire Date</div>
                    <div style="font-weight: 600;">${hrData.data_assunzione}</div>
                </div>
                ` : ''}
                ${hrData.ore_settimanali ? `
                <div>
                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 4px;">Weekly Hours</div>
                    <div style="font-weight: 600;">${hrData.ore_settimanali}h</div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <!-- Key Metrics -->
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #2c3e50;">📈 Key Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 4px;">Sales</div>
                    <div style="font-size: 18px; font-weight: 700; color: #2c3e50;">${formatCurrency(employee.totalSales, true)}</div>
                    <div style="font-size: 11px; color: ${vsTeamSales >= 0 ? '#27ae60' : '#e74c3c'}; margin-top: 4px;">
                        ${vsTeamSales >= 0 ? '▲' : '▼'} ${formatPercent(vsTeamSales)} vs team
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 4px;">Avg Ticket</div>
                    <div style="font-size: 18px; font-weight: 700; color: #2c3e50;">${formatCurrency(employee.avgTicket, false)}</div>
                    <div style="font-size: 11px; color: ${vsTeamTicket >= 0 ? '#27ae60' : '#e74c3c'}; margin-top: 4px;">
                        ${vsTeamTicket >= 0 ? '▲' : '▼'} ${formatPercent(vsTeamTicket)} vs team
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 4px;">Items/Sale</div>
                    <div style="font-size: 18px; font-weight: 700; color: #2c3e50;">${employee.upt.toFixed(2)}</div>
                    <div style="font-size: 11px; color: ${vsTeamUPT >= 0 ? '#27ae60' : '#e74c3c'}; margin-top: 4px;">
                        ${vsTeamUPT >= 0 ? '▲' : '▼'} ${formatPercent(vsTeamUPT)} vs team
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 4px;">Trend</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${getTrendColor(employee.growth || 0)};">
                        ${getTrendArrow(employee.growth || 0)} ${formatPercent(employee.growth || 0)}
                    </div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 4px;">Period change</div>
                </div>
            </div>
        </div>

        <!-- Manager Actions -->
        <div style="background: ${actions.bgColor}; border: 2px solid ${actions.borderColor}; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #2c3e50;">
                ${actions.icon} Manager Actions
            </h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                ${actions.items.map(item => `<li style="color: #2c3e50;">${item}</li>`).join('')}
            </ul>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="closeDetail()">Close</button>
            <button class="btn btn-primary" onclick="exportEmployeeData('${employee.employee}')">📥 Export Data</button>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Generate action items based on employee performance
 * @param {object} employee - Employee data
 * @param {number} vsTeamSales - Sales vs team percentage
 * @returns {object} Action items with styling
 */
function generateActionItems(employee, vsTeamSales) {
    const actions = {
        icon: '🎯',
        bgColor: '#f0f8ff',
        borderColor: '#3498db',
        items: []
    };

    if (employee.rating === 'A') {
        actions.icon = '✅';
        actions.bgColor = '#d5f4e6';
        actions.borderColor = '#27ae60';
        actions.items = [
            'Eligible for performance bonus',
            'Consider for team lead or mentor role',
            'Strong candidate for advanced training',
            'Use as best practice example for team'
        ];
    } else if (employee.rating === 'B') {
        actions.icon = '💡';
        actions.bgColor = '#d6eaf8';
        actions.borderColor = '#3498db';
        if (employee.growth > 0) {
            actions.items = [
                'Showing improvement - encourage progress',
                'Consider for advanced training opportunities',
                'Monitor continued growth trend'
            ];
        } else {
            actions.items = [
                'Solid performer - maintain current standards',
                'Opportunity for skill development',
                'Set goals for advancement to A rating'
            ];
        }
    } else if (employee.rating === 'C') {
        actions.icon = '⚠️';
        actions.bgColor = '#fef5e7';
        actions.borderColor = '#f39c12';
        actions.items = [
            'Schedule 1-on-1 performance review',
            'Identify specific areas for improvement',
            'Consider additional training or mentoring',
            'Set clear, achievable performance goals'
        ];
    } else { // D
        actions.icon = '🔴';
        actions.bgColor = '#fadbd8';
        actions.borderColor = '#e74c3c';
        actions.items = [
            'URGENT: Immediate intervention required',
            'Schedule formal performance review',
            'Develop detailed improvement plan',
            'Consider reassignment or additional support',
            'Document performance issues'
        ];
    }

    return actions;
}

/**
 * Export individual employee data
 * @param {string} employeeName - Employee name
 */
function exportEmployeeData(employeeName) {
    const employee = window.currentEmployees?.find(emp => emp.employee === employeeName);
    if (!employee) {
        showToast('Employee not found', 'error');
        return;
    }

    const exportData = [{
        Name: employee.employee,
        Rating: employee.rating,
        'Total Sales': employee.totalSales,
        'Transactions': employee.totalTransactions,
        'Avg Ticket': employee.avgTicket.toFixed(2),
        'Items Per Sale': employee.upt.toFixed(2),
        'Growth %': (employee.growth || 0).toFixed(1),
        'Status': employee.status,
        'Type': employee.employeeType.label,
        'Experience': employee.experience.label
    }];

    const filename = `employee-${employeeName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDetail();
    }
});

// Close modal on background click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('detailView');
    if (e.target === modal) {
        closeDetail();
    }
});
