/**
 * CNHS Online Enrollment - Google Apps Script backend
 * 1. Create a Google Spreadsheet.
 * 2. Open Extensions > Apps Script and replace the editor contents with this file.
 * 3. Set SPREADSHEET_ID below to the ID from the spreadsheet URL.
 * 4. Deploy as a Web app: Execute as "Me"; Who has access: "Anyone".
 *
 * Protect the spreadsheet and limit access to authorized school personnel.
 */

const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SPREADSHEET_ID_HERE";
const SHEET_NAME = "Enrollment Responses";

const HEADERS = [
  "Timestamp", "School Year", "Grade Level", "Enrollment Type", "LRN",
  "Last Name", "First Name", "Middle Name", "Suffix", "Date of Birth", "Sex",
  "Home Address", "Previous School", "Last Grade Completed",
  "Parent/Guardian Name", "Relationship", "Mobile Number", "Email",
  "Grade - Filipino", "Grade - English", "Grade - Science", "Grade - Mathematics",
  "Grade - Araling Panlipunan", "Grade - Values Education",
  "Grade - TLE", "Grade - MAPEH", "Privacy Consent"
];

function doGet() {
  return ContentService
    .createTextOutput("CNHS Enrollment API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, message: "Empty request." });
    }

    const data = JSON.parse(e.postData.contents);

    // Honeypot for basic automated spam.
    if (data.website) return jsonResponse({ ok: true });

    const required = [
      "schoolYear", "gradeLevel", "enrollmentType", "lastName",
      "firstName", "birthDate", "sex", "address", "guardianName",
      "relationship", "contactNumber"
    ];
    const missing = required.filter(key => !String(data[key] || "").trim());
    if (missing.length || data.consent !== true) {
      return jsonResponse({
        ok: false,
        message: "Required information or privacy consent is missing."
      });
    }

    if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf("PASTE_YOUR_") === 0) {
      throw new Error("Set SPREADSHEET_ID in Code.gs before deployment.");
    }

    lock.waitLock(15000);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    const row = [
      new Date(),
      clean(data.schoolYear), clean(data.gradeLevel), clean(data.enrollmentType),
      clean(data.lrn), clean(data.lastName), clean(data.firstName),
      clean(data.middleName), clean(data.suffix), clean(data.birthDate),
      clean(data.sex), clean(data.address), clean(data.previousSchool),
      clean(data.lastGrade), clean(data.guardianName), clean(data.relationship),
      clean(data.contactNumber), clean(data.email),
      clean(data.gradeFilipino), clean(data.gradeEnglish),
      clean(data.gradeScience), clean(data.gradeMath),
      clean(data.gradeAralPan), clean(data.gradeValues),
      clean(data.gradeTLE), clean(data.gradeMAPEH), "Yes"
    ];
    sheet.appendRow(row);
    return jsonResponse({ ok: true, message: "Enrollment application saved." });

  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, message: String(error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function clean(value) {
  // Prevent spreadsheet formula injection and trim excessive whitespace.
  const text = String(value == null ? "" : value).trim().slice(0, 2000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
