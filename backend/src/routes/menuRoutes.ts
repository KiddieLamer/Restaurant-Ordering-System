import { Router } from 'express';
import { MenuController } from '../controllers/menuController';

const router = Router();

router.get('/:restaurantId', MenuController.getMenu);
router.post('/categories', MenuController.createCategory);
router.post('/items', MenuController.createMenuItem);
router.put('/items/:id', MenuController.updateMenuItem);
router.delete('/items/:id', MenuController.deleteMenuItem);

export default router;