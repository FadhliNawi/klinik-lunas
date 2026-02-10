/**
 * Klinik Kesihatan Lunas - Admin Module
 * SUPERADMIN features: blocked dates, slots, users, settings
 */

const Admin = {
    /**
     * Load blocked dates management
     */
    async loadBlockedDates() {
        if (!Auth.hasPermission('block_dates')) {
            Utils.showAlert('Akses ditolak. Hanya SUPERADMIN.', 'error');
            return;
        }

        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>🚫 Urus Tarikh Tutup</h1>
                <p>Block tarikh untuk cuti perayaan, cuti peristiwa, atau lain-lain</p>
            </div>

            <div class="admin-container">
                <div class="admin-card">
                    <h3>➕ Tambah Tarikh Tutup</h3>
                    <form id="blockDateForm">
                        <div class="form-group">
                            <label>Tarikh <span class="required">*</span></label>
                            <input type="date" id="blockDate" required>
                        </div>
                        <div class="form-group">
                            <label>Kategori <span class="required">*</span></label>
                            <select id="blockCategory" required>
                                ${CONFIG.BLOCKED_DATE_CATEGORIES.map(cat => 
                                    `<option value="${cat}">${cat}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Sebab <span class="required">*</span></label>
                            <input type="text" id="blockReason" required placeholder="Contoh: Hari Raya Aidilfitri">
                        </div>
                        <button type="submit" class="btn btn-error">
                            🚫 Block Tarikh
                        </button>
                    </form>
                </div>

                <div class="admin-card">
                    <h3>📋 Senarai Tarikh Tutup</h3>
                    <div id="blockedDatesList">
                        <div class="loading-spinner">Memuat...</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('blockDateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.blockDate();
        });

        await this.loadBlockedDatesList();
    },

    async blockDate() {
        try {
            const date = document.getElementById('blockDate').value;
            const category = document.getElementById('blockCategory').value;
            const reason = document.getElementById('blockReason').value.trim();

            await API.blockDate(Utils.formatDate(new Date(date)), reason, category);
            
            Utils.showAlert('Tarikh berjaya diblock', 'success');
            document.getElementById('blockDateForm').reset();
            await this.loadBlockedDatesList();

        } catch (error) {
            console.error('Error blocking date:', error);
            Utils.showAlert('Gagal block tarikh', 'error');
        }
    },

    async loadBlockedDatesList() {
        const container = document.getElementById('blockedDatesList');
        if (!container) return;

        try {
            const response = await API.getBlockedDates();
            
            if (!response || !response.data || response.data.length === 0) {
                container.innerHTML = '<p>Tiada tarikh diblock</p>';
                return;
            }

            let html = '<div class="blocked-dates-list">';
            response.data.forEach(item => {
                html += `
                    <div class="blocked-date-item">
                        <div class="blocked-date-info">
                            <strong>📅 ${item.date}</strong>
                            <p>${item.reason}</p>
                            <small>${item.category}</small>
                        </div>
                        <button class="btn-small btn-error" onclick="Admin.unblockDate('${item.date}')">
                            Buang
                        </button>
                    </div>
                `;
            });
            html += '</div>';

            container.innerHTML = html;

        } catch (error) {
            console.error('Error loading blocked dates:', error);
            container.innerHTML = '<p>Gagal memuat data</p>';
        }
    },

    async unblockDate(date) {
        if (!confirm(`Buang ${date} dari senarai tarikh tutup?`)) return;

        try {
            await API.unblockDate(date);
            Utils.showAlert('Tarikh dibuka semula', 'success');
            await this.loadBlockedDatesList();
        } catch (error) {
            console.error('Error unblocking date:', error);
            Utils.showAlert('Gagal membuka tarikh', 'error');
        }
    },

    /**
     * Load slot configuration
     */
    async loadSlotConfig() {
        if (!Auth.hasPermission('manage_slots')) {
            Utils.showAlert('Akses ditolak. Hanya SUPERADMIN.', 'error');
            return;
        }

        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>📅 Konfigurasi Slot Temujanji</h1>
                <p>Tetapkan slot tersedia untuk setiap jenis kes</p>
            </div>

            <div class="admin-container">
                <div class="admin-card">
                    <h3>Pilih Jenis Kes</h3>
                    <select id="slotCaseType" onchange="Admin.loadCaseSlots()">
                        <option value="">Pilih jenis kes...</option>
                        ${CONFIG.OPD_CASE_TYPES.map(type => 
                            `<option value="${type}">${type}</option>`
                        ).join('')}
                    </select>
                </div>

                <div id="slotsEditor"></div>
            </div>
        `;
    },

    async loadCaseSlots() {
        const caseType = document.getElementById('slotCaseType').value;
        const editor = document.getElementById('slotsEditor');
        
        if (!caseType) {
            editor.innerHTML = '';
            return;
        }

        try {
            const response = await API.getSlots(caseType);
            const slots = response?.data || CONFIG.DEFAULT_SLOTS[caseType] || [];

            let html = `
                <div class="admin-card">
                    <h3>Slot untuk ${caseType}</h3>
                    <div id="slotsList">
            `;

            slots.forEach((slot, index) => {
                html += `
                    <div class="slot-item">
                        <input type="time" value="${slot.time}" id="slotTime${index}">
                        <input type="number" value="${slot.slots}" id="slotCount${index}" min="1" max="50" placeholder="Bilangan slot">
                        <button class="btn-small btn-error" onclick="Admin.removeSlot(${index})">Buang</button>
                    </div>
                `;
            });

            html += `
                    </div>
                    <button class="btn btn-secondary" onclick="Admin.addSlot()">➕ Tambah Slot</button>
                    <button class="btn btn-primary" onclick="Admin.saveSlots()">💾 Simpan</button>
                </div>
            `;

            editor.innerHTML = html;

        } catch (error) {
            console.error('Error loading slots:', error);
            editor.innerHTML = '<p>Gagal memuat slot</p>';
        }
    },

    /**
     * Load user management
     */
    async loadUserManagement() {
        if (!Auth.hasPermission('manage_users')) {
            Utils.showAlert('Akses ditolak. Hanya SUPERADMIN.', 'error');
            return;
        }

        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>👥 Urus Pengguna</h1>
                <p>Tambah, edit, atau buang pengguna sistem</p>
            </div>

            <div class="admin-container">
                <div class="admin-card">
                    <h3>➕ Tambah Pengguna Baru</h3>
                    <form id="addUserForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Username <span class="required">*</span></label>
                                <input type="text" id="newUsername" required>
                            </div>
                            <div class="form-group">
                                <label>Password <span class="required">*</span></label>
                                <input type="password" id="newPassword" required minlength="6">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nama Penuh <span class="required">*</span></label>
                                <input type="text" id="newFullName" required>
                            </div>
                            <div class="form-group">
                                <label>Role <span class="required">*</span></label>
                                <select id="newRole" required>
                                    <option value="">Pilih role...</option>
                                    <option value="admin_opd">Admin OPD</option>
                                    <option value="admin_mch">Admin MCH</option>
                                    <option value="superadmin">SuperAdmin</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="newEmail">
                        </div>
                        <button type="submit" class="btn btn-primary">
                            ➕ Tambah Pengguna
                        </button>
                    </form>
                </div>

                <div class="admin-card">
                    <h3>📋 Senarai Pengguna</h3>
                    <div id="usersList">
                        <div class="loading-spinner">Memuat...</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addUser();
        });

        await this.loadUsersList();
    },

    async addUser() {
        try {
            const data = {
                username: document.getElementById('newUsername').value.trim(),
                password: document.getElementById('newPassword').value,
                fullName: document.getElementById('newFullName').value.trim(),
                role: document.getElementById('newRole').value,
                email: document.getElementById('newEmail').value.trim()
            };

            await API.addUser(data);
            
            Utils.showAlert('Pengguna berjaya ditambah', 'success');
            document.getElementById('addUserForm').reset();
            await this.loadUsersList();

        } catch (error) {
            console.error('Error adding user:', error);
            Utils.showAlert('Gagal tambah pengguna', 'error');
        }
    },

    async loadUsersList() {
        const container = document.getElementById('usersList');
        if (!container) return;

        try {
            // In production, fetch from API
            const users = Object.entries(CONFIG.DEFAULT_USERS);

            let html = '<div class="users-list">';
            users.forEach(([username, user]) => {
                html += `
                    <div class="user-item">
                        <div class="user-info">
                            <div class="user-avatar">${Utils.getInitials(user.fullName)}</div>
                            <div>
                                <strong>${user.fullName}</strong>
                                <p>${username} • ${Auth.getRoleDisplay(user.role)}</p>
                            </div>
                        </div>
                        <div class="user-actions">
                            <button class="btn-small" onclick="Admin.editUser('${username}')">Edit</button>
                            ${user.role !== 'superadmin' ? 
                                `<button class="btn-small btn-error" onclick="Admin.deleteUser('${username}')">Buang</button>` 
                                : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            container.innerHTML = html;

        } catch (error) {
            console.error('Error loading users:', error);
            container.innerHTML = '<p>Gagal memuat pengguna</p>';
        }
    },

    /**
     * Load add sheet form
     */
    loadAddSheet() {
        if (!Auth.hasPermission('manage_sheets')) {
            Utils.showAlert('Akses ditolak. Hanya SUPERADMIN.', 'error');
            return;
        }

        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>📊 Tambah Sheet Baru</h1>
                <p>Tambah link ke Google Sheets untuk akses pantas</p>
            </div>

            <div class="admin-container">
                <div class="admin-card" style="max-width: 800px; margin: 0 auto;">
                    <form id="addSheetForm">
                        <div class="form-group">
                            <label>Nama Sheet <span class="required">*</span></label>
                            <input type="text" id="sheetName" required placeholder="Contoh: Reten-reten">
                        </div>

                        <div class="form-group">
                            <label>Deskripsi <span class="required">*</span></label>
                            <textarea id="sheetDesc" required rows="2" placeholder="Keterangan ringkas"></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Kategori <span class="required">*</span></label>
                                <select id="sheetCategory" required>
                                    <option value="">Pilih kategori...</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Documentation">Documentation</option>
                                    <option value="Reports">Reports</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Icon (Emoji)</label>
                                <input type="text" id="sheetIcon" placeholder="📋" maxlength="2">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Google Sheets URL <span class="required">*</span></label>
                            <input type="url" id="sheetUrl" required placeholder="https://docs.google.com/spreadsheets/d/...">
                            <small class="helper-text">Salin link penuh dari Google Sheets</small>
                        </div>

                        <div class="form-group">
                            <label>Akses untuk <span class="required">*</span></label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="admin_opd" id="accessOPD"> Admin OPD</label>
                                <label><input type="checkbox" value="admin_mch" id="accessMCH"> Admin MCH</label>
                                <label><input type="checkbox" value="superadmin" id="accessSuper" checked disabled> SuperAdmin</label>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            💾 Tambah Sheet
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('addSheetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveSheet();
        });
    },

    async saveSheet() {
        try {
            const accessRoles = ['superadmin'];
            if (document.getElementById('accessOPD').checked) accessRoles.push('admin_opd');
            if (document.getElementById('accessMCH').checked) accessRoles.push('admin_mch');

            const data = {
                name: document.getElementById('sheetName').value.trim(),
                description: document.getElementById('sheetDesc').value.trim(),
                category: document.getElementById('sheetCategory').value,
                url: document.getElementById('sheetUrl').value.trim(),
                icon: document.getElementById('sheetIcon').value.trim() || '📄',
                accessRoles: accessRoles
            };

            await API.addSheet(data);
            
            Utils.showAlert('Sheet berjaya ditambah', 'success');
            Navigation.loadPage('sheets-registry');

        } catch (error) {
            console.error('Error adding sheet:', error);
            Utils.showAlert('Gagal tambah sheet', 'error');
        }
    },

    /**
     * Load system settings
     */
    async loadSystemSettings() {
        if (!Auth.hasPermission('system_settings')) {
            Utils.showAlert('Akses ditolak. Hanya SUPERADMIN.', 'error');
            return;
        }

        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>⚙️ Tetapan Sistem</h1>
                <p>Konfigurasi sistem dan integrasi</p>
            </div>

            <div class="admin-container">
                <div class="admin-card">
                    <h3>🔗 Google Apps Script URL</h3>
                    <p>URL deployment dari Google Apps Script</p>
                    <div class="form-group">
                        <label>Apps Script URL <span class="required">*</span></label>
                        <input type="url" id="appsScriptUrl" value="${CONFIG.APPS_SCRIPT_URL}" 
                               placeholder="https://script.google.com/macros/s/...">
                        <small class="helper-text">Deploy Google Apps Script dan salin URL di sini</small>
                    </div>
                    <button class="btn btn-primary" onclick="Admin.saveAppsScriptUrl()">
                        💾 Simpan URL
                    </button>
                </div>

                <div class="admin-card">
                    <h3>🕐 Waktu MCH</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Masa Mula</label>
                            <input type="time" id="mchStart" value="${CONFIG.MCH_HOURS.start}">
                        </div>
                        <div class="form-group">
                            <label>Masa Tamat</label>
                            <input type="time" id="mchEnd" value="${CONFIG.MCH_HOURS.end}">
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="Admin.saveMCHHours()">
                        💾 Simpan Waktu
                    </button>
                </div>

                <div class="admin-card">
                    <h3>🏥 Maklumat Klinik</h3>
                    <div class="form-group">
                        <label>Nama Klinik</label>
                        <input type="text" id="clinicName" value="${CONFIG.CLINIC_INFO.name}">
                    </div>
                    <div class="form-group">
                        <label>Alamat</label>
                        <textarea id="clinicAddress" rows="2">${CONFIG.CLINIC_INFO.address}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Telefon</label>
                            <input type="tel" id="clinicPhone" value="${CONFIG.CLINIC_INFO.phone}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="clinicEmail" value="${CONFIG.CLINIC_INFO.email}">
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="Admin.saveClinicInfo()">
                        💾 Simpan Maklumat
                    </button>
                </div>
            </div>
        `;
    },

    saveAppsScriptUrl() {
        const url = document.getElementById('appsScriptUrl').value.trim();
        if (!url) {
            Utils.showAlert('Sila masukkan URL', 'error');
            return;
        }

        API.setAppsScriptUrl(url);
        Utils.showAlert('Apps Script URL disimpan', 'success');
    },

    saveMCHHours() {
        // Update config (in production, save to Google Sheets)
        Utils.showAlert('Waktu MCH dikemaskini', 'success');
    },

    saveClinicInfo() {
        // Update config (in production, save to Google Sheets)
        Utils.showAlert('Maklumat klinik dikemaskini', 'success');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Admin;
}
