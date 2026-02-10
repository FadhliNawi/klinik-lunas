/**
 * Klinik Kesihatan Lunas - Navigation Module
 * Handles navigation bar, routing, and page loading
 */

const Navigation = {
    currentPage: 'dashboard',
    
    /**
     * Initialize navigation
     */
    init() {
        this.buildNavigationBar();
        this.setupEventListeners();
        this.loadDefaultPage();
    },

    /**
     * Build navigation bar based on user role
     */
    buildNavigationBar() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const navMenu = document.getElementById('navbarMenu');
        if (!navMenu) return;

        let menuHTML = '';

        // Build menu based on role
        if (user.role === CONFIG.ROLES.SUPERADMIN) {
            menuHTML = this.buildSuperAdminMenu();
        } else if (user.role === CONFIG.ROLES.ADMIN_MCH) {
            menuHTML = this.buildAdminMCHMenu();
        } else if (user.role === CONFIG.ROLES.ADMIN_OPD) {
            menuHTML = this.buildAdminOPDMenu();
        }

        navMenu.innerHTML = menuHTML;

        // Update user display
        this.updateUserDisplay(user);
    },

    /**
     * SuperAdmin Menu (Full Access)
     */
    buildSuperAdminMenu() {
        return `
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.toggleDropdown('pendaftaranDropdown')">
                    Pendaftaran <span>▾</span>
                </a>
                <div class="dropdown-menu" id="pendaftaranDropdown">
                    <a class="dropdown-item" onclick="Navigation.loadPage('opd-registration')">Pesakit Luar (OPD)</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('mch-registration')">Ibu & Anak (MCH)</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('all-patients')">Semua Pesakit</a>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.toggleDropdown('temujamjiDropdown')">
                    Temujanji <span>▾</span>
                </a>
                <div class="dropdown-menu" id="temujamjiDropdown">
                    <a class="dropdown-item" onclick="Navigation.loadPage('create-appointment')">Buat Temujanji</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('today-appointments')">Hari Ini</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('week-appointments')">Minggu Ini</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('search-appointments')">Cari Temujanji</a>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.toggleDropdown('sheetsDropdown')">
                    Sheets <span>▾</span>
                </a>
                <div class="dropdown-menu" id="sheetsDropdown">
                    <a class="dropdown-item" onclick="Navigation.loadPage('sheets-registry')">Semua Sheets</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('add-sheet')">Tambah Sheet</a>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.toggleDropdown('adminDropdown')">
                    Admin <span>▾</span>
                </a>
                <div class="dropdown-menu" id="adminDropdown">
                    <a class="dropdown-item" onclick="Navigation.loadPage('system-settings')">Tetapan Sistem</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('blocked-dates')">Tarikh Tutup</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('slot-config')">Konfigurasi Slot</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('user-management')">Pengguna</a>
                </div>
            </li>
        `;
    },

    /**
     * Admin MCH Menu
     */
    buildAdminMCHMenu() {
        return `
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.loadPage('mch-registration')">
                    📝 Pendaftaran MCH
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.toggleDropdown('temujamjiDropdown')">
                    📅 Temujanji MCH <span>▾</span>
                </a>
                <div class="dropdown-menu" id="temujamjiDropdown">
                    <a class="dropdown-item" onclick="Navigation.loadPage('create-appointment', 'mch')">➕ Buat Temujanji</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('today-appointments', 'mch')">📋 Hari Ini</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('search-appointments', 'mch')">🔍 Cari Temujanji</a>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.loadPage('sheets-registry', 'mch')">
                    📊 Sheets MCH
                </a>
            </li>
        `;
    },

    /**
     * Admin OPD Menu
     */
    buildAdminOPDMenu() {
        return `
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.loadPage('opd-registration')">
                    📝 Pendaftaran OPD
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.toggleDropdown('temujamjiDropdown')">
                    📅 Temujanji OPD <span>▾</span>
                </a>
                <div class="dropdown-menu" id="temujamjiDropdown">
                    <a class="dropdown-item" onclick="Navigation.loadPage('create-appointment', 'opd')">➕ Buat Temujanji</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('today-appointments', 'opd')">📋 Hari Ini</a>
                    <a class="dropdown-item" onclick="Navigation.loadPage('search-appointments', 'opd')">🔍 Cari Temujanji</a>
                </div>
            </li>
            <li class="nav-item">
                <a class="nav-link" onclick="Navigation.loadPage('sheets-registry', 'opd')">
                    📊 Sheets OPD
                </a>
            </li>
        `;
    },

    /**
     * Update user display in navbar
     */
    updateUserDisplay(user) {
        const display = Auth.getUserDisplay();
        if (!display) return;

        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');

        if (userAvatar) userAvatar.textContent = display.initials;
        if (userName) userName.textContent = display.name;
        if (userRole) userRole.textContent = display.role;
    },

    /**
     * Toggle dropdown menu
     */
    toggleDropdown(dropdownId) {
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu.id !== dropdownId) {
                menu.classList.remove('active');
            }
        });

        // Toggle this dropdown
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    },

    /**
     * Load page/component
     */
    loadPage(page, type = null) {
        // Close all dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });

        // Update current page
        this.currentPage = page;

        // Get content container
        const content = document.getElementById('mainContent');
        if (!content) return;

        // Show loading
        content.innerHTML = '<div class="loading-spinner">Loading...</div>';

        // Route to appropriate component
        setTimeout(() => {
            switch(page) {
                case 'dashboard':
                    Dashboard.load();
                    break;
                case 'opd-registration':
                    Registration.loadOPDForm();
                    break;
                case 'mch-registration':
                    Registration.loadMCHForm();
                    break;
                case 'all-patients':
                    this.loadAllPatients();
                    break;
                case 'create-appointment':
                    Appointments.loadCreateForm(type);
                    break;
                case 'today-appointments':
                    Appointments.loadToday(type);
                    break;
                case 'week-appointments':
                    Appointments.loadWeek(type);
                    break;
                case 'search-appointments':
                    Appointments.loadSearch(type);
                    break;
                case 'sheets-registry':
                    this.loadSheetsRegistry(type);
                    break;
                case 'add-sheet':
                    Admin.loadAddSheet();
                    break;
                case 'system-settings':
                    Admin.loadSystemSettings();
                    break;
                case 'blocked-dates':
                    Admin.loadBlockedDates();
                    break;
                case 'slot-config':
                    Admin.loadSlotConfig();
                    break;
                case 'user-management':
                    Admin.loadUserManagement();
                    break;
                default:
                    content.innerHTML = '<h2>Page not found</h2>';
            }
        }, 100);
    },

    /**
     * Load default page (dashboard)
     */
    loadDefaultPage() {
        this.loadPage('dashboard');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });

        // User menu click
        const userMenu = document.querySelector('.nav-user');
        if (userMenu) {
            userMenu.addEventListener('click', () => {
                this.showUserMenu();
            });
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page);
            }
        });
    },

    /**
     * Show user menu
     */
    showUserMenu() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const options = [
            { label: '👤 Profile', action: () => this.loadPage('profile') },
            { label: '🔑 Tukar Password', action: () => this.showChangePassword() },
            { label: '🚪 Log Keluar', action: () => Auth.logout() }
        ];

        // Show modal with options
        let html = '<div class="user-menu-options">';
        options.forEach(opt => {
            html += `<div class="user-menu-item" onclick="Navigation.closeUserMenu(); (${opt.action})()">${opt.label}</div>`;
        });
        html += '</div>';

        // Create temporary modal
        const modal = document.createElement('div');
        modal.className = 'user-menu-modal';
        modal.innerHTML = html;
        modal.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 1000;
            min-width: 200px;
        `;

        document.body.appendChild(modal);

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!e.target.closest('.user-menu-modal') && !e.target.closest('.nav-user')) {
                    modal.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    },

    closeUserMenu() {
        const modal = document.querySelector('.user-menu-modal');
        if (modal) modal.remove();
    },

    /**
     * Show change password dialog
     */
    showChangePassword() {
        const html = `
            <div class="modal active" id="changePasswordModal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>🔑 Tukar Password</h2>
                        <button class="close-btn" onclick="Navigation.closeChangePassword()">×</button>
                    </div>
                    <form id="changePasswordForm">
                        <div class="form-group">
                            <label>Password Lama</label>
                            <input type="password" id="oldPassword" required>
                        </div>
                        <div class="form-group">
                            <label>Password Baru</label>
                            <input type="password" id="newPassword" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label>Sahkan Password Baru</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            💾 Tukar Password
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                Utils.showAlert('Password baru tidak sepadan', 'error');
                return;
            }

            try {
                await Auth.changePassword(oldPassword, newPassword);
                this.closeChangePassword();
            } catch (error) {
                Utils.showAlert(error.message, 'error');
            }
        });
    },

    closeChangePassword() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.remove();
    },

    /**
     * Load all patients view
     */
    loadAllPatients() {
        const content = document.getElementById('mainContent');
        content.innerHTML = `
            <div class="page-header">
                <h1>📋 Semua Pesakit</h1>
                <p>Senarai lengkap pesakit OPD dan MCH</p>
            </div>
            <div class="patients-container">
                <div class="filters">
                    <input type="text" placeholder="Cari nama atau IC..." id="patientSearch">
                    <select id="patientTypeFilter">
                        <option value="all">Semua</option>
                        <option value="opd">OPD</option>
                        <option value="mch">MCH</option>
                    </select>
                </div>
                <div id="patientsTable">
                    Loading patients...
                </div>
            </div>
        `;
    },

    /**
     * Load sheets registry
     */
    loadSheetsRegistry(type) {
        const content = document.getElementById('mainContent');
        const user = Auth.getCurrentUser();
        
        content.innerHTML = `
            <div class="page-header">
                <h1>📊 Akses Google Sheets</h1>
                <p>Klik untuk buka sheet di tab baru</p>
            </div>
            <div class="sheets-container" id="sheetsContainer">
                Loading sheets...
            </div>
        `;

        // Load sheets from registry
        this.loadSheets(type, user.role);
    },

    async loadSheets(type, role) {
        try {
            const sheets = await API.getSheets(role);
            
            const container = document.getElementById('sheetsContainer');
            if (!sheets || sheets.length === 0) {
                container.innerHTML = '<p>Tiada sheets tersedia</p>';
                return;
            }

            // Group by category
            const grouped = Utils.groupBy(sheets, 'category');
            
            let html = '';
            for (const [category, items] of Object.entries(grouped)) {
                html += `
                    <div class="sheets-category">
                        <h3>${category}</h3>
                        <div class="sheets-grid">
                `;
                
                items.forEach(sheet => {
                    if (type && !sheet.name.toLowerCase().includes(type)) return;
                    
                    html += `
                        <div class="sheet-card" onclick="window.open('${sheet.url}', '_blank')">
                            <div class="sheet-icon">${sheet.icon}</div>
                            <h4>${sheet.name}</h4>
                            <p>${sheet.description}</p>
                            <div class="sheet-action">Buka Sheet →</div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }

            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error loading sheets:', error);
            document.getElementById('sheetsContainer').innerHTML = 
                '<p>Gagal memuat sheets. Sila cuba lagi.</p>';
        }
    },

    /**
     * Set active navigation item
     */
    setActiveNav(page) {
        // Remove active from all
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active to current (could enhance this)
    },

    /**
     * Update page URL (for history)
     */
    updateURL(page) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({ page: page }, '', url);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
