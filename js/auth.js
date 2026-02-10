/**
 * Klinik Kesihatan Lunas - Authentication Module
 * Handles user login, logout, session management
 */

const Auth = {
    currentUser: null,

    /**
     * Initialize authentication
     */
    init() {
        // Check for existing session on page load
        const session = this.getSession();
        
        if (session) {
            this.currentUser = session;
            return true;
        }
        
        return false;
    },

    /**
     * Login function
     */
    async login(username, password) {
        try {
            // Validate input
            if (!username || !password) {
                throw new Error('Username dan password diperlukan');
            }

            // Check credentials
            const user = this.validateCredentials(username, password);
            
            if (!user) {
                throw new Error('Username atau password salah');
            }

            // Create session
            this.currentUser = {
                username: username,
                role: user.role,
                fullName: user.fullName,
                email: user.email,
                loginTime: new Date().toISOString(),
                deviceId: this.getDeviceId()
            };

            // Save session
            this.saveSession(this.currentUser);

            // Log login event
            this.logEvent('login', {
                username: username,
                role: user.role,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                user: this.currentUser
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Logout function
     */
    logout() {
        if (this.currentUser) {
            // Log logout event
            this.logEvent('logout', {
                username: this.currentUser.username,
                timestamp: new Date().toISOString()
            });
        }

        // Clear session
        this.clearSession();
        this.currentUser = null;

        // Redirect to login
        window.location.reload();
    },

    /**
     * Validate credentials
     */
    validateCredentials(username, password) {
        // In production, this should fetch from Google Sheets
        // For now, use CONFIG.DEFAULT_USERS
        const user = CONFIG.DEFAULT_USERS[username];
        
        if (!user) {
            return null;
        }

        // In production, use proper password hashing (bcrypt)
        if (user.password !== password) {
            return null;
        }

        return user;
    },

    /**
     * Session Management
     */
    saveSession(user) {
        const session = {
            ...user,
            expiresAt: Date.now() + CONFIG.SESSION_DURATION
        };

        Utils.saveToStorage(CONFIG.STORAGE_KEYS.SESSION, session);
    },

    getSession() {
        const session = Utils.getFromStorage(CONFIG.STORAGE_KEYS.SESSION);
        
        if (!session) {
            return null;
        }

        // Check if expired
        if (session.expiresAt < Date.now()) {
            this.clearSession();
            return null;
        }

        return session;
    },

    clearSession() {
        Utils.removeFromStorage(CONFIG.STORAGE_KEYS.SESSION);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.getSession() !== null;
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        if (!this.currentUser) {
            this.currentUser = this.getSession();
        }
        return this.currentUser;
    },

    /**
     * Check user role
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (user.role === CONFIG.ROLES.SUPERADMIN) {
            return true; // Superadmin has all roles
        }
        
        return user.role === role;
    },

    /**
     * Check permission
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const permissions = CONFIG.PERMISSIONS[user.role] || [];
        
        // Superadmin has 'all' permission
        if (permissions.includes('all')) {
            return true;
        }

        return permissions.includes(permission);
    },

    /**
     * Require authentication
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    },

    /**
     * Require specific role
     */
    requireRole(role) {
        if (!this.hasRole(role)) {
            Utils.showAlert('Akses ditolak. Anda tidak mempunyai kebenaran.', 'error');
            return false;
        }
        return true;
    },

    /**
     * Require specific permission
     */
    requirePermission(permission) {
        if (!this.hasPermission(permission)) {
            Utils.showAlert('Akses ditolak. Anda tidak mempunyai kebenaran untuk tindakan ini.', 'error');
            return false;
        }
        return true;
    },

    /**
     * Get user display info
     */
    getUserDisplay() {
        const user = this.getCurrentUser();
        if (!user) return null;

        return {
            name: user.fullName,
            initials: Utils.getInitials(user.fullName),
            role: this.getRoleDisplay(user.role),
            username: user.username
        };
    },

    getRoleDisplay(role) {
        const displays = {
            [CONFIG.ROLES.SUPERADMIN]: 'Super Administrator',
            [CONFIG.ROLES.ADMIN_MCH]: 'Admin MCH',
            [CONFIG.ROLES.ADMIN_OPD]: 'Admin OPD'
        };
        return displays[role] || role;
    },

    /**
     * Change password
     */
    async changePassword(oldPassword, newPassword) {
        const user = this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Validate old password
        const validUser = this.validateCredentials(user.username, oldPassword);
        if (!validUser) {
            throw new Error('Password lama salah');
        }

        // Validate new password
        if (newPassword.length < CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
            throw new Error(`Password baru mestilah sekurang-kurangnya ${CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} karakter`);
        }

        // In production, this would update in Google Sheets
        // For now, update in CONFIG.DEFAULT_USERS
        CONFIG.DEFAULT_USERS[user.username].password = newPassword;

        // Log event
        this.logEvent('password_change', {
            username: user.username,
            timestamp: new Date().toISOString()
        });

        Utils.showAlert('Password berjaya ditukar', 'success');
        return { success: true };
    },

    /**
     * Device ID (for multi-device support)
     */
    getDeviceId() {
        let deviceId = Utils.getFromStorage('deviceId');
        
        if (!deviceId) {
            deviceId = Utils.generateUUID();
            Utils.saveToStorage('deviceId', deviceId);
        }
        
        return deviceId;
    },

    /**
     * Activity logging
     */
    logEvent(event, data) {
        const log = {
            event: event,
            user: this.currentUser?.username || 'anonymous',
            timestamp: new Date().toISOString(),
            data: data
        };

        // Save to local logs
        const logs = Utils.getFromStorage('activityLogs', []);
        logs.push(log);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.shift();
        }
        
        Utils.saveToStorage('activityLogs', logs);

        // In production, also send to Google Sheets
        // API.logActivity(log);
    },

    /**
     * Get activity logs
     */
    getActivityLogs(limit = 50) {
        const logs = Utils.getFromStorage('activityLogs', []);
        return logs.slice(-limit).reverse();
    },

    /**
     * Session timeout check
     */
    checkSessionTimeout() {
        const session = this.getSession();
        
        if (!session) {
            return;
        }

        const timeLeft = session.expiresAt - Date.now();
        
        // Warn 5 minutes before expiry
        if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
            Utils.showAlert('Sesi anda akan tamat dalam 5 minit. Sila log masuk semula.', 'warning');
        }

        // Auto logout on expiry
        if (timeLeft <= 0) {
            Utils.showAlert('Sesi anda telah tamat. Sila log masuk semula.', 'error');
            setTimeout(() => {
                this.logout();
            }, 2000);
        }
    },

    /**
     * Extend session
     */
    extendSession() {
        const user = this.getCurrentUser();
        if (user) {
            this.saveSession(user);
            Utils.showAlert('Sesi dilanjutkan', 'success', 1000);
        }
    },

    /**
     * Get user sessions (all devices)
     */
    getUserSessions() {
        // In production, fetch from Google Sheets
        // For now, return current session
        const currentSession = this.getSession();
        return currentSession ? [currentSession] : [];
    },

    /**
     * Revoke session (logout from specific device)
     */
    revokeSession(deviceId) {
        // In production, this would update Google Sheets
        if (deviceId === this.getDeviceId()) {
            this.logout();
        }
    },

    /**
     * Login as (for superadmin testing)
     */
    loginAs(username) {
        if (!this.hasRole(CONFIG.ROLES.SUPERADMIN)) {
            throw new Error('Only superadmin can use this feature');
        }

        const user = CONFIG.DEFAULT_USERS[username];
        if (!user) {
            throw new Error('User not found');
        }

        // Create temporary session
        this.currentUser = {
            username: username,
            role: user.role,
            fullName: user.fullName + ' (Logged in as)',
            email: user.email,
            loginTime: new Date().toISOString(),
            deviceId: this.getDeviceId(),
            impersonating: true,
            originalUser: this.getCurrentUser().username
        };

        this.saveSession(this.currentUser);
        
        Utils.showAlert(`Logged in as ${user.fullName}`, 'info');
        window.location.reload();
    },

    /**
     * Restore original user (exit login as)
     */
    exitLoginAs() {
        const current = this.getCurrentUser();
        
        if (!current || !current.impersonating) {
            return;
        }

        const originalUser = CONFIG.DEFAULT_USERS[current.originalUser];
        if (originalUser) {
            this.currentUser = {
                username: current.originalUser,
                role: originalUser.role,
                fullName: originalUser.fullName,
                email: originalUser.email,
                loginTime: new Date().toISOString(),
                deviceId: this.getDeviceId()
            };

            this.saveSession(this.currentUser);
            window.location.reload();
        }
    }
};

// Check session timeout every minute
setInterval(() => {
    Auth.checkSessionTimeout();
}, 60000);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
