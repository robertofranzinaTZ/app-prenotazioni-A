import { getDB } from '../db.js';

export async function getSlots(req,res){
  const db=await getDB();
  const rows=await db.all("SELECT * FROM slots");
  res.json(rows);
}

export async function addBooking(req,res){
  const {name,email,slot_id}=req.body;
  const db=await getDB();
  const slot=await db.get("SELECT * FROM slots WHERE id=?",slot_id);
  if(!slot) return res.status(400).json({error:"Slot not found"});
  if(slot.booked >= slot.capacity) return res.status(400).json({error:"Full"});
  await db.run("UPDATE slots SET booked=booked+1 WHERE id=?",slot_id);
  await db.run("INSERT INTO bookings(name,email,slot_id) VALUES (?,?,?)",name,email,slot_id);
  res.json({status:"ok"});
}
