# Event Registration Website

This repository contains a simple full‑stack event registration website. It allows people to register for an event, choose between two pricing options (standard fee or fee with food), provide their contact details and optionally specify who referred them. Submissions are saved into a Google Sheet for easy tracking.

## Features

- **Reusable HTML page** – update the event title, description, date and location directly in the `index.html` file without rewriting any code.
- **User input** – collects name, email, phone number, fee choice ($60 or $80), and an optional referral name/email.
- **Data storage** – uses a Google Apps Script Web App to append form submissions to a Google Sheet. Columns include the submission date, personal details, chosen fee, amount paid, referral and whether the e‑transfer has been sent.
- **Payment instructions** – after the form is submitted, the page displays instructions to send an Interac e‑Transfer to a configurable email address. The actual payment is handled outside the site; this site does not process payments.
- **Referral tracking** – participants can enter a referral. The discount is handled manually by the event operator.
- **Free deployment** – the site can be hosted for free (e.g., via GitHub Pages) and the backend runs on a free Google Apps Script.

## Prerequisites

- A Google account (to create the spreadsheet and Apps Script).
- Optionally a GitHub account (for free hosting via GitHub Pages) or another static hosting solution (Netlify, Vercel, etc.).

## Step‑by‑Step Setup

### 1. Set up the Google Sheet

1. Go to **Google Sheets** and create a new spreadsheet【370329478140142†L270-L279】.
2. On the first row add headers that match the data you want to collect. The provided `Code.gs` expects the following headers (in row 1, starting at column A):

   | Column | Header         |
   |------:|---------------|
   | A     | Date          |
   | B     | Name          |
   | C     | Email         |
   | D     | Phone         |
   | E     | Fee           |
   | F     | Amount        |
   | G     | Referral      |
   | H     | EtransferSent |

   *You can add more columns or rename them, but then you need to update the header list in `Code.gs` accordingly.*

### 2. Create and configure the Apps Script

1. With the sheet open, click **Extensions → Apps Script** to open the editor【370329478140142†L270-L284】.
2. Replace the default `Code.gs` contents with the code from `event-registration/Code.gs` in this repository. This script stores your sheet ID and appends new rows on each submission.
3. Run the `initialSetup()` function once. It will ask for permissions; review and grant them. This function stores the spreadsheet ID in the script’s properties.
4. Deploy the script as a Web App:
   - Click **Deploy → New deployment**.
   - Next to **Select type**, enable deployment type settings and choose **Web app**【370329478140142†L358-L368】.
   - Configure:
     * **Execute as:** *Me* – the script runs as your account.
     * **Who has access:** *Anyone* – so the form can submit data【370329478140142†L358-L368】.
   - Click **Deploy** and copy the Web App URL (it ends in `/exec`). Keep this URL handy; it will be used in the front‑end.

### 3. Configure the front‑end

1. In `event-registration/script.js`, replace `YOUR_WEBAPP_URL` with the Web App URL you copied in the previous step. This tells the form where to send the data.
2. If needed, update the `ETRANSFER_EMAIL` constant in `script.js` to the email address that should receive Interac e‑Transfers.
3. Open `event-registration/index.html` in a text editor and edit the event name, description, date and location in the `<header>` section to reflect your specific event. These values are just HTML text, so you can change them easily.

### 4. Deploy the website (optional but recommended)

The site consists of static files (`index.html`, `style.css` and `script.js`), so you can host it anywhere that serves static content. Here’s how to deploy it on GitHub Pages for free:

1. Create a new repository on GitHub (e.g., `event-registration`).
2. Copy the contents of the `event-registration` folder in this repository into your new repo. Commit and push the files.
3. Go to **Settings → Pages** on your GitHub repository. Under **Build and deployment**, choose **Deploy from a branch**. Select the `main` branch and the **root** folder (not `/docs`) and click **Save**.
4. GitHub Pages will build your site and provide a URL in the form `https://<username>.github.io/<repo-name>/`. Share this link with participants.

Alternative hosting options include [Netlify](https://www.netlify.com/), [Vercel](https://vercel.com/), and [Render](https://render.com/), all of which offer free tiers and can deploy static sites by connecting to your GitHub repository.

## How it works

When a participant submits the form:

1. **Client side** – `script.js` intercepts the form submission, collects the values, appends two extra fields (`Amount` and `EtransferSent`) and sends them via a POST request to your Apps Script Web App. This is done using `fetch()` with `Content-Type: application/x-www-form-urlencoded`.
2. **Apps Script** – the `doPost()` function receives the data, matches each field to the corresponding header in your sheet and appends a new row【370329478140142†L309-L318】. The date column is automatically filled with the current timestamp.
3. **User feedback** – once the data is sent, the page displays a message asking the participant to send an Interac e‑Transfer to your designated email address. The actual transfer happens outside the site; the “EtransferSent” column is initially set to “No” so you can update it manually after confirming payment.

## Customising for different events

To reuse this website for another event:

1. Duplicate the Google Sheet or create a new one with the same column headers. If you use a new sheet, you need to run `initialSetup()` in a fresh Apps Script project and deploy it as a new Web App.
2. Update the `SCRIPT_URL` constant in `script.js` with the new Web App URL.
3. Update the event details in `index.html` and, if necessary, the payment email in `script.js`.

No other code changes are required. The form will save registrations for the new event into its own sheet, and you can reuse the page as many times as you like.

## Safety and privacy considerations

- The sheet may contain personal information (names, emails, phone numbers). Ensure access to the sheet and Apps Script is restricted to authorised organisers.
- The website instructs users to send an e‑transfer but does not collect or process payments itself. Payment processing remains under the user’s control.
- The “referral” field is optional and used purely for tracking; it does not automatically apply discounts.

## Troubleshooting

- **No data appears in the sheet:** Ensure the headers in the first row of the sheet match the field names exactly (case sensitive)【370329478140142†L390-L396】. Check that `SCRIPT_URL` is correct and that your Apps Script deployment is set to “Anyone” with the correct execution role.
- **CORS errors in the browser console:** The `fetch()` call uses `mode: 'no-cors'`, which prevents reading the response but still sends the request. If you need to handle the response, you can add a `returnContentService` object and allow cross‑domain requests by setting appropriate response headers in Apps Script.
- **Permissions warning when deploying:** When running `initialSetup()` or deploying the Web App, Google will display a warning since the script isn’t verified【370329478140142†L340-L347】. Follow the prompts and choose “Go to [project name] (unsafe)” to grant the necessary permissions.

If you have further issues, consult the [official Apps Script documentation](https://developers.google.com/apps-script) or the README in [this repository that inspired these instructions](https://github.com/levinunnink/html-form-to-google-sheet), which includes detailed steps and troubleshooting tips.