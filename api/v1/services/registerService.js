// import jwt from 'jsonwebtoken';
import pool from '../../db/index.js';

export const registerService = async ({user_email, user_name, user_password}) => {
    console.log('registerService called');
    console.log('user_email,user_name,user_password', user_email, user_name, user_password);
    try {
        if (!user_email || !user_name || !user_password) {
            throw new Error('Please provide email,name & password!');
        }
        const result = await pool.query(`INSERT INTO users 
            (user_email,user_name,password) VALUES ($1,$2,$3) RETURNING *`,
            [user_email, user_name, user_password]);
            console.log('result -------------------->', result);
        if (result.rowCount) {
            return {
                success: true,
                message: 'User registered successfully',
                data: result.rows[0]
            }
        } else throw new Error("Error while saving user");
    } catch (error) {
        console.log('error in user insertion ', error);
        return {
            success: false,
            message: error.message || 'save user exception',
        }
    }
};
