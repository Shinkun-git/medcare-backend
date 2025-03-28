import passport from 'passport';
import pkg from 'passport-google-oauth2';
import pool from '../../db/index.js';
import {generateToken} from './registerService.js';
const GoogleStrategy = pkg.Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
},
    async (request, accessToken, refreshToken, profile, done) => {
        console.log(`got profile from google-----------
            ${profile}
            -------------------------------`);
        try {
            if (!profile) throw new Error('No profile received from google.');
            const { email, name } = profile;
            let user = await pool.query(
                `SELECT user_email,user_name from users WHERE user_email = $1`, [email]
            );

            if (!user.rowCount) {
                const createdUser = await pool.query(
                    `INSERT INTO users (user_email,user_name,password) 
                    VALUES ($1, $2, $3) RETURNING *`, [email, name, "null"]
                );
                user = createdUser;
            }
            const token = await generateToken(user.rows[0]);
            return done(null, {token});
        } catch (err) {
            console.log(`Error in google strat. callback`, err);
            return done(err, null);
        }
    }
));

// passport.serializeUser((email, done) => {
//     console.log(`Serializing USER ------------
//         ${email}`);
//     done(null, email);
// })

// passport.deserializeUser(async (email, done) => {
//     try {
//         const result = await pool.query(
//             `SELECT user_email,user_name from users WHERE user_email = $1`, [email]
//         );
//         if (!result.rowCount) throw new Error(`No user with email ${email}`);
//         const user = result.rows[0];
//         console.log("User at deserialize", user);
//         done(null, user);
//     } catch (err) {
//         done(err);
//     }
// });

export default passport;