'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChefHat, Truck, CheckCircle, ArrowLeft, Bell } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  notes?: string;
  createdAt: string;
  table: {
    tableNumber: string;
    restaurant: {
      name: string;
      description?: string;
    };
  };
  orderItems: OrderItem[];
}

const statusConfig = {
  PENDING: {
    title: 'Pesanan Diterima',
    description: 'Pesanan Anda telah diterima dan menunggu konfirmasi',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    progressWidth: '20%'
  },
  CONFIRMED: {
    title: 'Pesanan Dikonfirmasi', 
    description: 'Pesanan Anda telah dikonfirmasi dan akan segera disiapkan',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    progressWidth: '40%'
  },
  PREPARING: {
    title: 'Sedang Disiapkan',
    description: 'Chef sedang menyiapkan makanan Anda dengan penuh cinta',
    icon: ChefHat,
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100',
    progressWidth: '70%'
  },
  READY: {
    title: 'Siap Diantar',
    description: 'Makanan sudah siap dan akan segera diantar ke meja Anda',
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100', 
    progressWidth: '90%'
  },
  SERVED: {
    title: 'Pesanan Selesai',
    description: 'Makanan telah diantar ke meja Anda. Selamat menikmati!',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    progressWidth: '100%'
  },
  CANCELLED: {
    title: 'Pesanan Dibatalkan',
    description: 'Maaf, pesanan Anda telah dibatalkan',
    icon: Clock,
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    progressWidth: '0%'
  }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchOrder();
    setupWebSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Order not found');
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError('Failed to load order information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const socketConnection = io('http://localhost:3001');
    setSocket(socketConnection);

    socketConnection.emit('join-order-tracking', orderId);
    
    socketConnection.on('order-status-updated', (data: { orderId: string; status: string }) => {
      if (data.orderId === orderId) {
        setOrder(prev => prev ? { ...prev, status: data.status as any } : null);
        
        // Add notification
        const statusInfo = statusConfig[data.status as keyof typeof statusConfig];
        const notification = `🔔 ${statusInfo.title}: ${statusInfo.description}`;
        setNotifications(prev => [notification, ...prev.slice(0, 4)]);
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Status Pesanan Update', {
            body: notification,
            icon: '/icon-192x192.png'
          });
        }
      }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error || 'Order not found'}</p>
          <Link 
            href="/"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status];
  const Icon = currentStatus.icon;

  const getStepStatus = (step: keyof typeof statusConfig) => {
    const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];
    const currentIndex = steps.indexOf(order.status);
    const stepIndex = steps.indexOf(step);
    
    if (order.status === 'CANCELLED') return 'cancelled';
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Track Pesanan</h1>
              <p className="text-sm text-gray-600">#{order.orderNumber}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Current Status */}
        <div className={`rounded-lg p-6 mb-6 ${currentStatus.bgColor}`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-white ${currentStatus.color}`}>
              <Icon size={32} />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${currentStatus.color}`}>
                {currentStatus.title}
              </h2>
              <p className="text-gray-700 mt-1">{currentStatus.description}</p>
              <p className="text-sm text-gray-600 mt-2">
                {order.table.restaurant.name} • Meja {order.table.tableNumber}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  order.status === 'CANCELLED' ? 'bg-red-400' : 'bg-blue-500'
                }`}
                style={{ width: currentStatus.progressWidth }}
              ></div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Status Timeline</h3>
          <div className="space-y-4">
            {(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] as const).map((step, index) => {
              const stepStatus = getStepStatus(step);
              const stepConfig = statusConfig[step];
              const StepIcon = stepConfig.icon;
              
              return (
                <div key={step} className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full border-2 ${
                    stepStatus === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                    stepStatus === 'current' ? `${stepConfig.bgColor} ${stepConfig.color} border-current` :
                    stepStatus === 'cancelled' ? 'bg-red-100 border-red-300 text-red-600' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <StepIcon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      stepStatus === 'completed' ? 'text-green-600' :
                      stepStatus === 'current' ? stepConfig.color :
                      stepStatus === 'cancelled' ? 'text-red-600' :
                      'text-gray-400'
                    }`}>
                      {stepConfig.title}
                    </p>
                    <p className="text-sm text-gray-500">{stepConfig.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Bell size={20} className="mr-2 text-blue-600" />
              Live Updates
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    index === 0 ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-400' :
                    'bg-gray-50 text-gray-700'
                  }`}
                >
                  {notification}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-600">
                    Rp {item.menuItem.price.toLocaleString('id-ID')} × {item.quantity}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 italic">Note: {item.notes}</p>
                  )}
                </div>
                <p className="font-semibold text-gray-900">
                  Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
            
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-900">Total:</p>
                <p className="font-bold text-xl text-blue-600">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </p>
              </div>
              <p className={`text-sm mt-1 ${
                order.paymentStatus === 'PAID' ? 'text-green-600' :
                order.paymentStatus === 'FAILED' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                Payment: {order.paymentStatus}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Catatan:</strong> {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}