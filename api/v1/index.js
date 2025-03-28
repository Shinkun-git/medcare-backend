import express from 'express';
import doctorController from './controllers/doctorController.js';
import registerController from './controllers/registerController.js';
import checkTokenController from './controllers/checkTokenController.js';
import slotController from './controllers/slotController.js';
import passportController from './controllers/passportController.js';
const router = express.Router();

router.use('/doctors',doctorController);
router.use('/slots',slotController);
router.use('/users',registerController);
router.use('/check',checkTokenController);
router.use('/auth', passportController);

export default router;
