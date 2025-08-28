import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { io } from '../app';
import { v4 as uuidv4 } from 'uuid';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const { tableId, items, notes } = req.body;

      const table = await prisma.table.findUnique({
        where: { id: tableId },
        include: { restaurant: true }
      });

      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        });

        if (!menuItem || !menuItem.isAvailable) {
          return res.status(400).json({ 
            error: `Menu item ${item.menuItemId} is not available` 
          });
        }

        const itemTotal = menuItem.price.toNumber() * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          notes: item.notes || null
        });
      }

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          totalAmount,
          notes,
          tableId,
          restaurantId: table.restaurantId,
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          },
          table: true
        }
      });

      io.to('kitchen').emit('new-order', order);
      io.to(`table-${tableId}`).emit('order-created', order);

      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          },
          table: true,
          restaurant: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          },
          table: true
        }
      });

      io.to('kitchen').emit('order-updated', order);
      io.to(`table-${order.tableId}`).emit('order-status-updated', {
        orderId: order.id,
        status: order.status
      });

      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  static async getKitchenOrders(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;

      const orders = await prisma.order.findMany({
        where: {
          restaurantId,
          status: {
            in: ['CONFIRMED', 'PREPARING']
          }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          },
          table: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      res.json(orders);
    } catch (error) {
      console.error('Error getting kitchen orders:', error);
      res.status(500).json({ error: 'Failed to get kitchen orders' });
    }
  }

  static async getTableOrders(req: Request, res: Response) {
    try {
      const { tableId } = req.params;

      const orders = await prisma.order.findMany({
        where: { tableId },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(orders);
    } catch (error) {
      console.error('Error getting table orders:', error);
      res.status(500).json({ error: 'Failed to get table orders' });
    }
  }
}