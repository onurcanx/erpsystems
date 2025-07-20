const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const unitController = require('../controllers/unitController');
const categoryController = require('../controllers/categoryController');
const activityController = require('../controllers/activityController');

router.get('/products', productController.getProducts);
router.post('/products/add', authMiddleware, productController.addProduct);
router.put('/products/:id', authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);
router.get('/products/:id/history', authMiddleware, productController.getProductHistory);
router.get('/products/stock-panel-stats', authMiddleware, productController.getStockPanelStats);
router.post('/products/:id/stock-in', authMiddleware, productController.stockIn);
router.post('/products/:id/stock-out', authMiddleware, productController.stockOut);
router.get('/products/stock-movements-summary', authMiddleware, productController.getStockMovementsSummary);
router.get('/products/stock-movements-graph', authMiddleware, productController.getStockMovementsGraph);
router.get('/categories', categoryController.getCategories);
router.get('/units', unitController.getUnits);
router.get('/activity-log', activityController.getActivityLog);

module.exports = router; 