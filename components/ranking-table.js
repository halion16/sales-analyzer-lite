/**
 * ============================================
 * RANKING TABLE COMPONENT - VISTA 2
 * ============================================
 * Employee ranking table with filters
 */

// Table state
let currentSort = { column: 'sales', direction: 'desc' };
let filteredEmployees = [];

/**
 * Render Ranking Table View
 * @param {Array} employees - Array of employee performance data
 */
function renderRankingTable(employees) {
    if (!employees || !employees.length) {
        showError('No employee data available');
        return;
    }

    // Store for filtering
    filteredEmployees = [...employees];

    // Populate shop filter
    populateShopFilter(employees);

    // Setup event listeners
    setupTableFilters();

    // Render table
    updateTable();

    // Show ranking view
    showView('ranking');
}

/**
 * Populate shop filter dropdown
 * @param {Array} employees - All employees
 */
function populateShopFilter(employees) {
    const shopFilter = document.getElementById('filterShop');
    if (!shopFilter) return;

    // Get unique shops
    const shops = new Set();
    employees.forEach(emp => {
        if (emp.shops) {
            emp.shops.forEach(shop => shops.add(shop));
        }
    });

    // Build options
    let html = '<option value="all">🏪 All Shops</option>';
    Array.from(shops).sort().forEach(shop => {
        html += `<option value="${shop}">${shop}</option>`;
    });

    shopFilter.innerHTML = html;
}

/**
 * Setup table filter event listeners
 */
function setupTableFilters() {
    // Search filter
    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            applyFilters();
        }, 300));
    }

    // Shop filter
    const shopFilter = document.getElementById('filterShop');
    if (shopFilter) {
        shopFilter.addEventListener('change', applyFilters);
    }

    // Type filter
    const typeFilter = document.getElementById('filterType');
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
}

/**
 * Apply all filters
 */
function applyFilters() {
    if (!window.currentEmployees) return;

    let filtered = [...window.currentEmployees];

    // Search filter
    const searchTerm = document.getElementById('searchEmployee')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(emp =>
            emp.employee.toLowerCase().includes(searchTerm)
        );
    }

    // Shop filter
    const shopFilter = document.getElementById('filterShop')?.value;
    if (shopFilter && shopFilter !== 'all') {
        filtered = filtered.filter(emp =>
            emp.shops && emp.shops.has(shopFilter)
        );
    }

    // Type filter
    const typeFilter = document.getElementById('filterType')?.value;
    if (typeFilter && typeFilter !== 'all') {
        if (typeFilter === 'active') {
            filtered = filtered.filter(emp => emp.isActive !== false);
        } else if (typeFilter === 'full-time') {
            filtered = filtered.filter(emp => emp.employeeType?.type === 'full');
        } else if (typeFilter === 'part-time') {
            filtered = filtered.filter(emp => emp.employeeType?.type === 'part');
        }
    }

    filteredEmployees = filtered;
    updateTable();
}

/**
 * Update table with current filtered data
 */
function updateTable() {
    const tbody = document.getElementById('employeeTableBody');
    const summary = document.getElementById('employeeCount');

    if (!tbody) return;

    // Sort data
    const sorted = sortEmployees(filteredEmployees, currentSort.column, currentSort.direction);

    // Render rows
    const html = sorted.map((emp, index) => `
        <tr onclick="showEmployeeDetail('${emp.employee}')">
            <td>
                <div style="font-weight: 600;">${emp.employee}</div>
                ${emp.shops && emp.shops.size > 1 ? `<div style="font-size: 11px; color: #95a5a6;">${emp.shops.size} shops</div>` : ''}
            </td>
            <td style="text-align: right; font-weight: 700;">${formatCurrency(emp.totalSales, true)}</td>
            <td>
                <span class="rating-badge rating-${emp.rating.toLowerCase()}">
                    ${emp.ratingStars} ${emp.rating}
                </span>
            </td>
            <td style="color: ${getTrendColor(emp.growth || 0)}; font-weight: 600;">
                ${getTrendArrow(emp.growth || 0)} ${formatPercent(emp.growth || 0)}
            </td>
            <td style="text-align: right;">${formatCurrency(emp.avgTicket, false)}</td>
            <td>
                <span class="type-badge type-${emp.employeeType.type}">
                    ${emp.employeeType.badge} ${emp.employeeType.label}
                </span>
            </td>
            <td>
                <span class="exp-badge">
                    ${emp.experience.badge} ${emp.experience.label}
                </span>
            </td>
            <td>
                <span class="status-indicator status-${emp.status.toLowerCase().replace(' ', '-')}">
                    ${emp.statusIcon} ${emp.status}
                </span>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = html || '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #95a5a6;">No employees match the current filters</td></tr>';

    // Update summary
    if (summary) {
        summary.textContent = `${sorted.length} employee${sorted.length !== 1 ? 's' : ''}`;
    }

    // Update sort icons
    updateSortIcons();
}

/**
 * Sort employees by column
 * @param {Array} employees - Employees to sort
 * @param {string} column - Column name
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted employees
 */
function sortEmployees(employees, column, direction) {
    const sorted = [...employees].sort((a, b) => {
        let aVal, bVal;

        switch (column) {
            case 'name':
                aVal = a.employee;
                bVal = b.employee;
                break;
            case 'sales':
                aVal = a.totalSales;
                bVal = b.totalSales;
                break;
            case 'rating':
                aVal = a.ratingScore;
                bVal = b.ratingScore;
                break;
            case 'trend':
                aVal = a.growth != null ? a.growth : -Infinity;
                bVal = b.growth != null ? b.growth : -Infinity;
                break;
            case 'ticket':
                aVal = a.avgTicket;
                bVal = b.avgTicket;
                break;
            default:
                aVal = a.totalSales;
                bVal = b.totalSales;
        }

        if (typeof aVal === 'string') {
            return direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        } else {
            return direction === 'asc'
                ? aVal - bVal
                : bVal - aVal;
        }
    });

    return sorted;
}

/**
 * Handle table column sort
 * @param {string} column - Column name
 */
function sortTable(column) {
    // Toggle direction if same column
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'desc'; // Default to descending
    }

    updateTable();
}

/**
 * Update sort icons in table headers
 */
function updateSortIcons() {
    document.querySelectorAll('.employee-table th').forEach(th => {
        const sortIcon = th.querySelector('.sort-icon');
        if (sortIcon) {
            sortIcon.textContent = '⇅';
            sortIcon.style.opacity = '0.3';
        }
    });

    // Highlight active sort
    const headers = document.querySelectorAll('.employee-table th');
    headers.forEach(th => {
        const onclick = th.getAttribute('onclick');
        if (onclick && onclick.includes(currentSort.column)) {
            const sortIcon = th.querySelector('.sort-icon');
            if (sortIcon) {
                sortIcon.textContent = currentSort.direction === 'asc' ? '▲' : '▼';
                sortIcon.style.opacity = '1';
            }
        }
    });
}
