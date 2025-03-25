import express from "express";
import {checkToken} from "../services/checkTokenService.js";

const router = express.Router();

router.get("/check-token", checkToken); // Add this route to check token validity

export default router;
