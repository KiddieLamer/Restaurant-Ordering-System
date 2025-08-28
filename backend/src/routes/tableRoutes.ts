import { Router } from 'express';
import { TableController } from '../controllers/tableController';

const router = Router();

router.post('/', TableController.createTable);
router.get('/:id', TableController.getTable);
router.get('/qr/:restaurantId/:tableNumber', TableController.generateQR);
router.get('/scan/:restaurantId/:tableNumber', TableController.getTableByQR);

export default router;