import express from 'express';
import { getSlots, addBooking } from '../controllers/bookingsController.js';

const router=express.Router();
router.get("/", getSlots);
router.post("/", addBooking);

export default router;
