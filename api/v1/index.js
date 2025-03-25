import express from 'express';
import doctorController from './controllers/doctorController.js';
import registerController from './controllers/registerController.js';
import checkTokenController from './controllers/checkTokenController.js';
const router = express.Router();

router.use('/doctors',doctorController);
router.use('/users',registerController);
router.use('/auth',checkTokenController);
export default router;
