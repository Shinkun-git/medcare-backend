import express from 'express';
import doctorController from './controllers/doctorController.js';

const router = express.Router();

router.use('/doctors',doctorController);

export default router;
