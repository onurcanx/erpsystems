const pool = require('../models/db');

exports.getUnits = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM units ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Birimler alınamadı', error: err.message });
  }
}; 