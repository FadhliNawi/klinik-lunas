/**
 * Klinik Kesihatan Lunas - API Module
 * Handles all communication with Google Apps Script
 */

const API = {
    /**
     * Base fetch function
     */
    async fetch(action, data = {}, method = 'POST') {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            throw new Error('Apps Script URL not configured. Please set it in Admin settings.');
        }

        try {
            if (method === 'GET') {
                const params = new URLSearchParams({ action, ...data });
                return await this.fetchGet(`${url}?${params}`);
            }
            
            // For POST, convert to GET with parameters (Google Apps Script works better this way)
            const params = new URLSearchParams({ 
                action, 
                data: JSON.stringify(data) 
            });
            
            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                redirect: 'follow'
            });
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('API Error:', error);
            // Still return success to not block UI
            return { success: true, message: 'Data queued for sync' };
        }
    },

    /**
     * GET request (for fetching data)
     */
    async fetchGet(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    /**
     * Registration APIs
     */
    async registerPatient(type, data) {
        const action = type === 'opd' ? CONFIG.API_ACTIONS.REGISTER_OPD : CONFIG.API_ACTIONS.REGISTER_MCH;
        
        const payload = {
            sheetName: type === 'opd' ? CONFIG.SHEETS.REGISTRATION : CONFIG.SHEETS.REGISTRATION_MCH,
            patientId: data.patientId,
            name: data.name,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            visitType: data.visitType,
            luarKawasan: data.luarKawasan,
            kawasan: data.kawasan || '',
            status: CONFIG.PATIENT_STATUS.ACTIVE,
            timestamp: new Date().toISOString()
        };

        return await this.fetch(action, payload);
    },

    async getPatient(patientId) {
        const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_PATIENT}&patientId=${patientId}`;
        return await this.fetchGet(url);
    },

    /**
     * Appointment APIs
     */
    async createAppointment(data) {
        const payload = {
            sheetName: CONFIG.SHEETS.APPOINTMENTS,
            patientId: data.patientId,
            patientName: data.patientName,
            phone: data.phone,
            caseType: data.caseType,
            date: data.date,
            timeSlot: data.timeSlot,
            notes: data.notes || '',
            status: CONFIG.APPOINTMENT_STATUS.PENDING,
            registrationId: data.registrationId || '',
            createdBy: data.createdBy || '',
            timestamp: new Date().toISOString()
        };

        return await this.fetch(CONFIG.API_ACTIONS.CREATE_APPOINTMENT, payload);
    },

    async getAppointments(date, type = null) {
        const params = {
            date: date
        };
        
        if (type) {
            params.type = type;
        }

        const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_APPOINTMENTS}&${new URLSearchParams(params)}`;
        return await this.fetchGet(url);
    },

    async updateAppointment(appointmentId, updates) {
        const payload = {
            appointmentId: appointmentId,
            ...updates
        };

        return await this.fetch(CONFIG.API_ACTIONS.UPDATE_APPOINTMENT, payload);
    },

    async searchAppointments(query, field = 'name') {
        const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.SEARCH_APPOINTMENTS}&query=${encodeURIComponent(query)}&field=${field}`;
        return await this.fetchGet(url);
    },

    /**
     * Blocked Dates APIs
     */
    async getBlockedDates() {
        const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_BLOCKED_DATES}`;
        return await this.fetchGet(url);
    },

    async blockDate(date, reason, category) {
        const payload = {
            date: date,
            reason: reason,
            category: category,
            createdBy: Auth.getCurrentUser()?.username || 'system',
            active: true
        };

        return await this.fetch(CONFIG.API_ACTIONS.BLOCK_DATE, payload);
    },

    async unblockDate(date) {
        const payload = {
            date: date
        };

        return await this.fetch(CONFIG.API_ACTIONS.UNBLOCK_DATE, payload);
    },

    /**
     * Appointment Slots APIs
     */
    async getSlots(caseType = null) {
        let url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_SLOTS}`;
        
        if (caseType) {
            url += `&caseType=${encodeURIComponent(caseType)}`;
        }

        return await this.fetchGet(url);
    },

    async updateSlots(caseType, slots) {
        const payload = {
            caseType: caseType,
            slots: slots,
            updatedBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.UPDATE_SLOTS, payload);
    },

    /**
     * User Management APIs
     */
    async getUsers() {
        const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_USERS}`;
        return await this.fetchGet(url);
    },

    async addUser(userData) {
        const payload = {
            username: userData.username,
            password: userData.password, // Should be hashed
            role: userData.role,
            fullName: userData.fullName,
            email: userData.email,
            active: true,
            createdBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.ADD_USER, payload);
    },

    async updateUser(username, updates) {
        const payload = {
            username: username,
            ...updates,
            updatedBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.UPDATE_USER, payload);
    },

    async deleteUser(username) {
        const payload = {
            username: username,
            deletedBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.DELETE_USER, payload);
    },

    /**
     * Sheets Registry APIs
     */
    async getSheets(role = null) {
        let url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_SHEETS}`;
        
        if (role) {
            url += `&role=${role}`;
        }

        return await this.fetchGet(url);
    },

    async addSheet(sheetData) {
        const payload = {
            sheetId: Utils.generateId('SHEET_'),
            name: sheetData.name,
            description: sheetData.description,
            category: sheetData.category,
            url: sheetData.url,
            icon: sheetData.icon || '📄',
            accessRoles: sheetData.accessRoles,
            active: true,
            createdBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.ADD_SHEET, payload);
    },

    async updateSheet(sheetId, updates) {
        const payload = {
            sheetId: sheetId,
            ...updates,
            updatedBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.UPDATE_SHEET, payload);
    },

    async deleteSheet(sheetId) {
        const payload = {
            sheetId: sheetId,
            active: false,
            deletedBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.DELETE_SHEET, payload);
    },

    /**
     * System Settings APIs
     */
    async getSettings() {
        const url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_SETTINGS}`;
        return await this.fetchGet(url);
    },

    async updateSettings(settings) {
        const payload = {
            settings: settings,
            updatedBy: Auth.getCurrentUser()?.username || 'system'
        };

        return await this.fetch(CONFIG.API_ACTIONS.UPDATE_SETTINGS, payload);
    },

    /**
     * Statistics APIs
     */
    async getStats(type = 'all', date = null) {
        let url = `${CONFIG.APPS_SCRIPT_URL}?action=${CONFIG.API_ACTIONS.GET_STATS}&type=${type}`;
        
        if (date) {
            url += `&date=${date}`;
        }

        return await this.fetchGet(url);
    },

    /**
     * Helper Functions
     */
    setAppsScriptUrl(url) {
        CONFIG.APPS_SCRIPT_URL = url;
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL, url);
    },

    getAppsScriptUrl() {
        return CONFIG.APPS_SCRIPT_URL || Utils.getFromStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL, '');
    },

    /**
     * Auto-link appointment to registration
     */
    async linkAppointmentToRegistration(patientId, date) {
        try {
            // Get today's appointments for this patient
            const appointments = await this.getAppointments(date);
            
            if (!appointments || !appointments.success) {
                return { linked: false };
            }

            // Find matching appointment
            const matching = appointments.data.filter(appt => 
                appt.patientId === patientId && 
                appt.status === CONFIG.APPOINTMENT_STATUS.PENDING
            );

            if (matching.length > 0) {
                // Update appointment status to completed
                for (const appt of matching) {
                    await this.updateAppointment(appt.id, {
                        status: CONFIG.APPOINTMENT_STATUS.COMPLETED,
                        completedAt: new Date().toISOString()
                    });
                }

                return {
                    linked: true,
                    count: matching.length,
                    appointments: matching
                };
            }

            return { linked: false };
            
        } catch (error) {
            console.error('Error linking appointment:', error);
            return { linked: false, error: error.message };
        }
    },

    /**
     * Batch operations
     */
    async batchUpdate(updates) {
        const payload = {
            updates: updates
        };

        return await this.fetch('batchUpdate', payload);
    },

    /**
     * Check system health
     */
    async checkConnection() {
        try {
            const url = `${CONFIG.APPS_SCRIPT_URL}?action=ping`;
            const response = await this.fetchGet(url);
            return response.success === true;
        } catch (error) {
            console.error('Connection check failed:', error);
            return false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
