/**
 * ============================================
 * BESTSTORE & ECOSAGILE API INTEGRATION
 * ============================================
 * Extracted from Sales Analyzer PRO
 * Adapted for LITE version
 */

// ============================================================================
// BESTSTORE API INTEGRATION MODULE (with PHP Proxy on Port 8080)
// ============================================================================

/**
 * BestStore Base Service Class
 * Handles authentication and API calls to BestStore
 */
class BestStoreBaseService {
    constructor(credentials) {
        this.credentials = credentials;
        this.sessionId = null;
        this.sessionExpiry = null;
        this.proxyUrl = 'http://localhost:8080/proxy.php';
    }

    async login() {
        const targetUrl = `${this.credentials.baseUrl}/${this.credentials.apiVersion}/User/Login`;
        const url = `${this.proxyUrl}?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.credentials.username,
                password: this.credentials.password
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.ErrMessage) {
            throw new Error(`Login failed: ${data.ErrMessage}`);
        }

        if (!data.Result) {
            throw new Error('Login failed: No session ID returned');
        }

        this.sessionId = data.Result;
        this.sessionExpiry = Date.now() + 3600000; // 1 hour
        console.log('✅ BestStore login successful');
        return this.sessionId;
    }

    async getSessionId() {
        if (!this.sessionId || this.isSessionExpired()) {
            await this.login();
        }
        return this.sessionId;
    }

    isSessionExpired() {
        if (!this.sessionExpiry) return true;
        return Date.now() > this.sessionExpiry;
    }

    async post(endpoint, data) {
        await this.getSessionId();
        const targetUrl = `${this.credentials.baseUrl}/${this.credentials.apiVersion}/${endpoint}?SessionId=${this.sessionId}`;
        const url = `${this.proxyUrl}?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (result.ErrMessage && endpoint !== 'AsyncTask/GetTaskStatus') {
            throw new Error(`API Error: ${result.ErrMessage}`);
        }

        return result;
    }

    async get(url) {
        const proxyUrl = `${this.proxyUrl}?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.text();
    }
}

/**
 * BestStore Order Service Class
 * Handles transaction export with async polling pattern
 */
class BestStoreOrderService {
    constructor(baseService) {
        this.baseService = baseService;
    }

    async getTransactionsWithPolling(request, onProgress) {
        // Step 1: Request async transaction export
        if (onProgress) onProgress('Requesting transaction export...', 20);

        const params = {
            FromDate: request.fromDate,
            ToDate: request.toDate || request.fromDate
        };

        // Store and DocType must be ARRAYS
        if (request.stores && request.stores.length > 0) {
            params.Store = request.stores;
        }

        if (request.documentTypes && request.documentTypes.length > 0) {
            params.DocType = request.documentTypes;
        }

        console.log('[BestStore] Request params:', JSON.stringify(params, null, 2));

        // Call Order/GetTransactionAsync
        const response = await this.baseService.post('Order/GetTransactionAsync', params);

        if (!response.Result) {
            throw new Error('No TaskID returned from GetTransactionAsync');
        }

        const taskId = response.Result;
        console.log('[BestStore] TaskID received:', taskId);

        // Step 2: Poll AsyncTask/GetTaskStatus
        if (onProgress) onProgress('Processing export (this may take a few minutes)...', 30);

        let attempts = 0;
        const maxAttempts = 120; // 10 minutes max
        let taskStatus = null;
        let downloadUrl = null;

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

            const statusResponse = await this.baseService.post('AsyncTask/GetTaskStatus', taskId);

            taskStatus = statusResponse.Result?.TaskStatus;
            downloadUrl = statusResponse.Result?.DownloadUrl;

            console.log(`[BestStore POLL ${attempts}] TaskStatus: ${taskStatus}`);

            const progress = 30 + (attempts / maxAttempts * 50);

            // Check for error
            if (statusResponse.ErrMessage && taskStatus === 1) {
                throw new Error('Export failed: ' + statusResponse.ErrMessage);
            }

            if (taskStatus === 0) {
                // OK - Export ready!
                if (onProgress) onProgress('Export ready! Downloading CSV...', 85);

                if (!downloadUrl) {
                    throw new Error('Task completed but no download URL provided');
                }

                console.log('[BestStore] Download URL:', downloadUrl);

                // Step 3: Download CSV
                if (onProgress) onProgress('Downloading CSV file...', 90);
                const csvData = await this.baseService.get(downloadUrl);

                console.log('[BestStore] CSV downloaded:', csvData.length, 'bytes');

                if (onProgress) onProgress('Processing data...', 95);
                return csvData;
            }

            // TaskStatus 2 (PENDING) or 3 (RUNNING) - continue polling
            if (onProgress) {
                onProgress(`Processing export... (${attempts * 5}s)`, progress);
            }

            if (attempts >= maxAttempts) {
                throw new Error('Export timeout: Task took longer than 10 minutes');
            }
        }

        throw new Error('Export timeout: Task took longer than 10 minutes');
    }
}

/**
 * Main BestStoreAPI wrapper
 */
const BestStoreAPI = {
    baseService: null,
    orderService: null,

    // Initialize services
    init() {
        const credentials = {
            baseUrl: 'https://bswebapi.auteldom1.com',
            apiVersion: 'V2.6/api',
            username: 'bds.webapicrm',
            password: 'bds.e2eb'
        };

        this.baseService = new BestStoreBaseService(credentials);
        this.orderService = new BestStoreOrderService(this.baseService);
    },

    // Main workflow: request → poll → download
    async getTransactionData(fromDate, toDate, stores, onProgress) {
        try {
            // Initialize if not done
            if (!this.orderService) {
                this.init();
            }

            // Step 1: Login
            if (onProgress) onProgress('Connecting to BestStore API...', 10);
            await this.baseService.login();

            // Step 2-4: Get transactions with automatic polling
            const csvData = await this.orderService.getTransactionsWithPolling({
                fromDate: fromDate,
                toDate: toDate,
                stores: stores,
                documentTypes: ['VE', 'AR']
            }, onProgress);

            return { success: true, csvData: csvData };

        } catch (error) {
            console.error('❌ BestStore API Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Parse CSV data into structured format
     */
    parseCSV(csvData) {
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(';').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(';');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index]?.trim() || '';
            });
            data.push(row);
        }

        return data;
    }
};

// ============================================================================
// ECOSAGILE HR API INTEGRATION MODULE
// ============================================================================

/**
 * EcosAgile Base Service Class
 * Handles authentication and generic API calls to EcosAgile HR System
 */
class EcosAgileBaseService {
    constructor(credentials) {
        this.credentials = credentials;
        this.cachedToken = null;
        this.tokenExpiry = null;
        this.TOKEN_CACHE_DURATION = 3600000; // 1 hour in milliseconds
        this.validateCredentials();
    }

    validateCredentials() {
        const required = ['endpoint', 'instanceCode', 'userid', 'password', 'clientId'];
        const missing = required.filter(key => !this.credentials[key]);

        if (missing.length > 0) {
            throw new Error(`EcosAgile credentials incomplete. Missing: ${missing.join(', ')}`);
        }
    }

    /**
     * Get EcosAgile authentication token (with caching)
     */
    async getAuthToken(forceRefresh = false) {
        // Use cached token if valid
        if (!forceRefresh && this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            console.log('✅ Using cached EcosAgile token');
            return this.cachedToken;
        }

        console.log('🔐 Requesting new EcosAgile token...');

        const tokenUrl = `${this.credentials.endpoint}/${this.credentials.instanceCode}/api.pm?ApiName=TokenGet`;

        const formData = new URLSearchParams();
        formData.append('Userid', this.credentials.userid);
        formData.append('Password', this.credentials.password);
        formData.append('ClientID', this.credentials.clientId);

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const responseText = await response.text();
            const data = JSON.parse(responseText);

            // Check for EcosAgile errors
            if (data.ECOSAGILE_TABLE_DATA?.ECOSAGILE_ERROR_MESSAGE) {
                const error = data.ECOSAGILE_TABLE_DATA.ECOSAGILE_ERROR_MESSAGE;
                if (error.CODE === 'FAIL') {
                    throw new Error(`EcosAgile Error: ${error.USERMESSAGE || error.MESSAGE || 'Unknown error'}`);
                }
            }

            // Extract token
            const token = data.ECOSAGILE_TABLE_DATA?.ECOSAGILE_DATA?.ECOSAGILE_DATA_ROW?.AuthToken;

            if (!token) {
                throw new Error('Token not found in EcosAgile response');
            }

            // Cache the token
            this.cachedToken = token;
            this.tokenExpiry = Date.now() + this.TOKEN_CACHE_DURATION;

            console.log('✅ EcosAgile token obtained and cached');
            return token;

        } catch (error) {
            console.error('❌ Error obtaining token:', error.message);
            throw error;
        }
    }

    /**
     * Execute a generic EcosAgile API call
     */
    async callApi(apiName, params = {}, useToken = true) {
        try {
            let url = `${this.credentials.endpoint}/${this.credentials.instanceCode}/api.pm?ApiName=${apiName}`;

            // Add token if required
            if (useToken) {
                const token = await this.getAuthToken();
                url += `&AuthToken=${token}`;
            }

            const formData = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                formData.append(key, value);
            });

            console.log(`🌐 Calling EcosAgile API: ${apiName}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }

            const responseText = await response.text();
            const data = JSON.parse(responseText);

            // Check for EcosAgile errors
            if (data.ECOSAGILE_TABLE_DATA?.ECOSAGILE_ERROR_MESSAGE) {
                const error = data.ECOSAGILE_TABLE_DATA.ECOSAGILE_ERROR_MESSAGE;
                if (error.CODE === 'FAIL') {
                    return {
                        success: false,
                        error: error.USERMESSAGE || error.MESSAGE || 'EcosAgile Error',
                        rawResponse: data
                    };
                }
            }

            // Extract data
            let extractedData;

            if (data.ECOSAGILE_TABLE_DATA?.ECOSAGILE_DATA) {
                const ecosData = data.ECOSAGILE_TABLE_DATA.ECOSAGILE_DATA.ECOSAGILE_DATA_ROW;

                if (Array.isArray(ecosData)) {
                    extractedData = ecosData;
                } else if (ecosData) {
                    extractedData = [ecosData];
                } else {
                    extractedData = [];
                }
            } else {
                extractedData = [];
            }

            console.log(`✅ API ${apiName} completed successfully`);

            return {
                success: true,
                data: extractedData,
                rawResponse: data
            };

        } catch (error) {
            console.error(`❌ Error calling API ${apiName}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Test EcosAgile connection
     */
    async testConnection() {
        try {
            await this.getAuthToken();
            return {
                success: true,
                message: 'EcosAgile connection successful'
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection error: ${error.message}`
            };
        }
    }

    /**
     * Convert Italian dates (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
     */
    parseItalianDate(dateString) {
        if (!dateString || dateString.trim() === '') return '';

        try {
            const cleanDate = dateString.split(' ')[0]; // Remove time if present
            const parts = cleanDate.split('/');

            if (parts.length === 3) {
                const [day, month, year] = parts;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        } catch (error) {
            console.warn('⚠️ Error parsing Italian date:', dateString);
        }

        return '';
    }

    /**
     * Invalidate cached token (force refresh)
     */
    invalidateToken() {
        this.cachedToken = null;
        this.tokenExpiry = null;
        console.log('🔄 EcosAgile token invalidated');
    }
}

/**
 * EcosAgile HR Service Class
 * Specialized service for HR data management
 */
class EcosAgileHRService extends EcosAgileBaseService {
    constructor(credentials) {
        super(credentials);
    }

    /**
     * Get all active employees
     */
    async getActiveEmployees() {
        const response = await this.callApi('PeopleExpressGetAll', {
            PersonStatusCode: "='A'",
            TerminationDate: "=''"
        });

        if (!response.success || !response.data) {
            console.error('❌ Error fetching employees:', response.error);
            return [];
        }

        return response.data
            .filter(emp => !emp.Delete || emp.Delete === '0')
            .map(emp => this.mapToStandardEmployee(emp));
    }

    /**
     * Get all employees (active and inactive)
     */
    async getAllEmployees() {
        const response = await this.callApi('PeopleExpressGetAll');

        if (!response.success || !response.data) {
            console.error('❌ Error fetching employees:', response.error);
            return [];
        }

        return response.data
            .filter(emp => !emp.Delete || emp.Delete === '0')
            .map(emp => this.mapToStandardEmployee(emp));
    }

    /**
     * Get employees by department
     */
    async getEmployeesByDepartment(departmentCode) {
        const allEmployees = await this.getActiveEmployees();
        return allEmployees.filter(emp =>
            emp.department.toLowerCase().includes(departmentCode.toLowerCase())
        );
    }

    /**
     * Map EcosAgile employee data to standard format
     */
    mapToStandardEmployee(ecosEmployee) {
        // Extract PT data
        const partTimeType = ecosEmployee.PartTimeType || 'FT';
        const partTimePercent = parseFloat(ecosEmployee.ParttimePercent || '100') || 100;

        // Calculate weekly hours: 40h * (PT% / 100)
        const weeklyHours = (40 * partTimePercent / 100);

        return {
            id: ecosEmployee.EmplID || ecosEmployee.EmplCode || ecosEmployee.ID || 'N/A',
            firstName: ecosEmployee.NameFirst || ecosEmployee.Nome || 'N/A',
            lastName: ecosEmployee.NameLast || ecosEmployee.Cognome || 'N/A',
            fullName: `${ecosEmployee.NameFirst || ecosEmployee.Nome || ''} ${ecosEmployee.NameLast || ecosEmployee.Cognome || ''}`.trim(),
            email: ecosEmployee.EMail || '',
            position: ecosEmployee.CategoryDescShort || ecosEmployee.Position || ecosEmployee.JobTitle || 'Not specified',
            department: ecosEmployee.DepartmentDescShort || 'Not specified',
            hireDate: this.parseItalianDate(ecosEmployee.HireDate || ''),
            phone: ecosEmployee.Phone || '',
            status: (!ecosEmployee.Delete || ecosEmployee.Delete === '0') && ecosEmployee.PersonStatusCode === 'A'
                ? 'active'
                : 'inactive',
            contractEndDate: this.parseItalianDate(ecosEmployee.ContractEndDate || ''),
            birthDate: this.parseItalianDate(ecosEmployee.BirthDate || ''),
            terminationDate: this.parseItalianDate(ecosEmployee.TerminationDate || ''),
            partTimeType: partTimeType,
            partTimePercent: partTimePercent,
            weeklyHours: weeklyHours,
            rawData: ecosEmployee
        };
    }
}

/**
 * Main EcosAgileAPI wrapper object (singleton pattern)
 */
const EcosAgileAPI = {
    hrService: null,
    credentials: null,

    // Initialize service with credentials
    init(credentials) {
        this.credentials = credentials;
        this.hrService = new EcosAgileHRService(credentials);

        // Save credentials to localStorage for persistence
        localStorage.setItem('ecosagile_credentials', JSON.stringify(credentials));
        console.log('✅ EcosAgile API initialized');
    },

    // Load credentials from localStorage
    loadCredentials() {
        const saved = localStorage.getItem('ecosagile_credentials');
        if (saved) {
            try {
                this.credentials = JSON.parse(saved);
                this.hrService = new EcosAgileHRService(this.credentials);
                console.log('✅ EcosAgile credentials loaded from cache');
                return true;
            } catch (e) {
                console.error('❌ Error loading EcosAgile credentials:', e);
            }
        }
        return false;
    },

    // Test connection
    async testConnection() {
        if (!this.hrService) {
            return { success: false, message: 'Service not initialized' };
        }
        return await this.hrService.testConnection();
    },

    // Get employees data
    async getEmployees(activeOnly = true) {
        if (!this.hrService) {
            throw new Error('EcosAgile service not initialized');
        }

        if (activeOnly) {
            return await this.hrService.getActiveEmployees();
        } else {
            return await this.hrService.getAllEmployees();
        }
    }
};
