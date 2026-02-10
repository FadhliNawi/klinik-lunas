/**
 * Klinik Kesihatan Lunas - Utility Functions
 * Helper functions used across the application
 */

const Utils = {
    /**
     * Date & Time Functions
     */
    formatDate(date, format = 'dd/MM/yyyy') {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        switch(format) {
            case 'dd/MM/yyyy':
                return `${day}/${month}/${year}`;
            case 'yyyy-MM-dd':
                return `${year}-${month}-${day}`;
            case 'DD MMM YYYY':
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${day} ${months[d.getMonth()]} ${year}`;
            default:
                return `${day}/${month}/${year}`;
        }
    },

    formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    getCurrentDate() {
        return this.formatDate(new Date());
    },

    getCurrentTime() {
        return this.formatTime(new Date());
    },

    /**
     * IC Parsing Functions
     */
    parseIC(ic) {
        if (!ic) return null;
        
        // Remove hyphens and spaces
        const cleanIC = ic.replace(/[-\s]/g, '');
        
        // Check if valid Malaysian IC format (12 digits)
        if (!/^\d{12}$/.test(cleanIC)) {
            return null;
        }
        
        // Extract date parts (YYMMDD)
        const year = cleanIC.substring(0, 2);
        const month = cleanIC.substring(2, 4);
        const day = cleanIC.substring(4, 6);
        
        // Determine century (if year > current year's last 2 digits, then 1900s)
        const currentYear = new Date().getFullYear();
        const currentYearShort = currentYear % 100;
        const fullYear = parseInt(year) > currentYearShort ? 1900 + parseInt(year) : 2000 + parseInt(year);
        
        // Calculate age
        const birthDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));
        const age = this.calculateAge(birthDate);
        
        // Determine gender (last digit: even = female, odd = male)
        const lastDigit = parseInt(cleanIC.charAt(11));
        const gender = lastDigit % 2 === 0 ? 'Female' : 'Male';
        
        return {
            birthDate: birthDate,
            age: age,
            gender: gender,
            isValid: true
        };
    },

    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    },

    /**
     * Validation Functions
     */
    validateIC(ic) {
        if (!ic) return false;
        const cleanIC = ic.replace(/[-\s]/g, '');
        return /^\d{12}$/.test(cleanIC);
    },

    validatePassport(passport) {
        if (!passport) return false;
        return /^[A-Z0-9]{6,12}$/.test(passport.toUpperCase());
    },

    validatePhone(phone) {
        if (!phone) return false;
        const cleanPhone = phone.replace(/[-\s]/g, '');
        return /^01[0-9]\d{7,8}$/.test(cleanPhone);
    },

    validateEmail(email) {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isICOrPassport(value) {
        if (!value) return null;
        const clean = value.replace(/[-\s]/g, '');
        
        if (/^\d{12}$/.test(clean)) {
            return 'IC';
        } else if (/^[A-Z0-9]{6,12}$/i.test(value)) {
            return 'PASSPORT';
        }
        return null;
    },

    /**
     * UI Functions
     */
    showAlert(message, type = 'info', duration = 3000) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        // Set colors based on type
        const colors = {
            success: { bg: '#ECFDF5', text: '#047857', border: '#10B981' },
            error: { bg: '#FEF2F2', text: '#DC2626', border: '#EF4444' },
            warning: { bg: '#FFFBEB', text: '#D97706', border: '#F59E0B' },
            info: { bg: '#EFF6FF', text: '#1D4ED8', border: '#3B82F6' }
        };
        
        const color = colors[type] || colors.info;
        alert.style.background = color.bg;
        alert.style.color = color.text;
        alert.style.border = `2px solid ${color.border}`;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, duration);
    },

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('active');
        }
    },

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('active');
        }
    },

    /**
     * Data Formatting Functions
     */
    formatCurrency(amount) {
        return `RM ${parseFloat(amount).toFixed(2)}`;
    },

    formatPercentage(value) {
        return `${(value * 100).toFixed(1)}%`;
    },

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    /**
     * Array & Object Functions
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    },

    sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },

    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * LocalStorage Functions
     */
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },

    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    },

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    },

    clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },

    /**
     * Performance Functions
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Random & ID Generation
     */
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 7);
        return `${prefix}${timestamp}${randomStr}`.toUpperCase();
    },

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * URL & Query Functions
     */
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    /**
     * Time-based Access Check
     */
    checkMCHAccess() {
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const time = now.getHours() * 100 + now.getMinutes(); // 830 = 08:30

        // Check if clinic day (Sunday-Thursday)
        if (!CONFIG.MCH_HOURS.days.includes(day)) {
            return {
                allowed: false,
                message: `Pendaftaran MCH hanya tersedia ${CONFIG.MCH_HOURS.daysText}`
            };
        }

        // Check if within operating hours
        if (time < CONFIG.MCH_HOURS.startMinutes || time >= CONFIG.MCH_HOURS.endMinutes) {
            return {
                allowed: false,
                message: `Pendaftaran MCH hanya tersedia pada ${CONFIG.MCH_HOURS.start} - ${CONFIG.MCH_HOURS.end}`
            };
        }

        return {
            allowed: true,
            message: 'Access granted'
        };
    },

    /**
     * Form Functions
     */
    serializeForm(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    resetForm(formElement) {
        if (formElement) {
            formElement.reset();
        }
    },

    /**
     * Table Functions
     */
    createTableRow(data, columns) {
        let row = '<tr>';
        columns.forEach(col => {
            row += `<td>${data[col] || '-'}</td>`;
        });
        row += '</tr>';
        return row;
    },

    /**
     * Export Functions
     */
    exportToCSV(data, filename) {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    /**
     * Clipboard Functions
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showAlert('Disalin ke clipboard', 'success');
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showAlert('Gagal menyalin', 'error');
            return false;
        }
    },

    /**
     * Image Functions
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Number Functions
     */
    formatNumber(num, decimals = 0) {
        return Number(num).toLocaleString('en-MY', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Color Functions
     */
    getStatusColor(status) {
        const colors = {
            'Pending': '#F59E0B',
            'Selesai': '#10B981',
            'Tidak Hadir': '#EF4444',
            'Cancelled': '#6B7280',
            'Active': '#10B981',
            'Inactive': '#6B7280'
        };
        return colors[status] || '#6B7280';
    },

    /**
     * Print Function
     */
    printElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write('<style>body{font-family:Arial,sans-serif;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
