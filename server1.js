import express from "express";
import cors from "cors";
import { google } from "googleapis";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ID del tuo foglio Google
const SPREADSHEET_ID = "1fFWnC6k9rYYeAyCbHqu0XBof7cM1xvOQp9i3RrCB1s0";

// Configurazione autenticazione Google
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json", // la tua chiave JSON
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// Endpoint per leggere gli slot
app.get("/api/slots", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SlotPrenotazioni!A1:F8", // aggiorna se aggiungi più slot
    });

    const values = response.data.values;
    if (!values || values.length < 2) return res.status(500).send("Foglio vuoto");

    const headers = values[0].slice(1); // Lunedì, Martedì ...
    const slots = values.slice(1).map(row => {
      const ora = row[0];
      const posti = row.slice(1).map(Number);
      return { ora, posti };
    });

    res.json({ headers, slots });
  } catch (err) {
    console.error("Errore nel leggere gli slot:", err);
    res.status(500).send("Errore nel leggere gli slot");
  }
});

// Endpoint per leggere i nomi
app.get("/api/names", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Nomi!A2:A", // tutti i nomi dalla riga 2
    });
    const values = response.data.values || [];
    const names = values.map(r => r[0]);
    res.json(names);
  } catch (err) {
    console.error("Errore nel leggere i nomi:", err);
    res.status(500).send("Errore nel leggere i nomi");
  }
});

// Endpoint per registrare una prenotazione
app.post("/api/book", async (req, res) => {
  const { giornoIndex, oraIndex, nome } = req.body;
  if (!nome || giornoIndex == null || oraIndex == null)
    return res.status(400).send("Dati mancanti");

  try {
    // Leggi i valori correnti
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SlotPrenotazioni!A1:F8",
    });
    const values = read.data.values;

    // Aggiorna il posto prenotato (riduci il numero disponibile)
    const current = Number(values[oraIndex + 1][giornoIndex + 1]);
    if (current <= 0) return res.status(400).send("Slot completo");

    values[oraIndex + 1][giornoIndex + 1] = current - 1;

    // Scrivi sul foglio
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "SlotPrenotazioni!A1:F8",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Errore nel registrare prenotazione:", err);
    res.status(500).send("Errore nella prenotazione");
  }
});

app.listen(3000, () => console.log("✅ Server online su http://localhost:3000"));
