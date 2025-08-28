import { Router } from 'express';
import { MenuController, upload } from '../controllers/menuController';

const router = Router();

// Menu routes for customers
router.get('/:restaurantId', MenuController.getMenu);

// Menu management routes for admin
router.get('/:restaurantId/items', MenuController.getMenuItems);
router.get('/:restaurantId/categories', MenuController.getCategories);
router.post('/:restaurantId/items', upload.single('image'), MenuController.createMenuItem);
router.put('/items/:id', upload.single('image'), MenuController.updateMenuItem);
router.delete('/items/:id', MenuController.deleteMenuItem);

// Category management
router.post('/categories', MenuController.createCategory);

// Image upload
router.post('/upload-image', upload.single('image'), MenuController.uploadImage);

export default router;