import { google } from "googleapis";

// Configurazione Google Sheets
const SPREADSHEET_ID = "1fFWnC6k9rYYeAyCbHqu0XBof7cM1xvOQp9i3RrCB1s0";
const SLOTS_RANGE = "SlotPrenotazioni!A2:D"; // Assicurati che il nome del foglio sia corretto

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const KEYFILE = "./service-account.json"; // La tua chiave JSON

async function testSlots() {
  try {
    const auth = new google.auth.GoogleAuth({ keyFile: KEYFILE, scopes: SCOPES });
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SLOTS_RANGE,
    });

    console.log("=== DATI LETTI DAL FOGLIO ===");
    console.log(res.data.values);

    if (!res.data.values || res.data.values.length === 0) {
      console.log("⚠️ Nessuno slot trovato. Controlla nome foglio e intervallo.");
    } else {
      console.log(`✅ Trovati ${res.data.values.length} slot`);
    }
  } catch (err) {
    console.error("❌ ERRORE nella lettura degli slot:", err.message);
    console.error(err);
  }
}

testSlots();
