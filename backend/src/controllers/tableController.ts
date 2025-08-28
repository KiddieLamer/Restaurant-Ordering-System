import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { QRService } from '../services/qrService';

export class TableController {
  static async createTable(req: Request, res: Response) {
    try {
      const { tableNumber, restaurantId } = req.body;

      const existingTable = await prisma.table.findUnique({
        where: {
          restaurantId_tableNumber: {
            restaurantId,
            tableNumber
          }
        }
      });

      if (existingTable) {
        return res.status(400).json({ error: 'Table number already exists' });
      }

      const qrCode = await QRService.generateTableQRString(restaurantId, tableNumber);

      const table = await prisma.table.create({
        data: {
          tableNumber,
          restaurantId,
          qrCode
        }
      });

      res.json(table);
    } catch (error) {
      console.error('Error creating table:', error);
      res.status(500).json({ error: 'Failed to create table' });
    }
  }

  static async getTable(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const table = await prisma.table.findUnique({
        where: { id },
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
      });

      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      res.json(table);
    } catch (error) {
      console.error('Error getting table:', error);
      res.status(500).json({ error: 'Failed to get table' });
    }
  }

  static async generateQR(req: Request, res: Response) {
    try {
      const { restaurantId, tableNumber } = req.params;

      const table = await prisma.table.findUnique({
        where: {
          restaurantId_tableNumber: {
            restaurantId,
            tableNumber
          }
        }
      });

      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      const qrCodeImage = await QRService.generateTableQR(restaurantId, tableNumber);
      const qrCodeUrl = await QRService.generateTableQRString(restaurantId, tableNumber);

      res.json({
        qrCodeImage,
        qrCodeUrl,
        table: {
          id: table.id,
          tableNumber: table.tableNumber,
          restaurantId: table.restaurantId
        }
      });
    } catch (error) {
      console.error('Error generating QR:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  }

  static async getTableByQR(req: Request, res: Response) {
    try {
      const { restaurantId, tableNumber } = req.params;
      const { session } = req.query;

      const table = await prisma.table.findUnique({
        where: {
          restaurantId_tableNumber: {
            restaurantId,
            tableNumber
          }
        },
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
      });

      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      if (!table.isActive) {
        return res.status(400).json({ error: 'Table is not active' });
      }

      res.json({
        table,
        sessionId: session
      });
    } catch (error) {
      console.error('Error getting table by QR:', error);
      res.status(500).json({ error: 'Failed to get table' });
    }
  }
}