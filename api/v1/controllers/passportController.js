import express from 'express';
import passport from '../services/passportService.js';
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope:
        ['email', 'profile'],
    prompt: 'select_account',
}));

router.get('/google/callback', passport.authenticate('google', {
    session: false,
}), async (req, res) => {
    // console.log("Google Callback - User Authenticated:", req.user);
    if (!req.user || !req.user.token) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    // ✅ Extract token correctly from `req.user.token`
    const token = req.user.token;

    // ✅ Set an HTTP-only secure cookie
    res.cookie("token", token, {
        httpOnly: true,  
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 3600000, // 1 hour expiration
    });

    // ✅ Redirect to your frontend (Next.js)
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