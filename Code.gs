/*
 * Google Apps Script to collect form submissions from the event registration
 * website and append them to a Google Sheet. See the accompanying README
 * for deployment instructions.
 */

const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

/**
 * Run this function one time from the Apps Script editor to set up the
 * script with your spreadsheet. It stores the spreadsheet ID in the
 * script’s properties so that `doPost` can access it securely.
 */
function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

/**
 * Handle POST requests from the web form.
 *
 * The form should send name/value pairs matching the headers in your sheet.
 * Additional fields like Amount and EtransferSent are included by the
 * front‑end script. This function appends a new row with these values.
 *
 * @param {Object} e Event parameter containing POST data.
 * @returns {ContentService.TextOutput} A JSON object indicating success.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    // Fetch header names from the first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;
    const newRow = headers.map(function(header) {
      if (header === 'Date') {
        return new Date();
      }
      return e.parameter[header] || '';
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}