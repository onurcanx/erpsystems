const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Şifre yanlış' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

exports.register = async (req, res) => {
  const { username, password, is_admin, first_name, last_name, phone, email, tc_no } = req.body;
  const created_by_admin = req.user.id;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten var' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users 
        (username, password_hash, is_admin, first_name, last_name, phone, email, tc_no, created_by_admin) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [username, hashedPassword, is_admin, first_name, last_name, phone, email, tc_no, created_by_admin]
    );
    res.status(201).json({ message: 'Kayıt başarılı', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
}; 