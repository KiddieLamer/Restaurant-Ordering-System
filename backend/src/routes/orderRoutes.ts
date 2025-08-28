import { Router } from 'express';
import { OrderController } from '../controllers/orderController';

const router = Router();

router.post('/', OrderController.createOrder);
router.get('/:id', OrderController.getOrder);
router.put('/:id/status', OrderController.updateOrderStatus);
router.get('/kitchen/:restaurantId', OrderController.getKitchenOrders);
router.get('/table/:tableId', OrderController.getTableOrders);

export default router;