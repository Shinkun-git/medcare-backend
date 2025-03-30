import pool from '../../db/index.js';
import sendMail from './nodemailerService.js';
export const getBookedSlots = async ({ doctorId, input_date }) => {
    try {
        if (!input_date) throw new Error(`Input Date missing.`);
        const result = await pool.query(
            `SELECT slot_time FROM slot_booking WHERE doc_id = $1 AND slot_date = $2 AND status = $3`, [doctorId, input_date, "confirmed"]);
        return {
            success: true,
            data: result.rows.map(slot => slot.slot_time),
        }
    } catch (err) {
        console.log(`Error in getBookedSlots service `, err.message);
        return {
            success: false,
            message: err.message || 'Error in getBookedSlots service',
        }
    }
}

export const requestSlot = async (user_email, doc_id, time, date, mode) => {
    try {
        const result = await pool.query
            (`INSERT INTO slot_booking(user_email,doc_id,slot_time,slot_date,book_mode,status) 
            VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [user_email, doc_id, time, date, mode, "pending"]);
        // console.log('Result(requestSlot service) : ------->',result);
        if (result.rowCount === 0) throw new Error('Error in booking slot');
        return {
            success: true,
            data: result.rows[0],
        }
    } catch (err) {
        console.log('Error in requestSlot service : ', err);
        
        // Handle unique constraint violation (PostgreSQL error code for unique violation: 23505)
        if (err.code === '23505') {
            return {
                success: false,
                error: 'Slot is already booked (confirmed). Please choose another slot.',
            };
        }

        return {
            success: false,
            error: err.message || 'Error in requestSlot service',
        }
    }
}

export const declineOtherOverlapSlots = async (slot_id, doc_id, slot_time, slot_date) => {
    try {
        if (!doc_id || !slot_time || !slot_date) throw new Error('Mandatory input missing');
        const result = await pool.query(
            `UPDATE slot_booking SET status = $1 
            WHERE doc_id = $2 AND slot_time = $3 AND slot_date = $4 AND slot_id <> $5 RETURNING *`,
            ["canceled", doc_id, slot_time, slot_date, slot_id]
        );
        if (result.rowCount === 0) {
            return {
                success: true,
                message: 'No overlapping slots',
            }
        }
        return {
            success: true,
            message: 'All other overlapping slots declined',
        }
    } catch (err) {
        console.log('Error in declineOverlapSlots service : ', err);
        return {
            success: false,
            error: err.message || 'Error in declineOverlapSlots service',
        }
    }
}

export const approveSlot = async (requestBody) => {
    try {
        const {slot_id,name} = requestBody;
        if (!slot_id) throw new Error('Slot ID missing');
        const result = await pool.query(
            `UPDATE slot_booking SET status = $1 
            WHERE slot_id = $2 RETURNING *`, ["confirmed", slot_id]);
        if (result.rowCount === 0) throw new Error('Error in approving slot');
        const { user_email, doc_id, slot_time, slot_date } = result.rows[0];
        const responseFromDecline = await declineOtherOverlapSlots(slot_id, doc_id, slot_time, slot_date);
        if (!responseFromDecline.success) throw new Error('Error in declining overlapping slots');
        
        await sendMail(user_email, "Appointment Approved", 
            `Your appointment on ${slot_date} at ${slot_time} with doctor ${name} has been approved.`
          );
        return {
            success: true,
            data: result.rows[0],
        }
    } catch (err) {
        console.log('Error in approveSlot service : ', err);
        return {
            success: false,
            error: err.message || 'Error in approveSlot service',
        }
    }
};

export const getAllSlots = async () => {
    try {
        const result = await pool.query(
            `SELECT 
            slot_id, user_name, name, slot_date::TEXT AS slot_date,slot_time,book_mode,status,created_at,location
             FROM slot_booking INNER JOIN 
            doctor ON slot_booking.doc_id = doctor.doc_id INNER JOIN 
            users ON users.user_email = slot_booking.user_email ORDER BY created_at DESC`, []
        );
        if (!result.rowCount) {throw new Error('getAllSlots returned nothing.')}
        
        // console.log(result.rows[0]);
        return {
            success: true,
            data: result.rows
        }

    } catch (err) {
        console.log(`Error (getAllSlots service ), `, err);
        return {
            success: false,
            message: err.message,
        }
    }
}

export const declineSlot = async ({ slot_id }) => {
    try {
        if (!slot_id) throw new Error('No slot_id in declineSlot service.')
        const result = await pool.query(
            `UPDATE slot_booking SET status = $1 
            WHERE slot_id = $2 RETURNING *`, ["canceled", slot_id]);
        if(!result.rowCount) throw new Error(`No such record with slotID: ${slot_id}`);
        return {
            success:true,
            data:result.rows?.[0]
        }
    } catch(err){
        console.log(`Error in declineSlot serv. ${err}`);
        return {
            success:false,
            message: err.message
        }
    }
}