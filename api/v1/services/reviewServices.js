import pool from '../../db/index.js';

export const getDoctorReviews = async(doc_id)=>{
    try {
        if(!doc_id || isNaN(doc_id)) throw new Error('Doctor ID missing');
        const result = await pool.query(
            `SELECT review_id, user_email, rating, review FROM reviews 
            WHERE doc_id = $1`,[doc_id]);
        return {
            success: true,
            data: result.rows 
        }
    } catch(err){
        console.log(`Error in getDoctorReviews serv. `,err);
        return {
            success: false,
            message: 'Error in fetching reviews',
        }
    }
}