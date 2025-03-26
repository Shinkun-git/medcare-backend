import pool from '../../db/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {promisify} from 'util';
const signAsync = promisify(jwt.sign);

export const generateToken = async (payload) => {
    try{
        return await signAsync(payload, process.env.JWT_SECRET_KEY, {expiresIn: 60*5});
    } catch (error) {     
        console.log('error in generate token ', error);
        return null;
    }
};

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
            const token = await generateToken({ email: result.rows[0].user_email, name: result.rows[0].user_name });
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

export const getUserByEmail = async (email) => {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE user_email = $1`, [email]);
        return result.rows[0];
    } catch (error) {
        console.log('error in get user by email ', error);
        return null;
    }
}

export const comparePassword = async (password,hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.log('error in compare password ', error);
        return false;
    }
}

export const loginService = async ({ email, password }) => {
    try {
        const userFromDB = await getUserByEmail(email);
        if (!userFromDB) {
            throw new Error('User not found');
        }
        const isPasswordMatch = await comparePassword(password, userFromDB.password);
        if (!isPasswordMatch) {
            throw new Error('Invalid password');
        }

        const token = await generateToken({ email: userFromDB.user_email, name: userFromDB.user_name });
        if (!token) {
            throw new Error('Token not generated');
        }

        return {
            success: true,
            message: 'User logged in successfully',
            data: {
                ...userFromDB,
                token
            }
        }
    } catch (error) {
        console.log('error in user login ', error);
        return {
            success: false,
            message: error.message || 'login exception',
        }
    }
}