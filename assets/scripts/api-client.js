/**
 * ============================================
 * API CLIENT - SALES ANALYZER LITE
 * ============================================
 * Simplified API client with essential functions
 */

// API Configuration
const API_CONFIG = {
    // BestStore API endpoints (from PRO version)
    BESTSTORE_BASE: 'https://www.beststoreaziende.it/BSMWebService/api',
    EMPLOYEES_ENDPOINT: '/Movimenti/GetVenditeOperatore',

    // HR Integration endpoints (if needed)
    HR_ENDPOINT: null, // Set if HR API available

    // Default parameters
    DEFAULT_PARAMS: {
        gruppo: 'VBP',
        da: null, // Will be set dynamically
        a: null   // Will be set dynamically
    }
};

// Global state for HR data
let hrEmployeesData = [];
let hrSalesMapping = {};

/**
 * Fetch sales data from BestStore API
 * @param {string} startDate - Start date (DD/MM/YYYY)
 * @param {string} endDate - End date (DD/MM/YYYY)
 * @returns {Promise<Array>} Sales data
 */
async function fetchSalesData(startDate, endDate) {
    try {
        const params = new URLSearchParams({
            gruppo: API_CONFIG.DEFAULT_PARAMS.gruppo,
            da: startDate,
            a: endDate
        });

        const response = await fetch(
            `${API_CONFIG.BESTSTORE_BASE}${API_CONFIG.EMPLOYEES_ENDPOINT}?${params}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        throw error;
    }
}

/**
 * Load HR data from CSV file
 * @param {string} csvPath - Path to HR CSV file
 * @returns {Promise<Array>} HR employees data
 */
async function loadHRData(csvPath = './hr-data.csv') {
    try {
        const response = await fetch(csvPath);
        if (!response.ok) {
            console.warn('HR data not found, continuing without HR integration');
            return [];
        }

        const csvText = await response.text();
        hrEmployeesData = parseHRCSV(csvText);
        buildHRSalesMapping();
        return hrEmployeesData;
    } catch (error) {
        console.warn('Error loading HR data:', error);
        return [];
    }
}

/**
 * Parse HR CSV data
 * @param {string} csvText - Raw CSV text
 * @returns {Array} Parsed HR data
 */
function parseHRCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const employee = {};
        headers.forEach((header, index) => {
            employee[header] = values[index] || '';
        });
        return employee;
    });
}

/**
 * Build mapping between sales names and HR names
 */
function buildHRSalesMapping() {
    hrEmployeesData.forEach(emp => {
        const salesName = emp['Nome in Sales CSV'] || emp.nome_sales || '';
        const hrName = emp['Nome HR'] || emp.nome || emp.employee || '';
        if (salesName && hrName) {
            hrSalesMapping[salesName.toUpperCase()] = hrName;
        }
    });
}

/**
 * Get HR employee data by name
 * @param {string} employeeName - Employee name from sales data
 * @returns {object|null} HR employee data or null
 */
function getHREmployee(employeeName) {
    if (!hrEmployeesData.length) return null;

    // Try direct match first
    let hrEmp = hrEmployeesData.find(emp =>
        (emp.nome || emp.employee || '').toUpperCase() === employeeName.toUpperCase()
    );

    // Try sales mapping
    if (!hrEmp) {
        const mappedName = hrSalesMapping[employeeName.toUpperCase()];
        if (mappedName) {
            hrEmp = hrEmployeesData.find(emp =>
                (emp.nome || emp.employee || '').toUpperCase() === mappedName.toUpperCase()
            );
        }
    }

    return hrEmp || null;
}

/**
 * Calculate employee rating (A/B/C/D)
 * Simplified version of Fair Score from PRO
 * @param {object} employee - Employee performance data
 * @param {object} teamAverages - Team average metrics
 * @returns {object} {rating: 'A'|'B'|'C'|'D', score: number, label: string, color: string}
 */
function calculateRating(employee, teamAverages) {
    let score = 0;
    let weights = { sales: 0.4, growth: 0.3, ticket: 0.15, upt: 0.15 };

    // 1. Sales Performance (40%)
    const salesRatio = employee.totalSales / teamAverages.sales;
    const salesScore = Math.min(100, salesRatio * 100);
    score += salesScore * weights.sales;

    // 2. Growth (30%)
    if (employee.growth != null && isFinite(employee.growth)) {
        const growthScore = Math.max(0, Math.min(100, 50 + employee.growth));
        score += growthScore * weights.growth;
    } else {
        score += 50 * weights.growth; // Neutral if no growth data
    }

    // 3. Avg Ticket (15%)
    const ticketRatio = employee.avgTicket / teamAverages.avgTicket;
    const ticketScore = Math.min(100, ticketRatio * 100);
    score += ticketScore * weights.ticket;

    // 4. UPT (15%)
    const uptRatio = employee.upt / teamAverages.upt;
    const uptScore = Math.min(100, uptRatio * 100);
    score += uptScore * weights.upt;

    // Determine rating letter
    let rating, label, color, stars;
    if (score >= 75) {
        rating = 'A';
        label = 'Top Performer';
        color = '#27ae60';
        stars = '⭐⭐⭐';
    } else if (score >= 55) {
        rating = 'B';
        label = 'Strong';
        color = '#3498db';
        stars = '⭐⭐';
    } else if (score >= 40) {
        rating = 'C';
        label = 'Needs Help';
        color = '#f39c12';
        stars = '⭐';
    } else {
        rating = 'D';
        label = 'Critical';
        color = '#e74c3c';
        stars = '☆';
    }

    return { rating, score, label, color, stars };
}

/**
 * Calculate employee status based on performance
 * @param {object} employee - Employee data
 * @param {string} rating - Employee rating (A/B/C/D)
 * @returns {object} {status: string, icon: string, color: string}
 */
function calculateStatus(employee, rating) {
    const growth = employee.growth || 0;

    if (rating === 'A') {
        return {
            status: 'Excellent',
            icon: '✅',
            color: '#27ae60'
        };
    } else if (rating === 'B') {
        if (growth > 0) {
            return { status: 'Improving', icon: '📈', color: '#3498db' };
        } else {
            return { status: 'Strong', icon: '✅', color: '#3498db' };
        }
    } else if (rating === 'C') {
        return {
            status: 'Needs Help',
            icon: '⚠️',
            color: '#f39c12'
        };
    } else {
        return {
            status: 'Critical',
            icon: '🔴',
            color: '#e74c3c'
        };
    }
}

/**
 * Get experience level from tenure months
 * @param {number} tenureMonths - Months of experience
 * @returns {object} {level: string, label: string, badge: string}
 */
function getExperienceLevel(tenureMonths) {
    if (!tenureMonths || tenureMonths < 0) {
        return { level: 'unknown', label: 'Unknown', badge: '?' };
    }

    if (tenureMonths < 3) {
        return { level: 'new-hire', label: 'New Hire', badge: '🌱' };
    } else if (tenureMonths < 12) {
        return { level: 'junior', label: 'Junior', badge: '📚' };
    } else if (tenureMonths < 24) {
        return { level: 'mid', label: 'Established', badge: '💼' };
    } else if (tenureMonths < 48) {
        return { level: 'specialist', label: 'Specialist', badge: '⭐' };
    } else if (tenureMonths < 84) {
        return { level: 'senior', label: 'Senior', badge: '🏆' };
    } else {
        return { level: 'expert', label: 'Expert', badge: '👑' };
    }
}

/**
 * Calculate tenure in months from hire date
 * @param {string} hireDate - Hire date (DD/MM/YYYY or ISO)
 * @returns {number} Tenure in months
 */
function calculateTenure(hireDate) {
    if (!hireDate) return 0;

    try {
        // Parse Italian date format DD/MM/YYYY
        let hireDateObj;
        if (hireDate.includes('/')) {
            const [day, month, year] = hireDate.split('/');
            hireDateObj = new Date(year, month - 1, day);
        } else {
            hireDateObj = new Date(hireDate);
        }

        const today = new Date();
        const months = (today.getFullYear() - hireDateObj.getFullYear()) * 12 +
                      (today.getMonth() - hireDateObj.getMonth());
        return Math.max(0, months);
    } catch (error) {
        console.warn('Error calculating tenure:', error);
        return 0;
    }
}

/**
 * Determine if employee is full-time or part-time
 * @param {number} weeklyHours - Weekly hours
 * @returns {object} {type: 'full'|'part', label: string, badge: string, color: string}
 */
function getEmployeeType(weeklyHours) {
    if (!weeklyHours || weeklyHours >= 35) {
        return {
            type: 'full',
            label: 'Full-time',
            badge: '🟢',
            color: '#27ae60'
        };
    } else {
        return {
            type: 'part',
            label: 'Part-time',
            badge: '🔵',
            color: '#3498db'
        };
    }
}
