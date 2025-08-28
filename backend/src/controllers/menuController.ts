import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

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

  static async createMenuItem(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        price,
        image,
        categoryId,
        restaurantId,
        sortOrder
      } = req.body;

      const menuItem = await prisma.menuItem.create({
        data: {
          name,
          description,
          price,
          image,
          categoryId,
          restaurantId,
          sortOrder: sortOrder || 0
        }
      });

      res.json(menuItem);
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  }

  static async updateMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const menuItem = await prisma.menuItem.update({
        where: { id },
        data: updateData
      });

      res.json(menuItem);
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  }

  static async deleteMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.menuItem.update({
        where: { id },
        data: { isAvailable: false }
      });

      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  }
}