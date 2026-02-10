/**
 * Klinik Kesihatan Lunas - Configuration
 * All system constants and settings
 */

const CONFIG = {
    // Google Sheets Configuration
    SPREADSHEET_ID: '17bJ-IZhreAuJvRdwhzwWnITLRdXA8oyQ3AZotigGhdo',
    APPS_SCRIPT_URL: localStorage.getItem('appsScriptUrl') || '',
    
    // MCH Access Hours
    MCH_HOURS: {
        start: '07:30',
        end: '16:45',
        startMinutes: 730,  // 7:30 AM in minutes
        endMinutes: 1645,   // 4:45 PM in minutes
        days: [0, 1, 2, 3, 4], // Sunday-Thursday (0=Sun, 6=Sat)
        daysText: 'Ahad hingga Khamis'
    },

    // Clinic Operating Days
    CLINIC_DAYS: [0, 1, 2, 3, 4], // Sunday-Thursday
    WEEKEND_DAYS: [5, 6], // Friday-Saturday
    
    // NCD Case Types (for monthly tracking)
    NCD_CASES: ['DM', 'HPT', 'BA'],
    
    // All OPD Case Types
    OPD_CASE_TYPES: [
        'Pesakit Luar (OPD)',
        'Kencing Manis (DM)',
        'Hipertensi (HPT)',
        'Asthma (BA)',
        'URTI',
        'DOTs/TB',
        'Dressing',
        'Kaunseling',
        'Pengambilan Darah',
        'Fisioterapi dan Jurupulih Cara Kerja',
        'Klinik Berhenti Merokok (KBM)',
        'Diabetic Educator (DE)',
        'Fundus',
        'HIV/STI',
        'Pakar Perubatan Keluarga (FMS)',
        'Kesihatan Mesra Remaja (PKMR)',
        'Vaksin'
    ],
    
    // MCH Case Types
    MCH_CASE_TYPES: [
        'Lawatan Baru',
        'Susulan',
        'Antenatal (Pra-natal)',
        'Postnatal (Pasca-natal)',
        'Imunisasi Kanak-kanak',
        'Kesihatan Kanak-kanak'
    ],
    
    // Appointment Status
    APPOINTMENT_STATUS: {
        PENDING: 'Pending',
        COMPLETED: 'Selesai',
        MISSED: 'Tidak Hadir',
        CANCELLED: 'Cancelled'
    },
    
    // Patient Status
    PATIENT_STATUS: {
        ACTIVE: 'Active',
        PENDING: 'Pending',
        COMPLETED: 'Completed',
        INACTIVE: 'Inactive'
    },
    
    // User Roles
    ROLES: {
        SUPERADMIN: 'superadmin',
        ADMIN_MCH: 'admin_mch',
        ADMIN_OPD: 'admin_opd'
    },
    
    // User Role Permissions
    PERMISSIONS: {
        superadmin: [
            'all',
            'register_opd',
            'register_mch',
            'view_all_data',
            'manage_appointments',
            'block_dates',
            'manage_slots',
            'manage_users',
            'manage_sheets',
            'system_settings',
            'delete_records'
        ],
        admin_mch: [
            'register_mch',
            'view_mch_data',
            'manage_mch_appointments',
            'view_mch_sheets'
        ],
        admin_opd: [
            'register_opd',
            'view_opd_data',
            'manage_opd_appointments',
            'view_opd_sheets'
        ]
    },
    
    // Session Configuration
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    
    // Default Users (in production, fetch from Google Sheets)
    DEFAULT_USERS: {
        'superadmin': {
            password: 'super2026',
            role: 'superadmin',
            fullName: 'Super Administrator',
            email: 'admin@kliniklunas.my'
        },
        'admin_mch': {
            password: 'mch2026',
            role: 'admin_mch',
            fullName: 'Admin MCH',
            email: 'mch@kliniklunas.my'
        },
        'admin_opd': {
            password: 'opd2026',
            role: 'admin_opd',
            fullName: 'Admin OPD',
            email: 'opd@kliniklunas.my'
        }
    },
    
    // Appointment Window (days ± for NCD check)
    APPOINTMENT_WINDOW_DAYS: 3,
    
    // Default Appointment Slots (configurable by superadmin)
    DEFAULT_SLOTS: {
        'DM': [
            { time: '08:00', slots: 10 },
            { time: '09:00', slots: 10 },
            { time: '10:00', slots: 10 }
        ],
        'HPT': [
            { time: '08:00', slots: 12 },
            { time: '09:00', slots: 12 },
            { time: '10:00', slots: 12 }
        ],
        'BA': [
            { time: '08:30', slots: 8 },
            { time: '10:00', slots: 8 }
        ],
        'Fundus': [
            { time: '08:30', slots: 5 },
            { time: '10:00', slots: 5 },
            { time: '14:00', slots: 5 }
        ],
        'DE': [
            { time: '14:00', slots: 8 },
            { time: '15:00', slots: 8 }
        ],
        'Dressing': [
            { time: '09:00', slots: 10 },
            { time: '14:00', slots: 10 }
        ]
    },
    
    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000,
        MODAL_BACKDROP_OPACITY: 0.6,
        CHARTS_HEIGHT: 320
    },
    
    // Date/Time Formats
    FORMATS: {
        DATE: 'dd/MM/yyyy',
        TIME: 'HH:mm:ss',
        DATETIME: 'dd/MM/yyyy HH:mm:ss',
        DISPLAY_DATE: 'DD MMM YYYY',
        DISPLAY_TIME: 'HH:mm'
    },
    
    // Validation Rules
    VALIDATION: {
        IC_REGEX: /^\d{6}-\d{2}-\d{4}$/,
        PASSPORT_REGEX: /^[A-Z0-9]{6,12}$/,
        PHONE_REGEX: /^01[0-9]-\d{7,8}$/,
        MIN_AGE: 0,
        MAX_AGE: 150,
        MIN_PASSWORD_LENGTH: 6
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        SESSION: 'klinik_session',
        APPS_SCRIPT_URL: 'appsScriptUrl',
        SLOT_CONFIG: 'slotConfig',
        DAILY_STATS: 'dailyStats',
        THEME: 'theme'
    },
    
    // API Actions
    API_ACTIONS: {
        // Registration
        REGISTER_OPD: 'registerOPD',
        REGISTER_MCH: 'registerMCH',
        GET_PATIENT: 'getPatient',
        
        // Appointments
        CREATE_APPOINTMENT: 'createAppointment',
        GET_APPOINTMENTS: 'getAppointments',
        UPDATE_APPOINTMENT: 'updateAppointment',
        SEARCH_APPOINTMENTS: 'searchAppointments',
        
        // Admin
        BLOCK_DATE: 'blockDate',
        UNBLOCK_DATE: 'unblockDate',
        GET_BLOCKED_DATES: 'getBlockedDates',
        UPDATE_SLOTS: 'updateSlots',
        GET_SLOTS: 'getSlots',
        
        // Users
        GET_USERS: 'getUsers',
        ADD_USER: 'addUser',
        UPDATE_USER: 'updateUser',
        DELETE_USER: 'deleteUser',
        
        // Sheets Registry
        GET_SHEETS: 'getSheets',
        ADD_SHEET: 'addSheet',
        UPDATE_SHEET: 'updateSheet',
        DELETE_SHEET: 'deleteSheet',
        
        // System
        GET_SETTINGS: 'getSettings',
        UPDATE_SETTINGS: 'updateSettings',
        GET_STATS: 'getStats'
    },
    
    // Sheet Names
    SHEETS: {
        REGISTRATION: 'Registration',
        REGISTRATION_MCH: 'RegistrationMCH',
        APPOINTMENTS: 'Appointments',
        USERS: 'Users',
        SHEETS_REGISTRY: 'SheetsRegistry',
        SYSTEM_SETTINGS: 'SystemSettings',
        BLOCKED_DATES: 'BlockedDates',
        APPOINTMENT_SLOTS: 'AppointmentSlots',
        LOGS: 'Logs'
    },
    
    // Blocked Date Categories
    BLOCKED_DATE_CATEGORIES: [
        'Cuti Perayaan',
        'Cuti Peristiwa',
        'Cuti Khas',
        'Latihan Staff',
        'Penyelenggaraan',
        'Lain-lain'
    ],
    
    // Clinic Information
    CLINIC_INFO: {
        name: 'Klinik Kesihatan Lunas',
        code: 'KKL001',
        state: 'Kedah',
        district: 'Kuala Muda',
        address: 'Jalan Lunas, 09600 Lunas, Kedah',
        phone: '04-4888888',
        email: 'kklunas@moh.gov.my'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.MCH_HOURS);
Object.freeze(CONFIG.PERMISSIONS);
Object.freeze(CONFIG.DEFAULT_USERS);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.FORMATS);
Object.freeze(CONFIG.VALIDATION);
Object.freeze(CONFIG.API_ACTIONS);
Object.freeze(CONFIG.CLINIC_INFO);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
