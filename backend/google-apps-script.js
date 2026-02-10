/**
 * Klinik Kesihatan Lunas - Google Apps Script Backend
 * Handles all data operations with Google Sheets
 */

// Configuration
const SPREADSHEET_ID = '17bJ-IZhreAuJvRdwhzwWnITLRdXA8oyQ3AZotigGhdo';

// Sheet Names
const SHEETS = {
  REGISTRATION: 'Registration',
  REGISTRATION_MCH: 'RegistrationMCH',
  APPOINTMENTS: 'Appointments',
  USERS: 'Users',
  SHEETS_REGISTRY: 'SheetsRegistry',
  SYSTEM_SETTINGS: 'SystemSettings',
  BLOCKED_DATES: 'BlockedDates',
  APPOINTMENT_SLOTS: 'AppointmentSlots',
  LOGS: 'Logs'
};

/**
 * Setup all sheets (Run this once)
 */
function setupAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Registration (OPD)
  createSheetIfNotExists(ss, SHEETS.REGISTRATION, [
    'Timestamp', 'Patient ID', 'Patient Name', '#', 'Age', 'Gender', 
    'Phone Number', 'Visit Type', 'Status', 'Luar Kawasan', 'Date', 'Time'
  ]);
  
  // 2. RegistrationMCH
  createSheetIfNotExists(ss, SHEETS.REGISTRATION_MCH, [
    'Timestamp', 'Patient ID', 'Patient Name', '#', 'Age', 'Gender', 
    'Phone Number', 'Visit Type', 'Status', 'Luar Kawasan', 'Date', 'Time'
  ]);
  
  // 3. Appointments
  createSheetIfNotExists(ss, SHEETS.APPOINTMENTS, [
    'Timestamp', 'ID', 'Patient ID', 'Patient Name', 'Phone Number', 
    'Case Type', 'Appointment Date', 'Time Slot', 'Notes', 'Status', 
    'Registration ID', 'Created By'
  ]);
  
  // 4. Users
  createSheetIfNotExists(ss, SHEETS.USERS, [
    'Username', 'Password', 'Role', 'Full Name', 'Email', 
    'Active', 'Created Date', 'Last Login'
  ]);
  
  // Add default users
  addDefaultUsers(ss);
  
  // 5. SheetsRegistry
  createSheetIfNotExists(ss, SHEETS.SHEETS_REGISTRY, [
    'Sheet ID', 'Sheet Name', 'Description', 'Category', 'URL', 
    'Icon', 'Access Roles', 'Created By', 'Created Date', 'Active'
  ]);
  
  // 6. SystemSettings
  createSheetIfNotExists(ss, SHEETS.SYSTEM_SETTINGS, [
    'Setting Key', 'Setting Value', 'Description', 'Last Updated By', 'Last Updated Date'
  ]);
  
  // Add default settings
  addDefaultSettings(ss);
  
  // 7. BlockedDates
  createSheetIfNotExists(ss, SHEETS.BLOCKED_DATES, [
    'Date', 'Reason', 'Category', 'Created By', 'Created Date', 'Active'
  ]);
  
  // 8. AppointmentSlots
  createSheetIfNotExists(ss, SHEETS.APPOINTMENT_SLOTS, [
    'Case Type', 'Day', 'Time Slot', 'Max Slots', 'Active', 'Updated By', 'Updated Date'
  ]);
  
  // 9. Logs
  createSheetIfNotExists(ss, SHEETS.LOGS, [
    'Timestamp', 'Event', 'User', 'Details'
  ]);
  
  Logger.log('✅ All sheets created successfully!');
  return 'Setup complete!';
}

function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log(`Created sheet: ${sheetName}`);
  }
  
  return sheet;
}

function addDefaultUsers(ss) {
  const sheet = ss.getSheetByName(SHEETS.USERS);
  if (sheet.getLastRow() > 1) return; // Already has users
  
  const users = [
    ['superadmin', 'super2026', 'superadmin', 'Super Administrator', 'admin@kliniklunas.my', 'Yes', new Date(), ''],
    ['admin_mch', 'mch2026', 'admin_mch', 'Admin MCH', 'mch@kliniklunas.my', 'Yes', new Date(), ''],
    ['admin_opd', 'opd2026', 'admin_opd', 'Admin OPD', 'opd@kliniklunas.my', 'Yes', new Date(), '']
  ];
  
  sheet.getRange(2, 1, users.length, 8).setValues(users);
  Logger.log('Added default users');
}

function addDefaultSettings(ss) {
  const sheet = ss.getSheetByName(SHEETS.SYSTEM_SETTINGS);
  if (sheet.getLastRow() > 1) return; // Already has settings
  
  const settings = [
    ['mch_start_time', '07:30', 'MCH access start time', 'system', new Date()],
    ['mch_end_time', '16:45', 'MCH access end time', 'system', new Date()],
    ['clinic_days', '0,1,2,3,4', 'Operating days (0=Sun, 4=Thu)', 'system', new Date()],
    ['ncd_cases', 'DM,HPT,BA', 'NCD case types', 'system', new Date()],
    ['appointment_window', '3', 'Days window for NCD check', 'system', new Date()]
  ];
  
  sheet.getRange(2, 1, settings.length, 5).setValues(settings);
  Logger.log('Added default settings');
}

/**
 * Web App Handlers
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getAppointments':
        return getAppointments(e.parameter);
      case 'searchAppointments':
        return searchAppointments(e.parameter);
      case 'getBlockedDates':
        return getBlockedDates();
      case 'getSlots':
        return getSlots(e.parameter);
      case 'getSheets':
        return getSheets(e.parameter);
      case 'getStats':
        return getStats(e.parameter);
      case 'ping':
        return jsonResponse({success: true, message: 'Server is running'});
      default:
        return jsonResponse({success: false, error: 'Unknown action'});
    }
  } catch (error) {
    return jsonResponse({success: false, error: error.toString()});
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  try {
    switch(action) {
      case 'registerOPD':
        return registerPatient(data, SHEETS.REGISTRATION);
      case 'registerMCH':
        return registerPatient(data, SHEETS.REGISTRATION_MCH);
      case 'createAppointment':
        return createAppointment(data);
      case 'updateAppointment':
        return updateAppointment(data);
      case 'blockDate':
        return blockDate(data);
      case 'unblockDate':
        return unblockDate(data);
      case 'addSheet':
        return addSheet(data);
      default:
        return jsonResponse({success: false, error: 'Unknown action'});
    }
  } catch (error) {
    return jsonResponse({success: false, error: error.toString()});
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Registration Functions
 */
function registerPatient(data, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  const counter = sheet.getLastRow();
  const now = new Date();
  
  const row = [
    now,
    data.patientId,
    data.name,
    counter,
    data.age,
    data.gender,
    data.phone,
    data.visitType,
    data.status,
    data.luarKawasanText || 'No',
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss')
  ];
  
  sheet.appendRow(row);
  
  // Log event
  logEvent('registration', data.createdBy || 'system', {
    type: sheetName,
    patientId: data.patientId,
    name: data.name
  });
  
  return jsonResponse({success: true, message: 'Registration successful'});
}

/**
 * Appointment Functions
 */
function createAppointment(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.APPOINTMENTS);
  
  const id = 'APPT_' + new Date().getTime();
  const row = [
    new Date(),
    id,
    data.patientId,
    data.patientName,
    data.phone,
    data.caseType,
    data.date,
    data.timeSlot,
    data.notes || '',
    'Pending',
    data.registrationId || '',
    data.createdBy || 'system'
  ];
  
  sheet.appendRow(row);
  
  logEvent('create_appointment', data.createdBy, {
    appointmentId: id,
    patientId: data.patientId,
    date: data.date
  });
  
  return jsonResponse({success: true, id: id});
}

function getAppointments(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.APPOINTMENTS);
  const data = sheet.getDataRange().getValues();
  
  const appointments = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const apptDate = Utilities.formatDate(row[6], Session.getScriptTimeZone(), 'dd/MM/yyyy');
    
    if (params.date && apptDate !== params.date) continue;
    
    appointments.push({
      id: row[1],
      patientId: row[2],
      patientName: row[3],
      phone: row[4],
      caseType: row[5],
      date: apptDate,
      timeSlot: row[7],
      notes: row[8],
      status: row[9]
    });
  }
  
  return jsonResponse({success: true, data: appointments});
}

function searchAppointments(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.APPOINTMENTS);
  const data = sheet.getDataRange().getValues();
  
  const query = params.query.toLowerCase();
  const field = params.field;
  const results = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let match = false;
    
    if (field === 'name' && row[3].toString().toLowerCase().includes(query)) {
      match = true;
    } else if (field === 'ic' && row[2].toString().toLowerCase().includes(query)) {
      match = true;
    } else if (field === 'date') {
      const apptDate = Utilities.formatDate(row[6], Session.getScriptTimeZone(), 'dd/MM/yyyy');
      if (apptDate.includes(query)) match = true;
    }
    
    if (match) {
      results.push({
        id: row[1],
        patientId: row[2],
        patientName: row[3],
        phone: row[4],
        caseType: row[5],
        date: Utilities.formatDate(row[6], Session.getScriptTimeZone(), 'dd/MM/yyyy'),
        timeSlot: row[7],
        notes: row[8],
        status: row[9]
      });
    }
  }
  
  return jsonResponse({success: true, data: results});
}

function updateAppointment(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.APPOINTMENTS);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === data.appointmentId) {
      if (data.status) sheet.getRange(i + 1, 10).setValue(data.status);
      if (data.registrationId) sheet.getRange(i + 1, 11).setValue(data.registrationId);
      
      return jsonResponse({success: true});
    }
  }
  
  return jsonResponse({success: false, error: 'Appointment not found'});
}

/**
 * Blocked Dates Functions
 */
function getBlockedDates() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BLOCKED_DATES);
  const data = sheet.getDataRange().getValues();
  
  const dates = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][5] === 'Yes' || data[i][5] === true) {
      dates.push({
        date: data[i][0],
        reason: data[i][1],
        category: data[i][2]
      });
    }
  }
  
  return jsonResponse({success: true, data: dates});
}

function blockDate(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BLOCKED_DATES);
  
  const row = [
    data.date,
    data.reason,
    data.category,
    data.createdBy,
    new Date(),
    'Yes'
  ];
  
  sheet.appendRow(row);
  
  return jsonResponse({success: true});
}

function unblockDate(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BLOCKED_DATES);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.date) {
      sheet.getRange(i + 1, 6).setValue('No');
      return jsonResponse({success: true});
    }
  }
  
  return jsonResponse({success: false, error: 'Date not found'});
}

/**
 * Slots Functions
 */
function getSlots(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.APPOINTMENT_SLOTS);
  const data = sheet.getDataRange().getValues();
  
  const slots = [];
  for (let i = 1; i < data.length; i++) {
    if (params.caseType && data[i][0] !== params.caseType) continue;
    if (data[i][4] !== 'Yes' && data[i][4] !== true) continue;
    
    slots.push({
      caseType: data[i][0],
      day: data[i][1],
      time: data[i][2],
      slots: data[i][3]
    });
  }
  
  return jsonResponse({success: true, data: slots});
}

/**
 * Sheets Registry Functions
 */
function getSheets(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SHEETS_REGISTRY);
  const data = sheet.getDataRange().getValues();
  
  const sheets = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][9] !== 'Yes' && data[i][9] !== true) continue;
    
    const accessRoles = data[i][6].split(',');
    if (params.role && !accessRoles.includes(params.role) && !accessRoles.includes('all')) {
      continue;
    }
    
    sheets.push({
      id: data[i][0],
      name: data[i][1],
      description: data[i][2],
      category: data[i][3],
      url: data[i][4],
      icon: data[i][5]
    });
  }
  
  return jsonResponse({success: true, data: sheets});
}

function addSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SHEETS_REGISTRY);
  
  const row = [
    data.sheetId,
    data.name,
    data.description,
    data.category,
    data.url,
    data.icon,
    data.accessRoles.join(','),
    data.createdBy,
    new Date(),
    'Yes'
  ];
  
  sheet.appendRow(row);
  
  return jsonResponse({success: true});
}

/**
 * Statistics Functions
 */
function getStats(params) {
  // Simplified stats - in production, calculate from sheets
  const stats = {
    mch: 0,
    opd: 0,
    completed: 0,
    pending: 0,
    missed: 0
  };
  
  return jsonResponse({success: true, data: stats});
}

/**
 * Logging Function
 */
function logEvent(event, user, details) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.LOGS);
    
    const row = [
      new Date(),
      event,
      user,
      JSON.stringify(details)
    ];
    
    sheet.appendRow(row);
  } catch (error) {
    Logger.log('Logging error: ' + error);
  }
}
