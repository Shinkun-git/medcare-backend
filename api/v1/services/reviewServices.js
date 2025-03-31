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

export const addDoctorReview = async(requestBody)=>{
    try{
        const {user_email,doc_id,rating,review} = requestBody;
        const result = await pool.query(
            `INSERT INTO reviews (user_email, doc_id, rating, review) 
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_email, doc_id, rating, review]
        );

        if(!result.rowCount) throw new Error(`Error adding review`);
        return {
            success : true,
            data : result.rows[0]
        }
    } catch(err){
        console.log(`Error in addDoctorReview serv. `,err);
        return {
            success:false,
            message: "Error in adding review"
        }
    }
}

export const getAllReviews = async()=>{
    try{
        const result = await pool.query(
            `SELECT * FROM reviews`,[]);
        return {
            success:true,
            data : result.rows
        }
    }  catch(err){
        console.log(`Error in getAllReviews `,err);
        return {
            success: false,
            message:'error fetching all reviews '
        }
    }
}