import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();

// Analytics
router.get('/:restaurantId', AnalyticsController.getRestaurantAnalytics);
router.get('/:restaurantId/splash', AnalyticsController.getSplashData);

// Cashflow
router.get('/:restaurantId/cashflow', AnalyticsController.getCashFlowHistory);
router.post('/:restaurantId/cashflow', AnalyticsController.addCashFlowEntry);

// Stock
router.get('/:restaurantId/stock', AnalyticsController.getStockStatus);
router.put('/:restaurantId/stock', AnalyticsController.updateStock);
router.get('/:restaurantId/stock/movements', AnalyticsController.getStockMovements);

export default router;