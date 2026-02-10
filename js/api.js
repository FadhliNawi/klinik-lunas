/**
 * Klinik Kesihatan Lunas - API Module
 * SIMPLE VERSION - Matches SIMPLE-TEST-VERSION.gs backend
 */

const API = {
    /**
     * Register patient (OPD or MCH)
     */
    async registerPatient(type, data) {
        const action = type === 'opd' ? 'registerOPD' : 'registerMCH';
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            throw new Error('Apps Script URL not configured. Go to Admin → Tetapan Sistem');
        }
        
        // Build URL with direct parameters
        const params = new URLSearchParams();
        params.append('action', action);
        params.append('patientId', data.patientId);
        params.append('name', data.name);
        params.append('age', data.age);
        params.append('gender', data.gender);
        params.append('phone', data.phone);
        params.append('visitType', data.visitType);
        params.append('luarKawasanText', data.luarKawasanText || 'No');
        
        const fullUrl = `${url}?${params.toString()}`;
        
        console.log('🚀 Registering patient:', action);
        console.log('📋 Patient ID:', data.patientId);
        console.log('🔗 URL:', fullUrl);
        
        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                redirect: 'follow'
            });
            
            const result = await response.json();
            console.log('✅ Registration result:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { 
                success: false, 
                error: error.message,
                note: 'Check Apps Script URL in Admin → Tetapan Sistem'
            };
        }
    },

    /**
     * Get patient by IC
     */
    async getPatient(patientId) {
        // Check localStorage first (for "pesakit sedia ada" feature)
        const cached = Utils.getFromStorage(`patient_${patientId}`);
        if (cached) {
            return { success: true, data: cached };
        }
        
        return { success: false, data: null };
    },

    /**
     * Create appointment
     */
    async createAppointment(data) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            throw new Error('Apps Script URL not configured');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'createAppointment');
        params.append('patientId', data.patientId);
        params.append('patientName', data.patientName);
        params.append('phone', data.phone);
        params.append('caseType', data.caseType);
        params.append('date', data.date);
        params.append('timeSlot', data.timeSlot);
        params.append('notes', data.notes || '');
        params.append('createdBy', data.createdBy || 'system');
        
        const fullUrl = `${url}?${params.toString()}`;
        
        console.log('Creating appointment:', data.caseType);
        
        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                redirect: 'follow'
            });
            
            const result = await response.json();
            console.log('Appointment result:', result);
            return result;
            
        } catch (error) {
            console.error('Appointment error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get appointments
     */
    async getAppointments(date, type) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            return { success: false, data: [] };
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getAppointments');
        if (date) params.append('date', date);
        if (type) params.append('type', type);
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error getting appointments:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * Search appointments
     */
    async searchAppointments(query, field) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            return { success: false, data: [] };
        }
        
        const params = new URLSearchParams();
        params.append('action', 'searchAppointments');
        params.append('query', query);
        params.append('field', field);
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Search error:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * Get blocked dates
     */
    async getBlockedDates() {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            return { success: false, data: [] };
        }
        
        try {
            const response = await fetch(`${url}?action=getBlockedDates`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error getting blocked dates:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * Block date
     */
    async blockDate(date, reason, category) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            throw new Error('Apps Script URL not configured');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'blockDate');
        params.append('date', date);
        params.append('reason', reason);
        params.append('category', category);
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error blocking date:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Unblock date
     */
    async unblockDate(date) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            throw new Error('Apps Script URL not configured');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'unblockDate');
        params.append('date', date);
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error unblocking date:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get slots configuration
     */
    async getSlots(caseType) {
        // For now, return from config
        // Later can fetch from Google Sheets
        const slotConfig = CONFIG.DEFAULT_SLOTS[caseType];
        
        if (slotConfig) {
            return {
                success: true,
                data: { [caseType]: slotConfig },
                useDefaults: false
            };
        }
        
        return {
            success: false,
            data: {},
            useDefaults: true
        };
    },

    /**
     * Get sheets registry
     */
    async getSheets(role) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            return { success: false, data: [] };
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getSheets');
        if (role) params.append('role', role);
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error getting sheets:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * Add sheet to registry
     */
    async addSheet(data) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            throw new Error('Apps Script URL not configured');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'addSheet');
        params.append('name', data.name);
        params.append('description', data.description);
        params.append('category', data.category);
        params.append('url', data.url);
        params.append('icon', data.icon);
        params.append('accessRoles', data.accessRoles.join(','));
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error adding sheet:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Link appointment to registration (auto-complete)
     */
    async linkAppointmentToRegistration(patientId, date) {
        console.log('Linking appointment for:', patientId, 'on', date);
        
        try {
            const appointments = await this.getAppointments(date);
            
            if (!appointments.success || !appointments.data) {
                return;
            }
            
            const todayAppt = appointments.data.find(appt => 
                appt.patientId === patientId && 
                appt.status === 'Pending'
            );
            
            if (todayAppt) {
                console.log('Found matching appointment:', todayAppt.id);
                // Update appointment status to Selesai
                await this.updateAppointment(todayAppt.id, 'Selesai');
            }
        } catch (error) {
            console.error('Error linking appointment:', error);
        }
    },

    /**
     * Update appointment
     */
    async updateAppointment(appointmentId, status) {
        const url = CONFIG.APPS_SCRIPT_URL;
        
        if (!url) {
            return { success: false };
        }
        
        const params = new URLSearchParams();
        params.append('action', 'updateAppointment');
        params.append('appointmentId', appointmentId);
        params.append('status', status);
        
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating appointment:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Set Apps Script URL (for admin settings)
     */
    setAppsScriptUrl(url) {
        // This will be called from admin settings
        // The URL is stored in config.js CONFIG.APPS_SCRIPT_URL
        console.log('Apps Script URL set:', url);
        
        // Save to localStorage for persistence
        localStorage.setItem('appsScriptUrl', url);
        
        // Update config
        if (typeof CONFIG !== 'undefined') {
            CONFIG.APPS_SCRIPT_URL = url;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
