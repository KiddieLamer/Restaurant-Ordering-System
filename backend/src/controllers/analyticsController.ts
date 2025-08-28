import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class AnalyticsController {
  static async getRestaurantAnalytics(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { period = '7days' } = req.query; // Default to 7 days
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Today's analytics
      const todayOrders = await prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          },
          paymentStatus: 'PAID'
        }
      });

      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const todayOrdersCount = todayOrders.length;

      // Monthly analytics
      const monthlyOrders = await prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          },
          paymentStatus: 'PAID'
        }
      });

      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const monthlyOrdersCount = monthlyOrders.length;

      // Top menu items (last 30 days)
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const topMenuItems = await prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: {
            restaurantId,
            createdAt: {
              gte: last30Days
            },
            paymentStatus: 'PAID'
          }
        },
        _sum: {
          quantity: true,
          price: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      });

      // Get menu item details for top items
      const topMenuItemsWithDetails = await Promise.all(
        topMenuItems.map(async (item) => {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId }
          });
          return {
            id: menuItem?.id || '',
            name: menuItem?.name || 'Unknown Item',
            description: menuItem?.description || '',
            image: menuItem?.image || null,
            price: menuItem?.price || 0,
            quantity: item._sum.quantity || 0,
            revenue: (item._sum.price || 0) * (item._sum.quantity || 0)
          };
        })
      );

      // Dynamic sales data based on period
      const dailySalesData = [];
      let daysToShow = 7;
      let intervalLabel = 'Daily';
      
      if (period === 'today') {
        daysToShow = 1;
        intervalLabel = 'Hourly';
      } else if (period === '7days') {
        daysToShow = 7;
        intervalLabel = 'Daily';
      } else if (period === '30days') {
        daysToShow = 30;
        intervalLabel = 'Daily';
      }

      if (period === 'today') {
        // Hourly data for today
        for (let i = 0; i < 24; i++) {
          const hourStart = new Date();
          hourStart.setHours(i, 0, 0, 0);
          const hourEnd = new Date();
          hourEnd.setHours(i, 59, 59, 999);

          const hourOrders = await prisma.order.findMany({
            where: {
              restaurantId,
              createdAt: {
                gte: hourStart,
                lte: hourEnd
              },
              paymentStatus: 'PAID'
            }
          });

          const revenue = hourOrders.reduce((sum, order) => sum + order.totalAmount, 0);
          dailySalesData.push({
            date: `${i.toString().padStart(2, '0')}:00`,
            revenue,
            orders: hourOrders.length,
            fullDate: hourStart.toISOString()
          });
        }
      } else {
        // Daily data for 7 days or 30 days
        for (let i = daysToShow - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const startOfDay = new Date(date.setHours(0, 0, 0, 0));
          const endOfDay = new Date(date.setHours(23, 59, 59, 999));

          const dayOrders = await prisma.order.findMany({
            where: {
              restaurantId,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay
              },
              paymentStatus: 'PAID'
            }
          });

          const revenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
          dailySalesData.push({
            date: startOfDay.toISOString().split('T')[0],
            revenue,
            orders: dayOrders.length,
            fullDate: startOfDay.toISOString()
          });
        }
      }

      // Cashflow summary
      const totalIncome = await prisma.cashFlow.aggregate({
        where: {
          restaurantId,
          type: 'INCOME',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amount: true
        }
      });

      const totalExpense = await prisma.cashFlow.aggregate({
        where: {
          restaurantId,
          type: 'EXPENSE',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amount: true
        }
      });

      const netIncome = (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0);

      // Low stock items
      const lowStockItems = await prisma.menuItem.findMany({
        where: {
          restaurantId,
          stockQuantity: {
            lte: prisma.menuItem.fields.minStockAlert
          },
          isAvailable: true
        },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          minStockAlert: true,
          unit: true
        }
      });

      const analytics = {
        todayRevenue,
        todayOrders: todayOrdersCount,
        monthlyRevenue,
        monthlyOrders: monthlyOrdersCount,
        topMenuItems: topMenuItemsWithDetails,
        dailySales: dailySalesData,
        salesPeriod: period,
        intervalLabel,
        cashflow: {
          income: totalIncome._sum.amount || 0,
          expense: totalExpense._sum.amount || 0,
          netIncome
        },
        lowStockItems
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  static async getCashFlowHistory(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate, type } = req.query;

      const whereCondition: any = {
        restaurantId
      };

      if (startDate && endDate) {
        whereCondition.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      if (type && (type === 'INCOME' || type === 'EXPENSE')) {
        whereCondition.type = type;
      }

      const cashFlows = await prisma.cashFlow.findMany({
        where: whereCondition,
        include: {
          order: {
            select: {
              orderNumber: true
            }
          },
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(cashFlows);
    } catch (error) {
      console.error('Error fetching cashflow history:', error);
      res.status(500).json({ error: 'Failed to fetch cashflow history' });
    }
  }

  static async addCashFlowEntry(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { type, amount, description, category } = req.body;

      const cashFlow = await prisma.cashFlow.create({
        data: {
          type,
          amount,
          description,
          category,
          restaurantId
        }
      });

      res.json(cashFlow);
    } catch (error) {
      console.error('Error adding cashflow entry:', error);
      res.status(500).json({ error: 'Failed to add cashflow entry' });
    }
  }

  static async getStockStatus(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;

      const stockItems = await prisma.menuItem.findMany({
        where: {
          restaurantId,
          isAvailable: true
        },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          minStockAlert: true,
          unit: true,
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          stockQuantity: 'asc'
        }
      });

      const lowStockCount = stockItems.filter(item => 
        item.stockQuantity <= item.minStockAlert
      ).length;

      const outOfStockCount = stockItems.filter(item => 
        item.stockQuantity === 0
      ).length;

      res.json({
        items: stockItems,
        summary: {
          totalItems: stockItems.length,
          lowStockCount,
          outOfStockCount
        }
      });
    } catch (error) {
      console.error('Error fetching stock status:', error);
      res.status(500).json({ error: 'Failed to fetch stock status' });
    }
  }

  static async updateStock(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { menuItemId, type, quantity, reason } = req.body;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId }
      });

      if (!menuItem || menuItem.restaurantId !== restaurantId) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      let newStock = menuItem.stockQuantity;
      
      if (type === 'IN') {
        newStock += quantity;
      } else if (type === 'OUT') {
        newStock = Math.max(0, newStock - quantity);
      } else if (type === 'ADJUSTMENT') {
        newStock = quantity;
      }

      // Update menu item stock
      const updatedMenuItem = await prisma.menuItem.update({
        where: { id: menuItemId },
        data: { stockQuantity: newStock }
      });

      // Create stock movement record
      await prisma.stockMovement.create({
        data: {
          type,
          quantity,
          previousStock: menuItem.stockQuantity,
          newStock,
          reason,
          menuItemId,
          restaurantId
        }
      });

      res.json(updatedMenuItem);
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  }

  static async getStockMovements(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { menuItemId, startDate, endDate } = req.query;

      const whereCondition: any = {
        restaurantId
      };

      if (menuItemId) {
        whereCondition.menuItemId = menuItemId as string;
      }

      if (startDate && endDate) {
        whereCondition.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const movements = await prisma.stockMovement.findMany({
        where: whereCondition,
        include: {
          menuItem: {
            select: {
              name: true,
              unit: true
            }
          },
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      res.json(movements);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      res.status(500).json({ error: 'Failed to fetch stock movements' });
    }
  }

  static async getSplashData(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      
      // Get restaurant info
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId }
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Get top menu items from last 30 days
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const topMenuItems = await prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: {
            restaurantId,
            createdAt: {
              gte: last30Days
            },
            paymentStatus: 'PAID'
          }
        },
        _sum: {
          quantity: true,
          price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      });

      // Get menu item details for top items
      const topMenuItemsWithDetails = await Promise.all(
        topMenuItems.map(async (item) => {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
            include: {
              category: {
                select: {
                  name: true
                }
              }
            }
          });
          return {
            id: menuItem?.id || '',
            name: menuItem?.name || 'Unknown Item',
            description: menuItem?.description || '',
            image: menuItem?.image || null,
            price: menuItem?.price || 0,
            category: menuItem?.category?.name || '',
            quantity: item._sum.quantity || 0,
            revenue: (item._sum.price || 0) * (item._sum.quantity || 0)
          };
        })
      );

      // If no orders yet, get some popular items
      let featuredItems = topMenuItemsWithDetails;
      if (featuredItems.length === 0) {
        const popularItems = await prisma.menuItem.findMany({
          where: {
            restaurantId,
            isAvailable: true,
            image: {
              not: null
            }
          },
          include: {
            category: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            price: 'desc'
          },
          take: 5
        });

        featuredItems = popularItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          image: item.image,
          price: item.price,
          category: item.category?.name || '',
          quantity: 0,
          revenue: 0
        }));
      }

      const splashData = {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          description: restaurant.description,
          logo: restaurant.logo
        },
        featuredItems: featuredItems.slice(0, 3), // Show top 3 for splash
        totalOrders: await prisma.order.count({
          where: {
            restaurantId,
            paymentStatus: 'PAID'
          }
        })
      };

      res.json(splashData);
    } catch (error) {
      console.error('Error fetching splash data:', error);
      res.status(500).json({ error: 'Failed to fetch splash data' });
    }
  }
}