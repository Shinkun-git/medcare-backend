import pool from '../../db/index.js';

export const getAllDoctors = async () => {
    try {
        const result = await pool.query('SELECT * FROM doctor', []);
        // console.log('Query response (in service) ',result);
        return {
            success: true,
            data: result.rows,
        }
    } catch (err) {
        return {
            success: false,
            error: err,
        }
    }
};

export const getDoctors = async ({ searchQuery, page = 1, limit = 6, rating, experience, gender }) => {
    let baseQuery = `
        SELECT DISTINCT d.doc_id,d.name, d.degree, d.specification, d.experience, d.rating, d.image_url  
        FROM doctor d
        LEFT JOIN disease_doctor dd ON d.doc_id = dd.doc_id
        LEFT JOIN disease di ON dd.disease_id = di.disease_id
    `;

    let countQuery = `
        SELECT COUNT(DISTINCT d.doc_id) AS count
        FROM doctor d
        LEFT JOIN disease_doctor dd ON d.doc_id = dd.doc_id
        LEFT JOIN disease di ON dd.disease_id = di.disease_id
    `;

    const conditions = [];
    const values = [];

    // ✅ Search condition (for name, specialization, or disease)
    if (searchQuery) {
        conditions.push(`(d.name ILIKE $${values.length + 1} OR d.specification ILIKE $${values.length + 1} OR di.name ILIKE $${values.length + 1})`);
        values.push(`%${searchQuery}%`);
    }

    // ✅ Filtering by rating
    if (rating && !isNaN(Number(rating))) {
        conditions.push(`d.rating = $${values.length + 1}`);
        values.push(Number(rating));
    }

    // ✅ Filtering by experience
    const experienceRanges = {
        "15+ years": [15, Infinity],
        "10-15 years": [10, 15],
        "5-10 years": [5, 10],
        "3-5 years": [3, 5],
        "1-3 years": [1, 3],
        "0-1 years": [0, 1],
    };

    if (experienceRanges[experience]) {
        const [minExp, maxExp] = experienceRanges[experience];
        if (maxExp === Infinity) {
            conditions.push(`d.experience >= $${values.length + 1}`);
            values.push(minExp);
        } else {
            conditions.push(`d.experience BETWEEN $${values.length + 1} AND $${values.length + 2}`);
            values.push(minExp, maxExp);
        }
    }

    // ✅ Filtering by gender
    if (gender && gender !== "Show All") {
        conditions.push(`d.gender = $${values.length + 1}`);
        values.push(gender);
    }

    // ✅ Construct WHERE clause dynamically
    const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

    // ✅ Append WHERE clause to both queries
    baseQuery += whereClause;
    countQuery += whereClause;

    // ✅ Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` ORDER BY rating DESC, d.doc_id ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), Number(offset));

    try {
        // ✅ Run count query (without pagination)
        const totalDoctors = await pool.query(countQuery, values.slice(0, values.length - 2));
        const totalCount = Number(totalDoctors.rows[0].count);

        // ✅ Run main query with pagination
        const doctors = await pool.query(baseQuery, values);

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


export const findDoctorById = async (doctorId) => {
    try {
        console.log('Doctor ID : ', doctorId);
        const result = await pool.query('SELECT * FROM doctor WHERE doc_id = $1', [doctorId]);
        console.log('Result : ', result.rows[0].name);
        if (result.rowCount !== 0) {
            return {
                success: true,
                data: result.rows[0],
            }
        } throw new Error('No doctor found');
    } catch (err) {
        console.log('Error in findDoctorById service : ', err);
        return {
            success: false,
            error: err.message || 'Error in findDoctorById service',
        }
    }
}

const defaultAvailability = {Friday: ["09:00-12:30", "16:00-19:30"], "Monday": ["09:00-12:30", "16:00-19:30"], "Sunday": ["09:00-12:30", "16:00-19:30"], "Tuesday": ["09:00-12:30", "16:00-19:30"], "Saturday": ["09:00-12:30", "16:00-19:30"], "Thursday": ["09:00-12:30", "16:00-19:30"], "Wednesday": ["09:00-12:30", "16:00-19:30"]};
const defaultImageURL = "/";
export const createDoctor = async ({ name, gender, specification, experience, description, location, degree, availability=defaultAvailability, image_url=defaultImageURL}) => {
    try {
        if (!name || !gender || !specification || !experience || !description || !location || !degree) throw new Error('Mandatory input missing');
        const result = await pool.query(
            `INSERT INTO doctor (name,gender,specification,experience,description,location,degree,availability,image_url) 
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [name, gender, specification, experience, description, location, degree, JSON.stringify(availability),image_url]);
        if (!result.rowCount) throw new Error('Error in creating doctor');
        return {
            success: true,
            data: result.rows[0],
        }
    } catch (err) {
        console.log('Error in createDoctor service : ', err);
        return {
            success: false,
            error: err.message || 'Error in createDoctor service',
        }
    }
}





