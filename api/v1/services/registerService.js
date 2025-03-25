import pool from '../../db/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {promisify} from 'util';
const signAsync = promisify(jwt.sign);


export const registerService = async ({name,email,password }) => {
    try {
        if (!email || !name || !password) {
            throw new Error('Please provide email,name & password!');
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(`INSERT INTO users 
            (user_email,user_name,password) VALUES ($1,$2,$3) RETURNING user_name,user_email`,
            [email, name, hashedPassword]);

        if (result.rowCount === 0) {
            throw new Error("Error while saving user");
        }

        // generate jwt token
            const token = await signAsync({ email, name }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            if(!token) throw new Error('jwt token not generated');

        // return response with token to controller
            return{
                success: true,
                message: 'User registered successfully',
                data: {
                    ...result.rows[0],
                    token
                }
            }
    } catch (error) {
        console.log('error in user registration ', error);
        return {
            success: false,
            message: error.message || 'save user exception',
        }
    }
};
