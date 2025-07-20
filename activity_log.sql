CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    type VARCHAR(32) NOT NULL, -- ör: 'add', 'update', 'stock_in', 'stock_out', 'delete'
    product_id INTEGER,
    product_name VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);