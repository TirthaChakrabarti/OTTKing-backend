const db = require('../config/db');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try{
        const { name, email, phone } = req.body;
    
        if (!name || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        db.query('SELECT * FROM users WHERE phone = ?', [phone], (error, result) => {

            console.log('at register parent query')

            if (error) {
                return res.status(500).json({ message: 'Database error' })
            }
            
            if (result.length > 0) {

                console.log('User found: ', result.length)

                if (result[0].status === 1) {
                    return res.status(400).json({ message: 'User already registered' })
                } 
                else if (result[0].status === 0) {
                    console.log('Newly registering a deleted user.')

                    db.query('UPDATE users SET name = ?, email = ?, phone = ?, status = 1 WHERE id = ?', 
                    [name, email, phone, result[0].id], 
                    (error, result) => {
                        if (error) return res.status(500).json({ message: 'Database error'})
                    });

                    const token = jwt.sign({ id: result[0].id }, 'my_secret_key');
                    
                    res.status(201).json({ 
                        message: 'User registered successfully',
                        token: token 
                    });

                    if (token) console.log('Deleted user reactivated. JWT generated.');
                } 
                else {
                    return res.status(400).json({ message: 'Something went wrong.' })
                }
            } else {
                db.query('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
                [name, email, phone],
                (error, result) => {
                    if (error) return res.status(500).json({ message: 'Database error'})

                    // Generate JWT
                    const userID = result.insertId;
                    const token = jwt.sign({ id: userID }, 'my_secret_key');
                    
                    res.status(201).json({ 
                        message: 'User registered successfully',
                        token: token 
                    });

                    if(token) console.log('New user registered. JWT generated.')
                }
            )
            }
        })
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' })
    }
}

const login = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required.' });
    }

    db.query('SELECT * FROM users WHERE phone = ?', [phone], async(err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        if (results[0].status === 0) {
            return res.status(401).json({ message: 'Account deleted' });
        }

        const user = results[0];

        const mockOTP = '1234';

        if (otp !== mockOTP) {
            return res.status(401).json({ message: 'Incorrect OTP' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id }, 'my_secret_key');
        res.json({ token });

        if(token) console.log('Logged in. JWT generated.')
    });
}

const updateDetails = async (req, res) => {

    const { name, email, phone, birthdate, gender } = req.body;

    const userId = req.user.id; // Get user ID from JWT

    const updates = {
        name,
        email,
        phone,
        birthdate,
        gender
    };

    // Filter out null or undefined values
    const validUpdates = Object.entries(updates).filter(([key, value]) => value !== null && value !== undefined);

    if (validUpdates.length === 0) {
        return res.status(400).json({ message: 'At least one field is required' });
    }

    // Construct the SET clause of the UPDATE query
    const setClause = validUpdates.map(([key]) => `${key} = ?`).join(', ');

    // values to be inserted into the query
    const values = validUpdates.map(([_, value]) => value);
    values.push(userId);

    const updatedQuery = `UPDATE users SET ${setClause} WHERE id = ?`;

    db.query(updatedQuery, values, async (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Details updated successfully!' });
    });
}

const deleteAccount = (req, res) => {
    const userId = req.user.id;
    console.log("userId: ", userId)

    db.query('UPDATE users SET status = 0 WHERE id = ?', [userId], async (error, results) => {
        if (error) {
            return res.error(500).json({ message: 'Database error'})
        }

        res.status(200).json({ message: 'Account deleted successfully'});
    })
}

module.exports = { register, login, updateDetails, deleteAccount }