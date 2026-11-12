/**
 * Calinan National High School - Online Enrollment
 * Google Apps Script backend for index.html
 *
 * SETUP:
 * 1. Create/open your Google Spreadsheet.
 * 2. Copy its ID from the URL: /spreadsheets/d/SPREADSHEET_ID/edit
 * 3. Paste the ID into SPREADSHEET_ID below.
 * 4. Deploy as a Web app: Execute as "Me", Who has access: "Anyone".
 */

const SPREADSHEET_ID = "https://script.google.com/macros/s/AKfycbyuIBEzmw6-Gb4l-sdVzbqmpMtQgcRuEFY6XnlqRNRI1Ysjp6Fpx5C4xFKOQF73L8mE/exec";
const SHEET_NAME = "Enrollment Responses";

const HEADERS = [
  "Submitted At",
  "School Year",
  "Grade Level",
  "Enrollment Type",
  "LRN",
  "Last Name",
  "First Name",
  "Middle Name",
  "Suffix",
  "Date of Birth",
  "Sex",
  "Complete Home Address",
  "Previous School",
  "Last Grade Level Completed",
  "Filipino",
  "English",
  "Science",
  "Mathematics",
  "Araling Panlipunan",
  "Values Education",
  "TLE",
  "MAPEH",
  "Parent/Guardian Full Name",
  "Relationship to Learner",
  "Mobile Number",
  "Email Address",
  "Privacy Consent"
];

function doGet() {
  return jsonResponse({
    success: true,
    message: "CNHS Enrollment endpoint is running.",
    sheet: SHEET_NAME
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No enrollment data was received.");
    }

    const data = JSON.parse(e.postData.contents);

    // The hidden honeypot field should remain empty.
    if (data.website) {
      return jsonResponse({ success: false, message: "Submission rejected." });
    }

    // Basic server-side validation. Browser validation alone is not sufficient.
    const requiredFields = [
      "schoolYear", "gradeLevel", "enrollmentType",
      "lastName", "firstName", "birthDate", "sex",
      "address", "guardianName", "relationship", "contactNumber"
    ];

    const missing = requiredFields.filter(function (field) {
      return !String(data[field] || "").trim();
    });

    if (missing.length) {
      throw new Error("Missing required fields: " + missing.join(", "));
    }

    if (data.consent !== true && data.consent !== "true") {
      throw new Error("Privacy consent is required.");
    }

    const gradeFields = [
      "gradeFilipino", "gradeEnglish", "gradeScience", "gradeMath",
      "gradeAralPan", "gradeValues", "gradeTLE", "gradeMAPEH"
    ];

    gradeFields.forEach(function (field) {
      const value = data[field];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        const grade = Number(value);
        if (!Number.isFinite(grade) || grade < 0 || grade > 100) {
          throw new Error("Invalid grade value for " + field + ".");
        }
      }
    });

    if (SPREADSHEET_ID === "PASTE_YOUR_GOOGLE_SPREADSHEET_ID_HERE") {
      throw new Error("Please configure SPREADSHEET_ID in Code.gs.");
    }

    lock.waitLock(20000);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    // Add headers on a new or empty response sheet.
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    } else {
      // Do not silently append data under a mismatched/older header row.
      const existingHeaders = sheet
        .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
        .getDisplayValues()[0]
        .filter(function (value) { return value !== ""; });

      if (existingHeaders.join("|") !== HEADERS.join("|")) {
        throw new Error(
          'The "' + SHEET_NAME + '" tab has different headers. ' +
          "Use a new empty tab or replace row 1 with the headers defined in Code.gs."
        );
      }
    }

    const row = [
      data.submittedAt || new Date().toISOString(),
      data.schoolYear || "",
      data.gradeLevel || "",
      data.enrollmentType || "",
      data.lrn || "",
      data.lastName || "",
      data.firstName || "",
      data.middleName || "",
      data.suffix || "",
      data.birthDate || "",
      data.sex || "",
      data.address || "",
      data.previousSchool || "",
      data.lastGrade || "",
      data.gradeFilipino || "",
      data.gradeEnglish || "",
      data.gradeScience || "",
      data.gradeMath || "",
      data.gradeAralPan || "",
      data.gradeValues || "",
      data.gradeTLE || "",
      data.gradeMAPEH || "",
      data.guardianName || "",
      data.relationship || "",
      data.contactNumber || "",
      data.email || "",
      true
    ];

    sheet.appendRow(row);

    return jsonResponse({
      success: true,
      message: "Enrollment saved successfully."
    });

  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      message: error && error.message ? error.message : "Unable to save enrollment."
    });

  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
