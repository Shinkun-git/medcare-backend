import express from 'express';
import doctorController from './controllers/doctorController.js';
import registerController from './controllers/registerController.js';

const router = express.Router();

router.use('/doctors',doctorController);
router.use('/users',registerController);

export default router;
