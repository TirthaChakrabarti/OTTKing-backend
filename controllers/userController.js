const db = require('../config/db');

const getUserIdentity = async (req, res) => {
    const userId = req.user.id;

    db.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        res.status(200).json({ user });

        console.log(user)
    })
}

module.exports = { getUserIdentity }