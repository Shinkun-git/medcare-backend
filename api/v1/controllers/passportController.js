import express from 'express';
import passport from '../services/passportService.js';
import { generateToken } from '../services/registerService.js';
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope:
        ['email', 'profile'],
    prompt: 'select_account',
}));

router.get('/google/callback', passport.authenticate('google', {
    session: false,
}), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    const token = await generateToken({ id: req.user.id, email: req.user.email, name: req.user.name },
        process.env.JWT_SECRET_KEY,
        { expiresIn: 60 * 15 }
    )
    res.cookie("token", token, {
        httpOnly: true,  // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
        sameSite: "Lax",  // Prevent CSRF attacks
        maxAge: 3600000,  // 1 hour expiration
    });

    res.redirect(`${process.env.MEDCARE_BASE_URL}/landingPage`);

});

router.post("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "Strict",
        expires: new Date(0), // 🔥 Expire immediately
        path: "/", // ✅ Ensures cookie is cleared for all paths
    });

    return res.status(200).json({ message: "Logged out successfully" });
});

export default router;