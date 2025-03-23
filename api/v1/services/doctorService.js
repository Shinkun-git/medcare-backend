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
};

export const getFilteredDoctors = async(page, limit, rating , experience, gender)=>{
     let query = "SELECT * FROM doctor WHERE 1=1";
    let countQuery = "SELECT COUNT(*) AS count FROM doctor WHERE 1=1";
    const values = [];

    // Apply filters to both countQuery and query
    if (rating) {
        query += ` AND rating = $${values.length + 1}`;
        countQuery += ` AND rating = $${values.length + 1}`;
        values.push(rating);
    }
    if (experience) {
        query += ` AND experience >= $${values.length + 1}`;
        countQuery += ` AND experience >= $${values.length + 1}`;
        values.push(experience);
    }
    if (gender && gender !== "Show All") {
        query += ` AND gender = $${values.length + 1}`;
        countQuery += ` AND gender = $${values.length + 1}`;
        values.push(gender);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    try {
        const totalDoctors = await pool.query(countQuery, values.slice(0, values.length - 2)); // Run count query without limit/offset
        const doctors = await pool.query(query, values); // Run main query
        return {
            success: true,
            data:{
                total: totalDoctors.rows[0].count, // Total count of filtered doctors
                pages: Math.ceil(totalDoctors.rows[0].count / limit), // Total pages
                data: doctors.rows, // Filtered doctors for the current page
            }
        };
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return {
            success: false,
            error: error,
        };
    }
};