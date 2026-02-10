/**
 * Klinik Kesihatan Lunas - Appointments Module
 * Handles appointment creation, viewing, and management
 */

const Appointments = {
    currentFilter: 'all',
    appointments: [],

    /**
     * Load create appointment form
     */
    async loadCreateForm(type = null) {
        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>📅 Buat Temujanji Baru</h1>
                <p>Tempah slot untuk pesakit</p>
            </div>

            <div class="appointment-form-container">
                <form id="appointmentForm" class="appointment-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>No. Kad Pengenalan / Passport <span class="required">*</span></label>
                            <input type="text" id="apptIc" required placeholder="900101-01-1234">
                        </div>
                        <div class="form-group">
                            <label>Nama Pesakit <span class="required">*</span></label>
                            <input type="text" id="apptName" required placeholder="Nama penuh">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>No. Telefon <span class="required">*</span></label>
                            <input type="tel" id="apptPhone" required placeholder="012-3456789">
                        </div>
                        <div class="form-group">
                            <label>Jenis Kes <span class="required">*</span></label>
                            <select id="apptCaseType" required onchange="Appointments.loadSlots()">
                                <option value="">Pilih jenis kes...</option>
                                ${CONFIG.OPD_CASE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Tarikh Temujanji <span class="required">*</span></label>
                            <input type="date" id="apptDate" required onchange="Appointments.checkDate()">
                            <small class="helper-text" id="dateHelper"></small>
                        </div>
                        <div class="form-group">
                            <label>Masa <span class="required">*</span></label>
                            <select id="apptTime" required>
                                <option value="">Pilih tarikh & jenis kes dulu</option>
                            </select>
                            <small class="helper-text" id="slotsAvailable"></small>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Catatan</label>
                        <textarea id="apptNotes" rows="3" placeholder="Catatan tambahan (optional)"></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        💾 Buat Temujanji
                    </button>
                </form>
            </div>
        `;

        // Set minimum date to today
        const dateInput = document.getElementById('apptDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        // Setup form handler
        document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createAppointment();
        });

        // Auto-fill from IC
        document.getElementById('apptIc').addEventListener('blur', async () => {
            const ic = document.getElementById('apptIc').value.trim();
            if (!ic) return;

            const patient = Utils.getFromStorage(`patient_${ic}`);
            if (patient) {
                document.getElementById('apptName').value = patient.name;
                document.getElementById('apptPhone').value = patient.phone;
            }
        });
    },

    /**
     * Check if date is blocked
     */
    async checkDate() {
        const dateInput = document.getElementById('apptDate');
        const helper = document.getElementById('dateHelper');
        const timeSelect = document.getElementById('apptTime');
        
        if (!dateInput || !dateInput.value) return;

        const selectedDate = new Date(dateInput.value);
        const dayOfWeek = selectedDate.getDay();

        // Check if weekend (Friday/Saturday)
        if (CONFIG.WEEKEND_DAYS.includes(dayOfWeek)) {
            helper.textContent = '⚠️ Klinik tutup pada hujung minggu (Jumaat & Sabtu)';
            helper.style.color = '#EF4444';
            timeSelect.innerHTML = '<option value="">Tarikh tidak tersedia</option>';
            return;
        }

        // Check blocked dates
        try {
            const blockedDates = await API.getBlockedDates();
            const dateStr = Utils.formatDate(selectedDate);
            
            const isBlocked = blockedDates?.data?.some(d => d.date === dateStr);
            
            if (isBlocked) {
                const reason = blockedDates.data.find(d => d.date === dateStr)?.reason;
                helper.textContent = `🚫 Tarikh ditutup: ${reason}`;
                helper.style.color = '#EF4444';
                timeSelect.innerHTML = '<option value="">Tarikh tidak tersedia</option>';
                return;
            }

            helper.textContent = '✅ Tarikh tersedia';
            helper.style.color = '#10B981';
            await this.loadSlots();
            
        } catch (error) {
            console.error('Error checking date:', error);
            helper.textContent = '';
        }
    },

    /**
     * Load available time slots
     */
    async loadSlots() {
        const caseType = document.getElementById('apptCaseType')?.value;
        const date = document.getElementById('apptDate')?.value;
        const timeSelect = document.getElementById('apptTime');
        const slotsHelper = document.getElementById('slotsAvailable');

        if (!caseType || !date || !timeSelect) return;

        try {
            // Get slots configuration
            const slots = await API.getSlots(caseType);
            
            // Get existing appointments for this date
            const appointments = await API.getAppointments(Utils.formatDate(new Date(date)));

            // Default slots if not configured
            const availableSlots = slots?.data || CONFIG.DEFAULT_SLOTS[caseType] || [
                { time: '08:00', slots: 10 },
                { time: '09:00', slots: 10 },
                { time: '10:00', slots: 10 },
                { time: '14:00', slots: 10 },
                { time: '15:00', slots: 10 }
            ];

            // Count booked slots
            const booked = {};
            if (appointments?.data) {
                appointments.data.forEach(appt => {
                    if (appt.caseType === caseType) {
                        booked[appt.timeSlot] = (booked[appt.timeSlot] || 0) + 1;
                    }
                });
            }

            // Build options
            let html = '<option value="">Pilih masa...</option>';
            let totalAvailable = 0;

            availableSlots.forEach(slot => {
                const bookedCount = booked[slot.time] || 0;
                const available = slot.slots - bookedCount;
                
                if (available > 0) {
                    html += `<option value="${slot.time}">${slot.time} (${available} slot tersedia)</option>`;
                    totalAvailable += available;
                } else {
                    html += `<option value="${slot.time}" disabled>${slot.time} (Penuh)</option>`;
                }
            });

            timeSelect.innerHTML = html;
            
            if (totalAvailable > 0) {
                slotsHelper.textContent = `✅ ${totalAvailable} slot tersedia untuk ${caseType}`;
                slotsHelper.style.color = '#10B981';
            } else {
                slotsHelper.textContent = `⚠️ Tiada slot tersedia untuk ${caseType} pada tarikh ini`;
                slotsHelper.style.color = '#F59E0B';
            }

        } catch (error) {
            console.error('Error loading slots:', error);
            timeSelect.innerHTML = '<option value="">Ralat memuat slot</option>';
        }
    },

    /**
     * Create appointment
     */
    async createAppointment() {
        try {
            const data = {
                patientId: document.getElementById('apptIc').value.trim(),
                patientName: document.getElementById('apptName').value.trim(),
                phone: document.getElementById('apptPhone').value.trim(),
                caseType: document.getElementById('apptCaseType').value,
                date: Utils.formatDate(new Date(document.getElementById('apptDate').value)),
                timeSlot: document.getElementById('apptTime').value,
                notes: document.getElementById('apptNotes').value.trim(),
                createdBy: Auth.getCurrentUser()?.username
            };

            await API.createAppointment(data);
            
            Utils.showAlert('Temujanji berjaya dibuat!', 'success');
            
            // Reset form
            document.getElementById('appointmentForm').reset();
            
            // Update stats
            Dashboard.incrementStat('pending');
            
        } catch (error) {
            console.error('Error creating appointment:', error);
            Utils.showAlert('Gagal membuat temujanji. Sila cuba lagi.', 'error');
        }
    },

    /**
     * Load today's appointments
     */
    async loadToday(type = null) {
        const content = document.getElementById('mainContent');
        const today = Utils.getCurrentDate();

        content.innerHTML = `
            <div class="page-header">
                <h1>📋 Temujanji Hari Ini</h1>
                <p>${today}</p>
                <button class="btn btn-primary" onclick="window.open('https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit#gid=0', '_blank')" style="margin-top: 1rem;">
                    🔗 Edit di Google Sheets
                </button>
            </div>

            <div class="appointments-container">
                <div id="appointmentsTable">
                    <div class="loading-spinner">Memuat temujanji...</div>
                </div>
            </div>
        `;

        await this.loadAppointments(today, type);
    },

    /**
     * Load week's appointments
     */
    async loadWeek(type = null) {
        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>📅 Temujanji Minggu Ini</h1>
                <p>Senarai temujanji untuk 7 hari akan datang</p>
            </div>

            <div class="appointments-container">
                <div class="week-tabs" id="weekTabs"></div>
                <div id="appointmentsTable">
                    <div class="loading-spinner">Memuat temujanji...</div>
                </div>
            </div>
        `;

        this.renderWeekTabs();
        await this.loadAppointments(Utils.getCurrentDate(), type);
    },

    /**
     * Render week tabs
     */
    renderWeekTabs() {
        const container = document.getElementById('weekTabs');
        if (!container) return;

        const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
        let html = '';

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = Utils.formatDate(date);
            const dayName = days[date.getDay()];
            const isToday = i === 0;

            html += `
                <button class="week-tab ${isToday ? 'active' : ''}" 
                        onclick="Appointments.loadAppointments('${dateStr}')">
                    <div class="tab-day">${dayName}</div>
                    <div class="tab-date">${dateStr}</div>
                </button>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Load appointments for specific date
     */
    async loadAppointments(date, type = null) {
        const container = document.getElementById('appointmentsTable');
        if (!container) return;

        try {
            const response = await API.getAppointments(date, type);
            
            if (!response || !response.data || response.data.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <h3>Tiada temujanji</h3>
                        <p>Tiada temujanji untuk ${date}</p>
                    </div>
                `;
                return;
            }

            this.appointments = response.data;
            this.renderAppointmentsTable();

        } catch (error) {
            console.error('Error loading appointments:', error);
            container.innerHTML = `
                <div class="error-state">
                    <h3>❌ Ralat</h3>
                    <p>Gagal memuat temujanji. Sila cuba lagi.</p>
                </div>
            `;
        }
    },

    /**
     * Render appointments table
     */
    renderAppointmentsTable() {
        const container = document.getElementById('appointmentsTable');
        if (!container) return;

        const sorted = this.appointments.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

        let html = `
            <table class="appointments-table">
                <thead>
                    <tr>
                        <th>Masa</th>
                        <th>Pesakit</th>
                        <th>Telefon</th>
                        <th>Jenis Kes</th>
                        <th>Status</th>
                        <th>Tindakan</th>
                    </tr>
                </thead>
                <tbody>
        `;

        sorted.forEach(appt => {
            const statusIcon = appt.status === 'Selesai' ? '✅' : 
                             appt.status === 'Pending' ? '⏰' : '❌';
            const statusClass = appt.status === 'Selesai' ? 'status-completed' : 
                              appt.status === 'Pending' ? 'status-pending' : 'status-missed';

            html += `
                <tr onclick="Appointments.showDetails('${appt.id}')">
                    <td><strong>${appt.timeSlot}</strong></td>
                    <td>${appt.patientName}</td>
                    <td>${appt.phone}</td>
                    <td><span class="case-badge">${appt.caseType}</span></td>
                    <td><span class="status-badge ${statusClass}">${statusIcon} ${appt.status}</span></td>
                    <td><button class="btn-small">Lihat</button></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    },

    /**
     * Show appointment details modal
     */
    showDetails(appointmentId) {
        const appt = this.appointments.find(a => a.id === appointmentId);
        if (!appt) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📋 Butiran Temujanji</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="appointment-details">
                    <div class="detail-row">
                        <span class="label">Nama:</span>
                        <span class="value">${appt.patientName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">IC/Passport:</span>
                        <span class="value">${appt.patientId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Telefon:</span>
                        <span class="value">${appt.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Tarikh:</span>
                        <span class="value">${appt.date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Masa:</span>
                        <span class="value">${appt.timeSlot}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Jenis Kes:</span>
                        <span class="value">${appt.caseType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Status:</span>
                        <span class="value">${appt.status}</span>
                    </div>
                    ${appt.notes ? `
                        <div class="detail-row">
                            <span class="label">Catatan:</span>
                            <span class="value">${appt.notes}</span>
                        </div>
                    ` : ''}
                </div>
                <div style="margin-top: 2rem; text-align: center;">
                    <button class="btn btn-primary" onclick="window.open('https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit#gid=0', '_blank')">
                        🔗 Edit di Google Sheets
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Load search interface
     */
    loadSearch(type = null) {
        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>🔍 Cari Temujanji</h1>
                <p>Cari temujanji mengikut nama, IC, atau tarikh</p>
            </div>

            <div class="search-container">
                <div class="search-box">
                    <input type="text" id="searchQuery" placeholder="Cari nama atau IC pesakit...">
                    <select id="searchField">
                        <option value="name">Nama</option>
                        <option value="ic">IC/Passport</option>
                        <option value="date">Tarikh</option>
                    </select>
                    <button class="btn btn-primary" onclick="Appointments.performSearch()">
                        🔍 Cari
                    </button>
                </div>

                <div id="searchResults">
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3>Cari Temujanji</h3>
                        <p>Masukkan nama atau IC pesakit untuk memulakan carian</p>
                    </div>
                </div>
            </div>
        `;

        // Enter key to search
        document.getElementById('searchQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    },

    /**
     * Perform search
     */
    async performSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        const field = document.getElementById('searchField').value;
        const results = document.getElementById('searchResults');

        if (!query) {
            Utils.showAlert('Sila masukkan kata kunci carian', 'warning');
            return;
        }

        results.innerHTML = '<div class="loading-spinner">Mencari...</div>';

        try {
            const response = await API.searchAppointments(query, field);
            
            if (!response || !response.data || response.data.length === 0) {
                results.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">😕</div>
                        <h3>Tiada Keputusan</h3>
                        <p>Tiada temujanji dijumpai untuk "${query}"</p>
                    </div>
                `;
                return;
            }

            this.appointments = response.data;
            results.innerHTML = '<div id="appointmentsTable"></div>';
            this.renderAppointmentsTable();

        } catch (error) {
            console.error('Search error:', error);
            results.innerHTML = `
                <div class="error-state">
                    <h3>❌ Ralat</h3>
                    <p>Gagal mencari. Sila cuba lagi.</p>
                </div>
            `;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Appointments;
}
