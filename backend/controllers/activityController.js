const pool = require('../models/db');

exports.getActivityLog = async (req, res) => {
  try {
    const { user } = req.query;
    let result;
    if (user) {
      result = await pool.query('SELECT * FROM activity_log WHERE message ILIKE $1 ORDER BY created_at DESC LIMIT 20', [`%${user}%`]);
    } else {
      result = await pool.query('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 20');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Aktivite logu alınamadı', error: err.message });
  }
}; 