const db = require('../config/db');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try{

        const { name, email, phone } = req.body;
    
        if (!name || !email || !phone) {
            console.log(name, email, phone);
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Database error' })
            }
            
            if (results.length > 0) {
                console.log("results.length: ", results.length)
                return res.status(400).json({ message: 'User already registered' })
            }
    
            db.query('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
                [name, email, phone],
                (error) => {
                    if (error) return res.status(500).json({ message: 'Database error'})

                    res.status(201).json({ message: 'User registered successfully' })
                }
            )
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

        const user = results[0];

        const mockOTP = '1234';

        console.log(otp);

        if (otp !== mockOTP) {
            return res.status(401).json({ message: 'Incorrect OTP' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, phoneNumber: user.phone_no }, 'my_secret_key');
        res.json({ token });
    });
}

module.exports = { register, login }