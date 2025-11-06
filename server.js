import express from "express";
import cors from "cors";
import { google } from "googleapis";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ID del foglio Google
const SPREADSHEET_ID = "1fFWnC6k9rYYeAyCbHqu0XBof7cM1xvOQp9i3RrCB1s0";

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// Legge gli slot
app.get("/api/slots", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SlotPrenotazioni!A1:F8",
    });
    const values = response.data.values;
    if (!values || values.length < 2) return res.status(500).send("Foglio vuoto");

    const headers = values[0].slice(1); // giorni della settimana
    const slots = values.slice(1).map(row => ({
      ora: row[0],
      posti: row.slice(1).map(Number)
    }));

    res.json({ headers, slots });
  } catch (err) {
    console.error("Errore nel leggere gli slot:", err);
    res.status(500).send("Errore nel leggere gli slot");
  }
});

// Legge i nomi
app.get("/api/names", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Nomi!A2:A",
    });
    const names = (response.data.values || []).map(r => r[0]);
    res.json(names);
  } catch (err) {
    console.error("Errore nel leggere i nomi:", err);
    res.status(500).send("Errore nel leggere i nomi");
  }
});

// Registra una prenotazione
app.post("/api/book", async (req, res) => {
  const { giornoIndex, oraIndex, nome } = req.body;
  if (!nome || giornoIndex == null || oraIndex == null)
    return res.status(400).send("Dati mancanti");

  try {
    // Leggi slot correnti
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SlotPrenotazioni!A1:F8",
    });
    const values = read.data.values;

    let current = Number(values[oraIndex + 1][giornoIndex + 1]);
    if (current <= 0) return res.status(400).send("Slot completo");

    values[oraIndex + 1][giornoIndex + 1] = current - 1;

    // Aggiorna foglio SlotPrenotazioni
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "SlotPrenotazioni!A1:F8",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    // Scrive la prenotazione nel foglio Prenotazioni
    const giorno = values[0][giornoIndex + 1];
    const ora = values[oraIndex + 1][0];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Prenotazioni!A:C",
      valueInputOption: "RAW",
      requestBody: { values: [[nome, giorno, ora]] }
    });

    res.json({ success: true, postiRimasti: current - 1 });
  } catch (err) {
    console.error("Errore nel registrare prenotazione:", err);
    res.status(500).send("Errore nella prenotazione");
  }
});

app.listen(3000, () => console.log("✅ Server online su http://localhost:3000"));
