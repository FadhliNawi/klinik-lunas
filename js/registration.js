/**
 * Klinik Kesihatan Lunas - Registration Module
 * Handles OPD and MCH patient registration
 */

const Registration = {
    currentType: null,
    patientCache: {},

    /**
     * Load OPD Registration Form
     */
    loadOPDForm() {
        if (!Auth.hasPermission('register_opd')) {
            Utils.showAlert('Akses ditolak', 'error');
            return;
        }

        this.currentType = 'opd';
        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>🏥 Pendaftaran Pesakit Luar (OPD)</h1>
                <p>Untuk staff kaunter - Modal kekal terbuka untuk pendaftaran bertubi-tubi</p>
            </div>

            <div class="registration-form-container">
                <form id="opdForm" class="registration-form">
                    <div class="success-message" id="opdSuccess">✅ Pendaftaran berjaya!</div>
                    <div class="error-message" id="opdError">❌ Ralat berlaku. Sila cuba lagi.</div>
                    
                    <div id="opdPatientInfo"></div>

                    <div class="form-group">
                        <label>No. Kad Pengenalan / Passport <span class="required">*</span></label>
                        <input type="text" id="opdIc" required placeholder="Contoh: 900101-01-1234 atau A12345678">
                        <small class="helper-text">Format IC: YYMMDD-XX-XXXX atau Nombor Passport</small>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Nama Penuh <span class="required">*</span></label>
                            <input type="text" id="opdName" required placeholder="Nama penuh pesakit">
                        </div>
                        <div class="form-group">
                            <label>Umur <span class="required">*</span></label>
                            <input type="number" id="opdAge" required placeholder="Umur" min="0" max="150">
                            <small class="helper-text">Auto dari IC, manual untuk Passport</small>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Jantina <span class="required">*</span></label>
                            <select id="opdGender" required>
                                <option value="">Pilih...</option>
                                <option value="Male">Lelaki</option>
                                <option value="Female">Perempuan</option>
                            </select>
                            <small class="helper-text">Auto dari IC, manual untuk Passport</small>
                        </div>
                        <div class="form-group">
                            <label>No. Telefon <span class="required">*</span></label>
                            <input type="tel" id="opdPhone" required placeholder="012-3456789">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Jenis Lawatan <span class="required">*</span></label>
                        <select id="opdVisitType" required>
                            <option value="">Pilih jenis lawatan...</option>
                            ${CONFIG.OPD_CASE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="opdLuarKawasan" onchange="Registration.toggleLuarKawasan('opd')">
                            <label for="opdLuarKawasan" style="font-weight: 500; margin: 0;">
                                Pesakit dari luar kawasan klinik
                            </label>
                        </div>
                        <div id="opdLuarKawasanInput" class="luar-kawasan-input">
                            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
                                Nama Tempat Tinggal <span class="required">*</span>
                            </label>
                            <input type="text" id="opdKawasan" placeholder="Contoh: Taman Sejahtera, Kampung Baru">
                            <small class="helper-text">Nyatakan nama taman, kampung atau kawasan</small>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-opd" style="width: 100%;">
                        💾 Daftar Pesakit
                    </button>
                </form>
            </div>
        `;

        this.setupFormHandlers('opd');
    },

    /**
     * Load MCH Registration Form
     */
    loadMCHForm() {
        // Check permission
        if (!Auth.hasPermission('register_mch')) {
            Utils.showAlert('Akses ditolak', 'error');
            return;
        }

        // Check time-based access
        const access = Utils.checkMCHAccess();
        if (!access.allowed) {
            Utils.showAlert(access.message, 'warning');
            return;
        }

        this.currentType = 'mch';
        const content = document.getElementById('mainContent');

        content.innerHTML = `
            <div class="page-header">
                <h1>👶 Pendaftaran Ibu & Anak (MCH)</h1>
                <p>Pendaftaran untuk perkhidmatan kesihatan ibu dan anak</p>
            </div>

            <div class="info-box mch-info">
                <strong>⏰ Waktu Pendaftaran:</strong> ${CONFIG.MCH_HOURS.start} - ${CONFIG.MCH_HOURS.end} (${CONFIG.MCH_HOURS.daysText})
            </div>

            <div class="registration-form-container">
                <form id="mchForm" class="registration-form">
                    <div class="success-message" id="mchSuccess">✅ Pendaftaran berjaya! Terima kasih.</div>
                    <div class="error-message" id="mchError">❌ Ralat berlaku. Sila cuba lagi.</div>
                    
                    <div id="mchPatientInfo"></div>

                    <div class="form-group">
                        <label>No. Kad Pengenalan / Passport <span class="required">*</span></label>
                        <input type="text" id="mchIc" required placeholder="Contoh: 900101-01-1234 atau A12345678">
                        <small class="helper-text">Format IC: YYMMDD-XX-XXXX atau Nombor Passport</small>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Nama Penuh <span class="required">*</span></label>
                            <input type="text" id="mchName" required placeholder="Nama penuh pesakit">
                        </div>
                        <div class="form-group">
                            <label>Umur <span class="required">*</span></label>
                            <input type="number" id="mchAge" required placeholder="Umur" min="0" max="150">
                            <small class="helper-text">Auto dari IC, manual untuk Passport</small>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Jantina <span class="required">*</span></label>
                            <select id="mchGender" required>
                                <option value="">Pilih...</option>
                                <option value="Male">Lelaki</option>
                                <option value="Female">Perempuan</option>
                            </select>
                            <small class="helper-text">Auto dari IC, manual untuk Passport</small>
                        </div>
                        <div class="form-group">
                            <label>No. Telefon <span class="required">*</span></label>
                            <input type="tel" id="mchPhone" required placeholder="012-3456789">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Jenis Lawatan <span class="required">*</span></label>
                        <select id="mchVisitType" required>
                            <option value="">Pilih jenis lawatan...</option>
                            ${CONFIG.MCH_CASE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="mchLuarKawasan" onchange="Registration.toggleLuarKawasan('mch')">
                            <label for="mchLuarKawasan" style="font-weight: 500; margin: 0;">
                                Saya dari luar kawasan klinik ini
                            </label>
                        </div>
                        <div id="mchLuarKawasanInput" class="luar-kawasan-input">
                            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">
                                Nama Tempat Tinggal <span class="required">*</span>
                            </label>
                            <input type="text" id="mchKawasan" placeholder="Contoh: Taman Sejahtera, Kampung Baru">
                            <small class="helper-text">Nyatakan nama taman, kampung atau kawasan</small>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-mch" style="width: 100%;">
                        💾 Daftar Sekarang
                    </button>
                </form>
            </div>
        `;

        this.setupFormHandlers('mch');
    },

    /**
     * Setup form handlers
     */
    setupFormHandlers(type) {
        // IC input - auto parse
        const icInput = document.getElementById(`${type}Ic`);
        const nameInput = document.getElementById(`${type}Name`);
        const ageInput = document.getElementById(`${type}Age`);
        const genderInput = document.getElementById(`${type}Gender`);

        if (icInput) {
            icInput.addEventListener('blur', async () => {
                const ic = icInput.value.trim();
                if (!ic) return;

                // Check if IC or Passport
                const idType = Utils.isICOrPassport(ic);
                
                if (idType === 'IC') {
                    // Parse IC
                    const parsed = Utils.parseIC(ic);
                    if (parsed) {
                        ageInput.value = parsed.age;
                        ageInput.readOnly = true;
                        ageInput.classList.remove('editable');
                        
                        genderInput.value = parsed.gender;
                        genderInput.disabled = true;
                        genderInput.classList.remove('editable');

                        // Check if existing patient
                        await this.checkExistingPatient(type, ic);
                    }
                } else if (idType === 'PASSPORT') {
                    // Enable manual entry for passport
                    ageInput.readOnly = false;
                    ageInput.classList.add('editable');
                    genderInput.disabled = false;
                    genderInput.classList.add('editable');

                    // Check if existing patient
                    await this.checkExistingPatient(type, ic);
                } else {
                    Utils.showAlert('Format IC atau Passport tidak sah', 'error');
                }
            });
        }

        // Form submission
        const form = document.getElementById(`${type}Form`);
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitRegistration(type);
            });
        }
    },

    /**
     * Check existing patient
     */
    async checkExistingPatient(type, patientId) {
        try {
            // Check cache first
            if (this.patientCache[patientId]) {
                this.showPatientInfo(type, this.patientCache[patientId]);
                return;
            }

            // Fetch from API (in production)
            // const patient = await API.getPatient(patientId);
            
            // For now, check localStorage
            const patient = Utils.getFromStorage(`patient_${patientId}`);
            
            if (patient) {
                this.patientCache[patientId] = patient;
                this.showPatientInfo(type, patient);
                
                // Auto-fill
                document.getElementById(`${type}Name`).value = patient.name;
                document.getElementById(`${type}Phone`).value = patient.phone;
            }
            
        } catch (error) {
            console.error('Error checking patient:', error);
        }
    },

    /**
     * Show patient info card
     */
    showPatientInfo(type, patient) {
        const container = document.getElementById(`${type}PatientInfo`);
        if (!container) return;

        container.innerHTML = `
            <div class="patient-info-card">
                <h3>✅ Pesakit Sedia Ada</h3>
                <p><strong>Nama:</strong> ${patient.name}</p>
                <p><strong>IC/Passport:</strong> ${patient.patientId}</p>
                <p><strong>Telefon:</strong> ${patient.phone}</p>
                <p><strong>Lawatan terakhir:</strong> ${patient.lastVisit || '-'}</p>
            </div>
        `;
    },

    /**
     * Toggle luar kawasan input
     */
    toggleLuarKawasan(type) {
        const checkbox = document.getElementById(`${type}LuarKawasan`);
        const input = document.getElementById(`${type}LuarKawasanInput`);
        
        if (checkbox && input) {
            if (checkbox.checked) {
                input.classList.add('active');
            } else {
                input.classList.remove('active');
            }
        }
    },

    /**
     * Submit registration
     */
    async submitRegistration(type) {
        const form = document.getElementById(`${type}Form`);
        const successMsg = document.getElementById(`${type}Success`);
        const errorMsg = document.getElementById(`${type}Error`);

        try {
            // Collect form data
            const data = {
                patientId: document.getElementById(`${type}Ic`).value.trim(),
                name: document.getElementById(`${type}Name`).value.trim(),
                age: parseInt(document.getElementById(`${type}Age`).value),
                gender: document.getElementById(`${type}Gender`).value,
                phone: document.getElementById(`${type}Phone`).value.trim(),
                visitType: document.getElementById(`${type}VisitType`).value,
                luarKawasan: document.getElementById(`${type}LuarKawasan`).checked,
                kawasan: document.getElementById(`${type}Kawasan`)?.value?.trim() || ''
            };

            // Validate
            if (!data.patientId || !data.name || !data.age || !data.gender || !data.phone || !data.visitType) {
                throw new Error('Sila lengkapkan semua medan wajib');
            }

            // Format luar kawasan
            if (data.luarKawasan) {
                if (!data.kawasan) {
                    throw new Error('Sila nyatakan nama tempat tinggal untuk pesakit luar kawasan');
                }
                data.luarKawasanText = `Yes - ${data.kawasan}`;
                Dashboard.incrementStat('luarKawasan');
            } else {
                data.luarKawasanText = 'No';
            }

            // Submit to API
            await API.registerPatient(type, data);

            // Save to cache
            this.patientCache[data.patientId] = data;
            Utils.saveToStorage(`patient_${data.patientId}`, data);

            // Update stats
            Dashboard.incrementStat(type);

            // Check and auto-link appointment
            const today = Utils.getCurrentDate();
            const linked = await API.linkAppointmentToRegistration(data.patientId, today);
            
            if (linked.linked) {
                Utils.showAlert(`Pendaftaran berjaya! ${linked.count} temujanji dikemaskini.`, 'success');
                Dashboard.incrementStat('completed');
            } else {
                successMsg.style.display = 'block';
                setTimeout(() => successMsg.style.display = 'none', 3000);
            }

            // Handle form based on type
            if (type === 'mch') {
                // MCH: Close after 3 seconds
                setTimeout(() => {
                    form.reset();
                    document.getElementById(`${type}PatientInfo`).innerHTML = '';
                }, 3000);
            } else {
                // OPD: Clear form, keep open
                form.reset();
                document.getElementById(`${type}PatientInfo`).innerHTML = '';
                
                // Re-enable fields
                document.getElementById(`${type}Age`).readOnly = false;
                document.getElementById(`${type}Gender`).disabled = false;
                
                // Focus back to IC input
                document.getElementById(`${type}Ic`).focus();
            }

        } catch (error) {
            console.error('Registration error:', error);
            errorMsg.textContent = `❌ ${error.message}`;
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.style.display = 'none', 5000);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Registration;
}
