import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export class QRService {
  static async generateTableQR(restaurantId: string, tableNumber: string): Promise<string> {
    const sessionId = uuidv4();
    const qrData = {
      restaurantId,
      tableNumber,
      sessionId,
      type: 'table',
      timestamp: new Date().toISOString()
    };

    const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    return qrCodeString;
  }

  static async generateTableQRString(restaurantId: string, tableNumber: string): Promise<string> {
    const sessionId = uuidv4();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrUrl = `${baseUrl}/welcome/${restaurantId}/${tableNumber}?session=${sessionId}`;
    
    return qrUrl;
  }

  static parseQRData(qrString: string): any {
    try {
      return JSON.parse(qrString);
    } catch (error) {
      if (qrString.includes('/order/')) {
        const urlParts = qrString.split('/');
        const restaurantId = urlParts[urlParts.length - 2];
        const tableParams = urlParts[urlParts.length - 1];
        const [tableNumber, queryString] = tableParams.split('?');
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('session');

        return {
          restaurantId,
          tableNumber,
          sessionId,
          type: 'table',
          timestamp: new Date().toISOString()
        };
      }
      throw new Error('Invalid QR code format');
    }
  }
}