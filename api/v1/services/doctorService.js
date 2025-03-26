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

export const getFilteredDoctors = async (page = 1, limit = 6, rating, experience, gender) => {
    let query = "SELECT * FROM doctor";
    let countQuery = "SELECT COUNT(*) AS count FROM doctor";
    
    const conditions = [];
    const values = [];
    
    // ✅ Apply filters dynamically
    if (rating && !isNaN(Number(rating))) {
        conditions.push(`rating = $${values.length + 1}`);
        values.push(Number(rating));
    }
    if (experience) {
        const experienceRanges = {
            "15+ years": [15, Infinity], // 15 or more years
            "10-15 years": [10, 15], // Between 10 and 15 years
            "5-10 years": [5, 10], // Between 5 and 10 years
            "3-5 years": [3, 5], // Between 3 and 5 years
            "1-3 years": [1, 3], // Between 1 and 3 years
            "0-1 years": [0, 1], // Between 0 and 1 years
        };
    
        if (experienceRanges[experience]) {
            const [minExp, maxExp] = experienceRanges[experience];
            if (maxExp === Infinity) {
                conditions.push(`experience >= $${values.length + 1}`);
                values.push(minExp);
            } else {
                conditions.push(`experience BETWEEN $${values.length + 1} AND $${values.length + 2}`);
                values.push(minExp, maxExp);
            }
        }
    }
    
    if (gender && gender !== "Show All") {
        conditions.push(`gender = $${values.length + 1}`);
        values.push(gender);
    }

    // ✅ Construct WHERE clause dynamically
    const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

    // ✅ Append WHERE clause to both queries
    query += whereClause;
    countQuery += whereClause;

    // ✅ Pagination (Only for main query)
    const offset = (page - 1) * limit;
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    try {
        // ✅ Run count query without pagination
        const totalDoctors = await pool.query(countQuery, values.slice(0, values.length - 2));
        console.log("Total doctors:", totalDoctors.rows);
        const totalCount = Number(totalDoctors.rows[0].count);
        console.log("Total count:", totalCount);
        // ✅ Run main query with pagination
        const doctors = await pool.query(query, values);

        return {
            success: true,
            data: {
                total: totalCount, // Total filtered count
                pages: Math.ceil(totalCount / limit), // Total pages
                data: doctors.rows, // Doctors for the current page
            },
        };
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};

export const searchDoctors = async (searchQuery, page = 1, limit = 6) => {
    try {
        const countQuery = `SELECT COUNT(*) AS count FROM doctor WHERE name ILIKE $1 OR specification ILIKE $1`;
        const searchSQL = `SELECT * FROM doctor WHERE name ILIKE $1 OR specification ILIKE $1 LIMIT $2 OFFSET $3`;

        const offset = (page - 1) * limit;
        const searchParam = `%${searchQuery}%`;

        // Get total count of matching doctors
        const totalDoctors = await pool.query(countQuery, [searchParam]);
        const totalCount = Number(totalDoctors.rows[0].count);

        // Get paginated search results
        const doctors = await pool.query(searchSQL, [searchParam, Number(limit), Number(offset)]);
        console.log("searchDoctors -> doctors", doctors.rows.map((doctor) => doctor.name));
        return {
            success: true,
            data: {
                total: totalCount, // Total matching doctors
                pages: Math.ceil(totalCount / limit), // Total pages
                data: doctors.rows, // Doctors for current page
            },
        };
    } catch (error) {
        console.error("Error searching doctors:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};

export const findDoctorById = async (doctorId) => {
    try{
        console.log('Doctor ID : ',doctorId);
        const result = await pool.query('SELECT * FROM doctor WHERE doc_id = $1',[doctorId]);
        console.log('Result : ',result.rows[0].name);
        if(result.rowCount !== 0){   
            return {
                success: true,
                data: result.rows[0],
            }
        } throw new Error('No doctor found');
    } catch(err){
        console.log('Error in findDoctorById service : ',err);
        return {
            success: false,
            error: err.message || 'Error in findDoctorById service',
        }
    }
}

export const requestSlot = async(user_email,doc_id,time,date,mode)=>{
    try{
        const result = await pool.query
        (`INSERT INTO slot_booking(user_email,doc_id,slot_time,slot_date,book_mode,status) 
            VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[user_email,doc_id,time,date,mode,"pending"]);
        // console.log('Result(requestSlot service) : ------->',result);
        if(result.rowCount === 0)   throw new Error('Error in booking slot');
        return {
            success: true,
            data: result.rows[0],
        }
    } catch(err){
        console.log('Error in requestSlot service : ',err);
        return {
            success: false,
            error: err.message || 'Error in requestSlot service',
        }
    }
}
