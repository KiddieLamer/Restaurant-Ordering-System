import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/menu-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export class MenuController {
  static async getMenu(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;

      const categories = await prisma.category.findMany({
        where: {
          restaurantId,
          isActive: true
        },
        include: {
          menuItems: {
            where: {
              isAvailable: true
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });

      res.json(categories);
    } catch (error) {
      console.error('Error getting menu:', error);
      res.status(500).json({ error: 'Failed to get menu' });
    }
  }

  static async getMenuItems(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { categoryId } = req.query;

      const whereCondition: any = {
        restaurantId
      };

      if (categoryId) {
        whereCondition.categoryId = categoryId as string;
      }

      const menuItems = await prisma.menuItem.findMany({
        where: whereCondition,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { categoryId: 'asc' },
          { sortOrder: 'asc' }
        ]
      });

      res.json(menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, description, restaurantId, sortOrder } = req.body;

      const category = await prisma.category.create({
        data: {
          name,
          description,
          restaurantId,
          sortOrder: sortOrder || 0
        }
      });

      res.json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  static async createMenuItem(req: MulterRequest, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { 
        name, 
        description, 
        price, 
        categoryId, 
        isAvailable = true,
        stockQuantity = 0,
        minStockAlert = 5,
        unit = 'porsi',
        sortOrder = 0
      } = req.body;

      let imagePath = null;
      if (req.file) {
        imagePath = `/uploads/menu-images/${req.file.filename}`;
      }

      const menuItem = await prisma.menuItem.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          image: imagePath,
          isAvailable: isAvailable === 'true' || isAvailable === true,
          categoryId,
          restaurantId,
          stockQuantity: parseInt(stockQuantity),
          minStockAlert: parseInt(minStockAlert),
          unit,
          sortOrder: parseInt(sortOrder)
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      console.log(`✅ Created menu item: ${menuItem.name} with image: ${imagePath || 'no image'}`);
      res.json(menuItem);
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  }

  static async updateMenuItem(req: MulterRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        name, 
        description, 
        price, 
        categoryId, 
        isAvailable,
        stockQuantity,
        minStockAlert,
        unit,
        sortOrder
      } = req.body;

      // Get current menu item to handle image update
      const currentMenuItem = await prisma.menuItem.findUnique({
        where: { id }
      });

      if (!currentMenuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      let imagePath = currentMenuItem.image;
      
      // If new image uploaded, delete old one and use new one
      if (req.file) {
        // Delete old image file if it exists
        if (currentMenuItem.image) {
          const oldImagePath = path.join(process.cwd(), currentMenuItem.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        imagePath = `/uploads/menu-images/${req.file.filename}`;
      }

      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true;
      if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
      if (minStockAlert !== undefined) updateData.minStockAlert = parseInt(minStockAlert);
      if (unit !== undefined) updateData.unit = unit;
      if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
      if (imagePath !== currentMenuItem.image) updateData.image = imagePath;

      const menuItem = await prisma.menuItem.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      console.log(`✅ Updated menu item: ${menuItem.name}`);
      res.json(menuItem);
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  }

  static async deleteMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id }
      });

      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      // Delete image file if it exists
      if (menuItem.image) {
        const imagePath = path.join(process.cwd(), menuItem.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await prisma.menuItem.delete({
        where: { id }
      });

      console.log(`🗑️ Deleted menu item: ${menuItem.name}`);
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;

      const categories = await prisma.category.findMany({
        where: {
          restaurantId,
          isActive: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });

      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  static async uploadImage(req: MulterRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imagePath = `/uploads/menu-images/${req.file.filename}`;
      console.log(`📸 Image uploaded: ${imagePath}`);
      
      res.json({
        message: 'Image uploaded successfully',
        imagePath: imagePath,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
}