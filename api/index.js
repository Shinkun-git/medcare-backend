import express from "express";
import v1 from './v1/index.js';
import dotenv from 'dotenv/config';
const router = express.Router();

router.use(express.json());
router.use('/v1',v1);

export default router;