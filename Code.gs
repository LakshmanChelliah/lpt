/*
 * Google Apps Script to collect form submissions from the event registration
 * website and append them to a Google Sheet.
 */

const sheetName = 'LPT8';
/** Past-player tab for mail merge (normalized list lives only on LPT6). */
const PRIOR_SHEETS_FOR_MAILING = ['LPT6'];

const LPT_EDITION = 'LPT 8';
const SITE_URL = 'https://lakshmanchelliah.github.io/lpt/';
const LPT_EVENT_DATE_LINE = 'Saturday, March 21st at 7:00pm';
const LPT_MAX_PLAYERS = 20;
const LPT_REGISTRATION_DEADLINE_LINE = 'Friday, May 1st, 2026 11:59pm';
/** Shown in the “registration is LIVE” subject line (matches registration close). */
const LPT_LIVE_EMAIL_SUBJECT_TAG = '[Register by May 1]';

const scriptProp = PropertiesService.getScriptProperties();

/**
 * One key per inbox: trim + lowercase; Gmail/Googlemail ignores dots and +labels.
 * Prevents duplicate rows or Gmail aliases (+labels / dots) from double-counting one inbox.
 */
function normalizeEmailForDedup_(raw) {
  var s = String(raw || '')
    .trim()
    .toLowerCase();
  if (!s) return '';
  var at = s.lastIndexOf('@');
  if (at < 1 || at === s.length - 1) return s;
  var local = s.substring(0, at);
  var domain = s.substring(at + 1);
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    var plus = local.indexOf('+');
    if (plus !== -1) local = local.substring(0, plus);
    local = local.replace(/\./g, '');
  }
  return local + '@' + domain;
}

/**
 * RUN THIS ONCE
 * Stores the spreadsheet ID for secure access
 */
function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

/**
 * Run once (or from LPT Tools): creates the registration tab if missing and writes
 * row-1 headers that match the web form + doPost. Skips if row 1 already has columns.
 */
function setupRegistrationSheetHeadersOnce() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);
  if (sh.getLastColumn() >= 1) {
    SpreadsheetApp.getUi().alert(
      'Tab "' +
        sheetName +
        '" already has headers in row 1. Clear row 1 if you need to replace them, then run again.'
    );
    return;
  }
  const headers = [
    'Date',
    'PaymentDueDate',
    'ReminderSent',
    'EtransferSent',
    'Name',
    'Email',
    'Phone',
    'Fee',
    'Amount',
    'Referral'
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  SpreadsheetApp.getUi().alert('Headers added to tab "' + sheetName + '". You can register again.');
}

/**
 * Copies row 1 from LPT6 onto row 1 of the registration tab (creates tab if missing).
 * Use this if LPT8 should match your normalized LPT6 columns exactly.
 */
function copyRegistrationHeadersFromLPT6() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = ss.getSheetByName('LPT6');
  if (!src || src.getLastColumn() < 1) {
    SpreadsheetApp.getUi().alert('LPT6 not found or has no headers in row 1.');
    return;
  }
  const width = src.getLastColumn();
  const row1 = src.getRange(1, 1, 1, width).getValues();
  let dest = ss.getSheetByName(sheetName);
  if (!dest) dest = ss.insertSheet(sheetName);
  if (dest.getLastColumn() >= 1 || dest.getLastRow() > 0) {
    const r = SpreadsheetApp.getUi().alert(
      'Overwrite row 1 on "' + sheetName + '" with headers from LPT6?',
      SpreadsheetApp.getUi().ButtonSet.YES_NO
    );
    if (r !== SpreadsheetApp.getUi().Button.YES) return;
  }
  dest.getRange(1, 1, 1, width).setValues(row1);
  SpreadsheetApp.getUi().alert('Row 1 on "' + sheetName + '" now matches LPT6 headers.');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('LPT Tools')
    .addItem('Set up ' + sheetName + ' headers (row 1)', 'setupRegistrationSheetHeadersOnce')
    .addItem('Copy row-1 headers from LPT6 → ' + sheetName, 'copyRegistrationHeadersFromLPT6')
    .addSeparator()
    .addItem('Send registration live email', 'sendRegistrationLiveEmails')
    .addItem('Send <6 hours left reminder (LPT6 not in LPT8)', 'sendLastChanceSignupReminder')
    .addToUi();
}

/**
 * Handle POST requests from the web form
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    if (!sheet) {
      return ContentService
        .createTextOutput(
          JSON.stringify({
            result: 'error',
            error:
              'Tab "' +
              sheetName +
              '" not found. Add a sheet with that exact name (or change sheetName in Code.gs).'
          })
        )
        .setMimeType(ContentService.MimeType.JSON);
    }

    const lastCol = sheet.getLastColumn();
    if (lastCol < 1) {
      return ContentService
        .createTextOutput(
          JSON.stringify({
            result: 'error',
            error:
              'Tab "' +
              sheetName +
              '" has no header row. In the spreadsheet: Extensions → Apps Script is fine; then use menu LPT Tools → "Set up ' +
              sheetName +
              ' headers (row 1)" OR "Copy row-1 headers from LPT6 → ' +
              sheetName +
              '". Or paste headers manually in row 1 (match LPT6 if that is your template).'
          })
        )
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setHours(dueDate.getHours() + 3);

    const newRow = headers.map(function (header) {
      switch (header) {
        case 'Date':
          return now;

        case 'PaymentDueDate':
          return dueDate;

        case 'ReminderSent':
          return false;

        case 'EtransferSent':
          return 'No';

        default:
          return e.parameter[header] || '';
      }
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Count registrations (used for "spots remaining")
 */
function doGet(e) {
  if (e.parameter.action === 'count') {
    const sheet = SpreadsheetApp.openById(
      scriptProp.getProperty('key')
    ).getSheetByName(sheetName);

    if (!sheet || sheet.getLastColumn() < 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ count: 0 }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    const registrations = Math.max(lastRow - 1, 0); // exclude header

    return ContentService
      .createTextOutput(JSON.stringify({ count: registrations }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * SEND PAYMENT REMINDERS
 */
function sendPaymentReminders() {
  const sheet = SpreadsheetApp.openById(
    scriptProp.getProperty('key')
  ).getSheetByName(sheetName);

  const rows = sheet.getDataRange().getValues();
  const now = new Date();

  const headers = rows[0];
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    if (
      row[idx.EtransferSent] === 'No' &&
      row[idx.ReminderSent] === false &&
      now > new Date(row[idx.PaymentDueDate])
    ) {
      MailApp.sendEmail({
        to: row[idx.Email],
        subject: 'Payment Required – ' + LPT_EDITION + ' Registration',
        htmlBody:
          '<p>Hi ' +
          row[idx.Name] +
          ',</p>' +
          '<p>This is a reminder that your spot is <strong>not confirmed</strong> until payment is received.</p>' +
          '<p><strong>Amount:</strong> $' +
          row[idx.Amount] +
          '</p>' +
          '<p><strong>E-transfer to:</strong> lakshman.chelliah@gmail.com</p>' +
          '<p>Please send your e-transfer as soon as possible.</p>'
      });

      sheet.getRange(i + 1, idx.ReminderSent + 1).setValue(true);
    }
  }
}

/**
 * Unique recipients from one sheet tab.
 * @returns {Map<string, {to: string, name: string}>} dedupKey -> send address + display name
 */
function collectRecipientsFromSheet_(ss, tabName) {
  const out = new Map();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    Logger.log('Sheet not found (skipped): ' + tabName);
    return out;
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return out;

  const headers = rows[0];
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const nameColKey = 'Name';
  const emailColKey = 'Email';
  const nameCol = idx[nameColKey];
  const emailCol = idx[emailColKey];

  if (emailCol == null) {
    throw new Error('Email column not found in ' + tabName + '. Check header name in the sheet.');
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const raw = String(row[emailCol] || '').trim();
    const dedupKey = normalizeEmailForDedup_(raw);
    if (!dedupKey) continue;

    const to = raw.toLowerCase();
    const name = nameCol != null ? String(row[nameCol] || '').trim() : '';

    if (!out.has(dedupKey)) {
      out.set(dedupKey, { to: to, name: name });
    } else {
      const cur = out.get(dedupKey);
      if (!cur.name && name) cur.name = name;
    }
  }
  return out;
}

/**
 * Merge prior tab(s) into one map (one blast per deduped address).
 */
function collectRecipientsFromPriorSheets_(ss) {
  const merged = new Map();
  for (let p = 0; p < PRIOR_SHEETS_FOR_MAILING.length; p++) {
    const tab = PRIOR_SHEETS_FOR_MAILING[p];
    const part = collectRecipientsFromSheet_(ss, tab);
    part.forEach(function (info, dedupKey) {
      if (!merged.has(dedupKey)) {
        merged.set(dedupKey, { to: info.to, name: info.name });
      } else {
        const cur = merged.get(dedupKey);
        if (!cur.name && info.name) cur.name = info.name;
      }
    });
  }
  return merged;
}

/**
 * Send a one-time email to previous players (LPT6 list)
 * announcing that registration is (or will be) live.
 */
function sendRegistrationLiveEmails() {
  const ss = SpreadsheetApp.openById(scriptProp.getProperty('key'));
  const recipients = collectRecipientsFromPriorSheets_(ss);

  if (recipients.size === 0) {
    Logger.log('No recipients found on sheets: ' + PRIOR_SHEETS_FOR_MAILING.join(', '));
    return;
  }

  const subject =
    LPT_EDITION + ' - Poker Registration is LIVE! ' + LPT_LIVE_EMAIL_SUBJECT_TAG;
  const siteUrl = SITE_URL;

  let sentCount = 0;

  recipients.forEach(function (info, dedupKey) {
    const displayName = info.name || 'there';

    const body = [
      'Hi ' + displayName + ',',
      '',
      'Registration for ' + LPT_EDITION + ' IS LIVE.',
      'Event details:',
      '• ' + LPT_EVENT_DATE_LINE,
      '• Every new LPT Player you invite that sign-up, $10 will be reinbursed to you (via etransfer)',
      '• MAX ' + LPT_MAX_PLAYERS + ' Players for ' + LPT_EDITION,
      '',
      'You can register here: ' + siteUrl,
      '',
      'LAST DAY TO REGISTER: ' + LPT_REGISTRATION_DEADLINE_LINE,
      '',
      'If you no longer wish to receive these updates, just reply to this email and let me know.',
      '',
      '– Laksh'
    ].join('\n');

    GmailApp.sendEmail(info.to, subject, body, {
      name: 'LPT'
    });

    sentCount++;
  });

  Logger.log(
    'Sent registration live emails to ' +
      sentCount +
      ' unique recipients (deduped across ' +
      PRIOR_SHEETS_FOR_MAILING.join(' + ') +
      ').'
  );
}

/**
 * Sends reminder emails to people who exist in LPT6 but are not yet in LPT8.
 * Intended for a final "less than 6 hours left" push.
 */
function sendLastChanceSignupReminder() {
  const ss = SpreadsheetApp.openById(scriptProp.getProperty('key'));
  const currentSheet = ss.getSheetByName(sheetName);

  if (!currentSheet) {
    throw new Error('Missing ' + sheetName + ' sheet. Please confirm the sheet name exists.');
  }

  const lpt8Rows = currentSheet.getDataRange().getValues();
  const lpt8Headers = lpt8Rows.length ? lpt8Rows[0] : [];
  const lpt8Idx = Object.fromEntries(lpt8Headers.map((h, i) => [h, i]));

  if (lpt8Idx.Email == null) {
    throw new Error('Email column not found in ' + sheetName + '. Check header names.');
  }

  const lpt8Emails = new Set();
  for (let i = 1; i < lpt8Rows.length; i++) {
    const key = normalizeEmailForDedup_(lpt8Rows[i][lpt8Idx.Email]);
    if (key) lpt8Emails.add(key);
  }

  const priorRecipients = collectRecipientsFromPriorSheets_(ss);
  const recipients = new Map();

  priorRecipients.forEach(function (info, dedupKey) {
    if (!lpt8Emails.has(dedupKey)) recipients.set(dedupKey, info);
  });

  const subject = LPT_EDITION + ' Reminder - Less than 6 hours left to sign up';
  const siteUrl = SITE_URL;
  let sentCount = 0;

  recipients.forEach(function (info, dedupKey) {
    const displayName = info.name || 'there';
    const body = [
      'Hi ' + displayName + ',',
      '',
      'Quick reminder: there are less than 6 hours left to register for ' + LPT_EDITION + '.',
      '',
      'Sign up here: ' + siteUrl,
      '',
      'If you already registered, please ignore this message.',
      '',
      '- Laksh'
    ].join('\n');

    GmailApp.sendEmail(info.to, subject, body, { name: 'LPT' });
    sentCount++;
  });

  Logger.log(
    'Sent final reminder emails to ' +
      sentCount +
      ' recipients (in ' +
      PRIOR_SHEETS_FOR_MAILING.join(' or ') +
      ' but not in ' +
      sheetName +
      ').'
  );
}
