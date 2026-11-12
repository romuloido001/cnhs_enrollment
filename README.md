# Calinan National High School – Online Enrollment Web App

A responsive, GitHub Pages-ready enrollment frontend with a Google Apps Script backend that saves submissions to Google Sheets. The CNHS logo is included in `assets/cnhs-logo.png`.

## Project files

- `index.html` – enrollment page and client-side submission logic
- `assets/cnhs-logo.png` – uploaded school logo
- `google-apps-script/Code.gs` – Google Sheets storage endpoint

## Part 1 – Prepare the Google Sheet

1. Sign in to the Google account that will own the enrollment records.
2. Create a new Google Spreadsheet named **CNHS Enrollment Responses**.
3. Copy the spreadsheet ID from its URL. It is the text between `/d/` and `/edit`.
4. Open **Extensions → Apps Script**.
5. Replace the editor contents with `google-apps-script/Code.gs`.
6. Replace `https://script.google.com/macros/s/AKfycbyuIBEzmw6-Gb4l-sdVzbqmpMtQgcRuEFY6XnlqRNRI1Ysjp6Fpx5C4xFKOQF73L8mE/exec` with your spreadsheet ID.
7. Save the project.

The script creates an `Enrollment Responses` tab and its header row automatically on the first submission.

## Part 2 – Deploy Apps Script as a Web App

1. In Apps Script, choose **Deploy → New deployment**.
2. Select the gear icon and choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone** (the public enrollment page needs to submit without requiring each applicant to sign in).
5. Select **Deploy**, authorize the script, and complete any Google permission prompts.
6. Copy the Web App URL. It normally ends in `/exec`. Do not use the `/dev` test URL for the public site.

**Important:** Anyone who can access the public form can send submissions to this endpoint. Keep the spreadsheet private and share it only with authorized enrollment staff. Review submissions regularly. For a production school deployment, have the school privacy officer/administrator review the notice, access controls, retention period, and applicable DepEd and Philippine Data Privacy Act requirements.

## Part 3 – Connect the website to Apps Script

1. Open `index.html` in VS Code.
2. Find this line near the bottom:

   ```js
   const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyuIBEzmw6-Gb4l-sdVzbqmpMtQgcRuEFY6XnlqRNRI1Ysjp6Fpx5C4xFKOQF73L8mE/exec";
   ```

3. Replace the placeholder with your deployed Apps Script `/exec` URL, keeping the quotation marks.
4. Save `index.html`.

The page sends JSON using `fetch` with `mode: "no-cors"` to avoid browser preflight restrictions. Browsers do not expose the Apps Script response in this mode. Therefore, the page can report that the request was sent, but cannot prove that the row was saved. **Always verify test submissions in the Google Sheet.** If you need a definitive on-screen success/failure response, use a same-origin server/proxy or host the form within an authenticated backend rather than relying on a public GitHub Pages page alone.

## Part 4 – Publish on GitHub Pages

1. Create a GitHub repository, for example `cnhs-online-enrollment`.
2. Upload `index.html` and the entire `assets` folder. Keep the folder name and file paths unchanged.
3. The Apps Script source can be kept in the repository under `google-apps-script/Code.gs`; it does not run on GitHub Pages.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`, then save.
7. Wait for GitHub Pages to publish and open the URL shown in the Pages settings.

## Part 5 – Test before sharing

1. Open the published page.
2. Submit a clearly marked test record using a test learner name and a school-approved test contact number.
3. Open the Google Sheet and confirm that a new row appears in `Enrollment Responses`.
4. Delete the test row after confirming the workflow.
5. Do not publish the spreadsheet URL or grant public spreadsheet access.

## Customization

Edit the school year, grade-level options, fields, colors, and privacy wording in `index.html`. If you change the data fields, update the `HEADERS` array and row mapping in `Code.gs` as well.

## Privacy and security notes

- This template collects learner and parent/guardian information. Obtain school approval before public deployment.
- Use only the data fields the school actually needs. Avoid collecting sensitive information without a clear lawful purpose.
- Restrict the response spreadsheet to authorized personnel; do not make it public.
- Establish who reviews submissions, how applicants are contacted, and when records are retained or deleted.
- The public endpoint has basic validation and a honeypot, but it is not a complete anti-abuse system. Consider quotas, monitoring, CAPTCHA, or an authenticated server-side layer before large-scale use.


## Logo display fix

The school logo is now embedded directly in `index.html` as a PNG data URI, so it will display in the header even if you upload only `index.html` to GitHub. The `assets/cnhs-logo.png` file is also retained in the project folder as the original logo asset.


## Student Grades Entry

The enrollment form includes an optional **Student Grades Entry** section for:

- Filipino
- English
- Science
- Mathematics
- Araling Panlipunan
- Values Education
- Technology and Livelihood Education (TLE)
- MAPEH

Each grade accepts a value from 0 to 100, including decimals. Blank grade fields are allowed. The Apps Script backend stores these grades in separate columns in the `Enrollment Responses` sheet.

### Important update after adding grades

If you already deployed the Apps Script web app, update the script in **Extensions → Apps Script** using the supplied `google-apps-script/Code.gs`, save it, then choose **Deploy → Manage deployments → Edit → New version → Deploy**. Keep the existing deployment URL if you edit the existing deployment.

The existing Google Sheet's header row is not automatically expanded when it already contains old headers. To use the new grade columns cleanly, either create a new response tab/spreadsheet before the first grade-enabled submission, or add the eight grade column headers in the same order shown in `Code.gs` after the Email column and before Privacy Consent. Keep the spreadsheet private and restrict access to authorized school personnel.
