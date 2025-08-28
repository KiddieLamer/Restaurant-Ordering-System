import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { io } from '../app';
import { v4 as uuidv4 } from 'uuid';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const { tableId, items, notes, customerName } = req.body;

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

        const itemTotal = menuItem.price * item.quantity;
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
          customerName,
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

      // Emit to different rooms with logging
      console.log(`📤 Emitting new-order to kitchen for order ${order.orderNumber}`);
      io.to('kitchen').emit('new-order', order);
      
      console.log(`📤 Emitting order-created to table-${tableId}`);
      io.to(`table-${tableId}`).emit('order-created', order);
      
      console.log(`📤 Emitting order-status-updated to order-${order.id} (status: ${order.status})`);
      io.to(`order-${order.id}`).emit('order-status-updated', {
        orderId: order.id,
        status: order.status
      });

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
          table: {
            include: {
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  logo: true
                }
              }
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

      // Reduce stock when order is confirmed
      if (status === 'CONFIRMED') {
        for (const orderItem of order.orderItems) {
          await prisma.menuItem.update({
            where: { id: orderItem.menuItemId },
            data: {
              stockQuantity: {
                decrement: orderItem.quantity
              }
            }
          });

          // Create stock movement record
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: orderItem.menuItemId }
          });

          if (menuItem) {
            await prisma.stockMovement.create({
              data: {
                type: 'OUT',
                quantity: orderItem.quantity,
                previousStock: menuItem.stockQuantity + orderItem.quantity,
                newStock: menuItem.stockQuantity,
                reason: `Order ${order.orderNumber} - ${orderItem.menuItem.name}`,
                menuItemId: orderItem.menuItemId,
                restaurantId: order.restaurantId,
                orderId: order.id
              }
            });
          }
        }
      }

      // Emit status updates with logging
      console.log(`🔄 Order ${order.orderNumber} status updated to: ${order.status}`);
      
      console.log(`📤 Emitting order-updated to kitchen`);
      io.to('kitchen').emit('order-updated', order);
      
      console.log(`📤 Emitting order-status-updated to table-${order.tableId}`);
      io.to(`table-${order.tableId}`).emit('order-status-updated', {
        orderId: order.id,
        status: order.status
      });
      
      console.log(`📤 Emitting order-status-updated to order-${order.id} (${order.status})`);
      io.to(`order-${order.id}`).emit('order-status-updated', {
        orderId: order.id,
        status: order.status
      });

      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  static async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentMethod, paymentId } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: { 
          paymentStatus, 
          paymentMethod: paymentMethod || null,
          paymentId: paymentId || null
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

      // Create cashflow entry when payment is successful
      if (paymentStatus === 'PAID') {
        await prisma.cashFlow.create({
          data: {
            type: 'INCOME',
            amount: order.totalAmount,
            description: `Payment for Order ${order.orderNumber}`,
            category: 'Sales',
            orderId: order.id,
            restaurantId: order.restaurantId
          }
        });

        console.log(`💰 Created cashflow entry for Order ${order.orderNumber}: Rp ${order.totalAmount.toLocaleString('id-ID')}`);
      }

      res.json(order);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ error: 'Failed to update payment status' });
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

  static async getRestaurantOrders(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { status, paymentStatus, limit = 50 } = req.query;

      const whereCondition: any = {
        restaurantId
      };

      if (status && status !== 'ALL') {
        whereCondition.status = status;
      }

      if (paymentStatus && paymentStatus !== 'ALL') {
        whereCondition.paymentStatus = paymentStatus;
      }

      const orders = await prisma.order.findMany({
        where: whereCondition,
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          },
          table: {
            include: {
              restaurant: {
                select: {
                  name: true,
                  description: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit as string)
      });

      res.json(orders);
    } catch (error) {
      console.error('Error getting restaurant orders:', error);
      res.status(500).json({ error: 'Failed to get restaurant orders' });
    }
  }
}