const pool = require('../models/db');

exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username AS created_by_username, u2.username AS last_edited_by_username, un.name AS unit_name
      FROM products p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN users u2 ON p.last_edited_by = u2.id
      LEFT JOIN units un ON p.unit_id = un.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, category, barcode, quantity, price, critical_stock, unit_id } = req.body;
  const created_by = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, category, barcode, quantity, price, critical_stock, created_by, unit_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, description, category, barcode, quantity, price, critical_stock, created_by, unit_id]
    );
    const newProduct = result.rows[0];
    // Aktivite logu
    await pool.query(
      'INSERT INTO activity_log (type, product_id, product_name, message) VALUES ($1, $2, $3, $4)',
      ['add', newProduct.id, newProduct.name, `Ürün “${newProduct.name}” eklendi`]
    );
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, barcode, quantity, price, critical_stock, unit_id } = req.body;
  const last_edited_by = req.user.id;
  try {
    // 1. Eski ürünü al
    const oldProductRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    const oldProduct = oldProductRes.rows[0];
    if (!oldProduct) return res.status(404).json({ message: 'Ürün bulunamadı' });

    // 2. Ürünü güncelle
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, category=$3, barcode=$4, quantity=$5, price=$6, critical_stock=$7, last_edited_by=$8, unit_id=$9 WHERE id=$10 RETURNING *`,
      [name, description, category, barcode, quantity, price, critical_stock, last_edited_by, unit_id, id]
    );
    const newProduct = result.rows[0];

    // 3. Audit log tablosuna kaydet
    await pool.query(
      `INSERT INTO product_audit_log (product_id, edited_by, old_data, new_data) VALUES ($1, $2, $3, $4)`,
      [id, last_edited_by, oldProduct, newProduct]
    );
    // Aktivite logu
    await pool.query(
      'INSERT INTO activity_log (type, product_id, product_name, message) VALUES ($1, $2, $3, $4)',
      ['update', newProduct.id, newProduct.name, `Ürün “${newProduct.name}” güncellendi`]
    );

    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Ürün adını bul
    const prodRes = await pool.query('SELECT name FROM products WHERE id = $1', [id]);
    const prodName = prodRes.rows[0]?.name || '';
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    // Aktivite logu
    await pool.query(
      'INSERT INTO activity_log (type, product_id, product_name, message) VALUES ($1, $2, $3, $4)',
      ['delete', id, prodName, `Ürün “${prodName}” silindi`]
    );
    res.json({ message: 'Ürün silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

exports.getProductHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT l.*, u.username AS edited_by_username
      FROM product_audit_log l
      LEFT JOIN users u ON l.edited_by = u.id
      WHERE l.product_id = $1
      ORDER BY l.edited_at DESC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Geçmiş alınamadı', error: err.message });
  }
};

exports.getStockPanelStats = async (req, res) => {
  try {
    // Toplam ürün sayısı
    const totalProductsRes = await pool.query('SELECT COUNT(*) FROM products');
    const totalProducts = Number(totalProductsRes.rows[0].count);

    // Toplam stok miktarı
    const totalStockRes = await pool.query('SELECT COALESCE(SUM(quantity),0) AS total FROM products');
    const totalStock = Number(totalStockRes.rows[0].total);

    // Kritik stokta ürün (quantity < critical_stock)
    const criticalRes = await pool.query('SELECT COUNT(*) FROM products WHERE quantity < critical_stock');
    const criticalCount = Number(criticalRes.rows[0].count);

    // Son eklenen ürün
    const lastProductRes = await pool.query('SELECT name FROM products ORDER BY created_at DESC LIMIT 1');
    const lastProduct = lastProductRes.rows[0]?.name || '-';

    res.json({
      totalProducts,
      totalStock,
      criticalCount,
      lastProduct
    });
  } catch (err) {
    res.status(500).json({ message: 'Stok panel verileri alınamadı', error: err.message });
  }
};

exports.stockIn = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const user_id = req.user.id;
  if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Geçerli bir miktar giriniz.' });
  try {
    // 1. Ürünü güncelle
    const updated = await pool.query(
      'UPDATE products SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ message: 'Ürün bulunamadı' });
    // 2. Hareket kaydı ekle
    await pool.query(
      'INSERT INTO stock_movements (product_id, movement_type, quantity, user_id) VALUES ($1, $2, $3, $4)',
      [id, 'in', quantity, user_id]
    );
    // Aktivite logu
    await pool.query(
      'INSERT INTO activity_log (type, product_id, product_name, message) VALUES ($1, $2, $3, $4)',
      ['stock_in', id, updated.rows[0].name, `Ürün “${updated.rows[0].name}” için ${quantity} birim stok girişi yapıldı`]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Stok girişi yapılamadı', error: err.message });
  }
};

exports.stockOut = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const user_id = req.user.id;
  if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Geçerli bir miktar giriniz.' });
  try {
    // 1. Ürünü güncelle (stok yetersizse engelle)
    const productRes = await pool.query('SELECT quantity FROM products WHERE id = $1', [id]);
    const currentQty = productRes.rows[0]?.quantity;
    if (currentQty === undefined) return res.status(404).json({ message: 'Ürün bulunamadı' });
    if (currentQty < quantity) return res.status(400).json({ message: 'Yeterli stok yok!' });
    const updated = await pool.query(
      'UPDATE products SET quantity = quantity - $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    // 2. Hareket kaydı ekle
    await pool.query(
      'INSERT INTO stock_movements (product_id, movement_type, quantity, user_id) VALUES ($1, $2, $3, $4)',
      [id, 'out', quantity, user_id]
    );
    // Aktivite logu
    await pool.query(
      'INSERT INTO activity_log (type, product_id, product_name, message) VALUES ($1, $2, $3, $4)',
      ['stock_out', id, updated.rows[0].name, `Ürün “${updated.rows[0].name}” için ${quantity} birim stok çıkışı yapıldı`]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Stok çıkışı yapılamadı', error: err.message });
  }
};

exports.getStockMovementsSummary = async (req, res) => {
  try {
    const inRes = await pool.query("SELECT COALESCE(SUM(quantity),0) AS total_in FROM stock_movements WHERE movement_type = 'in'");
    const outRes = await pool.query("SELECT COALESCE(SUM(quantity),0) AS total_out FROM stock_movements WHERE movement_type = 'out'");
    res.json({
      totalIn: Number(inRes.rows[0].total_in),
      totalOut: Number(outRes.rows[0].total_out)
    });
  } catch (err) {
    res.status(500).json({ message: 'Stok hareketleri alınamadı', error: err.message });
  }
};

exports.getStockMovementsGraph = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        to_char(created_at, 'YYYY-MM-DD') as date,
        SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE 0 END) as total_in,
        SUM(CASE WHEN movement_type = 'out' THEN quantity ELSE 0 END) as total_out
      FROM stock_movements
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Stok hareket grafiği alınamadı', error: err.message });
  }
}; 