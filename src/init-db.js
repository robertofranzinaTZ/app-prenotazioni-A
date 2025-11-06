import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function init() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database
  });

  // Crea tabella prenotazioni
  await db.exec(`
    CREATE TABLE IF NOT EXISTS prenotazioni (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      slot_id INTEGER,
      FOREIGN KEY(slot_id) REFERENCES slots(id)
    );
  `);

  // Crea tabella slots con giorno e posti totali
  await db.exec(`
    CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      giorno TEXT NOT NULL,
      ora TEXT NOT NULL,
      posti_totali INTEGER NOT NULL
    );
  `);

  // Inserisci slot se vuoti
  const existing = await db.get("SELECT COUNT(*) AS count FROM slots");
  if (existing.count === 0) {
    await db.exec(`
      INSERT INTO slots (giorno, ora, posti_totali) VALUES
      ('Lunedì', '09:00', 5),
      ('Lunedì', '10:00', 4),
      ('Lunedì', '11:00', 3),
      ('Martedì', '09:00', 5),
      ('Martedì', '10:00', 5),
      ('Martedì', '11:00', 4),
      ('Mercoledì', '09:00', 5),
      ('Mercoledì', '10:00', 4),
      ('Mercoledì', '11:00', 4),
      ('Giovedì', '09:00', 5),
      ('Giovedì', '10:00', 5),
      ('Giovedì', '11:00', 3),
      ('Venerdì', '09:00', 5),
      ('Venerdì', '10:00', 4),
      ('Venerdì', '11:00', 5);
    `);
  }

  console.log("✅ Database inizializzato con slot settimanali e prenotazioni!");
  await db.close();
}

init();
