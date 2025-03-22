import pool from '../../db/index.js';

export const getAllDoctors = async()=>{
    try {
        const result = await pool.query('SELECT * FROM doctor',[]);
        // console.log('Query response (in service) ',result);
        return {
            success: true,
            data : result.rows,
        }
    } catch(err){
        return {
            success : false,
            error : err,
        }
    }
}